"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import { setLocale } from "@/lib/i18n";
import { startAudioRecording, speakText } from "@/lib/speech";
import { dbMock, MockProfile, MockSkillPassport, MockSkill } from "@/lib/dbMock";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
];

const SKILL_KEYWORDS = [
  { keywords: ["wiring", "electrician", "power", "वायरींग", "इलेक्ट्रिशियन", "लाईट", "बिजली", "वायरमन"], skill: "Wiring", level: "Expert" },
  { keywords: ["maintenance", "troubleshoot", "दुरुस्ती", "मेंटेनन्स", "मशीन", "सुधारणा"], skill: "Electrical Maintenance", level: "Expert" },
  { keywords: ["safety", "protocol", "loto", "सुरक्षा", "सेफ्टी", "नियमावली"], skill: "Safety Protocols", level: "Intermediate" },
  { keywords: ["fault", "repair", "दोष", "तपासणी"], skill: "Troubleshooting", level: "Intermediate" },
  { keywords: ["welding", "welder", "वेल्डिंग", "वेल्डर", "जोडकाम"], skill: "Welding", level: "Expert" },
  { keywords: ["blueprint", "diagram", "नकाशा", "ड्रॉइंग"], skill: "Blueprints", level: "Intermediate" },
  { keywords: ["fabrication", "metal", "लोखंड", "फेब्रिकेशन", "धातू"], skill: "Metal Fabrication", level: "Expert" },
  { keywords: ["grinding", "grinder", "घासणे", "ग्राइंडिंग"], skill: "Grinding", level: "Intermediate" },
  { keywords: ["billing", "cashier", "बिलिंग", "कॅशियर", "पैसे", "रोकड"], skill: "Billing & Cashiering", level: "Expert" },
  { keywords: ["inventory", "stock", "माल", "साठा", "इन्व्हेंटरी"], skill: "Inventory Management", level: "Intermediate" },
  { keywords: ["sales", "sell", "काउंटर", "दुकान", "काऊंटर", "विक्री", "ग्राहक"], skill: "Sales", level: "Expert" },
  { keywords: ["customer", "relation", "मदत", "सेवा"], skill: "Customer Relations", level: "Expert" },
  { keywords: ["support", "calling", "bpo", "कॉलिंग", "कस्टमर", "फोन", "मदत"], skill: "Communication", level: "Expert" },
  { keywords: ["problem", "solve", "समस्या", "निवारण"], skill: "Problem Solving", level: "Intermediate" },
  { keywords: ["typing", "data entry", "excel", "टायपिंग", "डेटा एंट्री", "एक्सेल"], skill: "Data Entry", level: "Intermediate" },
  { keywords: ["delivery", "डिलिव्हरी", "पार्सल", "पोहोचवणे"], skill: "Route Navigation", level: "Expert" },
  { keywords: ["driving", "vehicle", "गाडी", "ड्रायव्हिंग", "चालवणे"], skill: "Driving", level: "Expert" }
];

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const locale = useLocale();
  const router = useRouter();

  // Stepper state
  const [step, setStep] = useState(1);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedState, setSelectedState] = useState("");
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingStopFn, setRecordingStopFn] = useState<(() => void) | null>(null);

  // Statuses
  const [submitting, setSubmitting] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<MockSkill[]>([]);

  // Speech duration timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Handle live skill extraction when transcribed text changes
  useEffect(() => {
    if (!transcribedText.trim()) {
      setExtractedSkills([]);
      return;
    }
    const lowercaseIntro = transcribedText.toLowerCase();
    const skills: MockSkill[] = SKILL_KEYWORDS.filter((sk) =>
      sk.keywords.some((keyword) => lowercaseIntro.includes(keyword))
    ).map((sk) => ({
      name: sk.skill,
      proficiency: sk.level,
      status: "AI_VERIFIED"
    }));

    // Remove duplicates
    const uniqueSkillsMap = new Map<string, MockSkill>();
    skills.forEach(s => {
      uniqueSkillsMap.set(s.name, s);
    });
    const uniqueSkills = Array.from(uniqueSkillsMap.values());

    if (uniqueSkills.length === 0) {
      uniqueSkills.push({
        name: "Communication",
        proficiency: "Expert",
        status: "SELF_REPORTED"
      });
    }
    setExtractedSkills(uniqueSkills);
  }, [transcribedText]);

  const handleLanguageSelect = (lang: string) => {
    setLocale(lang);
  };

  const handleStartRecording = async () => {
    try {
      setAudioUrl(null);
      setAudioBlob(null);
      setTranscribedText("");
      const recorder = await startAudioRecording((blob) => {
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));

        // Start simulated transcription
        setTranscribing(true);
        setTimeout(() => {
          let text = "";
          if (locale === 'hi') {
            text = `मेरा नाम ${fullName || "राहुल कुमार"} है। मैं ${selectedState || "Maharashtra"} से हूँ। मैंने आईटीआई इलेक्ट्रिशियन का कोर्स किया है और मुझे हाउस वायरिंग, इलेक्ट्रिकल मेंटेनन्स, और सेफ्टी प्रोटोकॉल का व्यावहारिक अनुभव है। मैं हिंदी और मराठी बोल सकता हूँ।`;
          } else if (locale === 'mr') {
            text = `माझे नाव ${fullName || "राहुल घाडगे"} आहे. मी ${selectedState || "Maharashtra"} मधून आलो आहे. मी आयटीआय इलेक्ट्रिशियन असून मला हाऊस वायरींग, इलेक्ट्रिकल मेंटेनन्स आणि सेफ्टीचे ज्ञान आहे. मी मराठी आणि हिंदी दोन्ही बोलू शकतो.`;
          } else {
            text = `My name is ${fullName || "Rahul Ghadge"}. I am from ${selectedState || "Maharashtra"}. I have trained as an ITI electrician. I have experience in house wiring, electrical maintenance, troubleshooting, and safety protocols. I speak Marathi and Hindi.`;
          }
          setTranscribedText(text);
          setTranscribing(false);
        }, 1500);
      });
      setRecordingStopFn(() => recorder.stop);
      setIsRecording(true);
      
      const introText = locale === 'hi'
        ? "नमस्ते, अपने बारे में बताएं। शुरू करें।"
        : locale === 'mr'
        ? "नमस्कार, स्वतःबद्दल सांगा. सुरू करा."
        : "Hello, please introduce yourself now.";
      speakText(introText, locale);
    } catch (e: any) {
      alert(t("errors.audioPermission") || e.message);
    }
  };

  const handleStopRecording = () => {
    if (recordingStopFn) {
      recordingStopFn();
    }
    setIsRecording(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !selectedState) {
      alert("Please fill in your name and state.");
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const profileId = "prof-" + Math.random().toString(36).substring(2, 9);
    const mockProfile: MockProfile = {
      id: profileId,
      fullName,
      phone: phone || "+91 98765 43210",
      bio: transcribedText || (locale === "mr" ? `मी ${fullName} आहे. मी ${selectedState} राज्यातील आहे.` : `I am ${fullName} from ${selectedState}.`),
      preferredLanguage: locale,
      languages: locale === "mr" ? ["mr", "hi"] : locale === "hi" ? ["hi", "mr"] : ["en", "hi"],
      state: selectedState,
      isVerified: true
    };
    dbMock.saveProfile(mockProfile);

    const mockPassport: MockSkillPassport = {
      id: "pass-" + Math.random().toString(36).substring(2, 9),
      profileId: profileId,
      skills: extractedSkills,
      readinessScore: 75.0, 
      verificationLevel: "AI_VERIFIED"
    };
    dbMock.saveSkillPassport(mockPassport);

    setSubmitting(false);
    router.push("/passport");
  };

  return (
    <div className="flex flex-col min-h-screen text-gray-900 dark:text-white font-sans selection:bg-violet-500/30">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col justify-center animate-fadeIn">
        {/* Stepper Status Bar */}
        <div className="flex justify-between items-center mb-8 max-w-md mx-auto w-full px-6 select-none">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => step > s && setStep(s)}
                disabled={step <= s}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  step === s
                    ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white ring-4 ring-violet-500/20 scale-110"
                    : step > s
                    ? "bg-emerald-500 text-white cursor-pointer"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                }`}
              >
                {step > s ? "✓" : s}
              </button>
              {s < 3 && (
                <div className={`h-1 flex-1 mx-2 rounded-full transition-colors duration-300 ${
                  step > s ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-800"
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-panel border border-gray-200/50 dark:border-violet-950/20 shadow-2xl rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {step === 1 && t("title")}
              {step === 2 && "Tell us about yourself"}
              {step === 3 && "Record Voice Introduction"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base font-semibold leading-relaxed">
              {step === 1 && t("subtitle")}
              {step === 2 && "Enter your contact details and home state to matching jobs nearby."}
              {step === 3 && "Introduce yourself in your preferred language to extract verified skills immediately."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Language Card Select */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <label className="text-xs font-black tracking-widest uppercase text-violet-500 dark:text-violet-400 font-mono block text-center">
                  {t("selectLanguage")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { code: "en", label: "English", native: "English", desc: "For global roles" },
                    { code: "hi", label: "हिंदी", native: "Hindi", desc: "उत्तर भारत के लिए" },
                    { code: "mr", label: "मराठी", native: "Marathi", desc: "महाराष्ट्रासाठी खास" }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`p-6 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        locale === lang.code
                          ? "border-violet-500 bg-gradient-to-br from-violet-50 to-blue-50/50 dark:from-violet-950/20 dark:to-blue-950/20 shadow-md scale-[1.02] border-2"
                          : "border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/20 hover:border-violet-300 dark:hover:border-violet-900"
                      }`}
                    >
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{lang.label}</span>
                      <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">{lang.native}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{lang.desc}</span>
                    </button>
                  ))}
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/10 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Profile Fields */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="p-3.5 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-850 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none dark:text-white font-semibold transition"
                      placeholder="Rahul Ghadge"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="p-3.5 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-850 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none dark:text-white font-semibold transition"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("selectState")}
                  </label>
                  <select
                    required
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="p-3.5 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-850 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none dark:text-white font-bold transition cursor-pointer"
                  >
                    <option value="" className="text-gray-500">{t("placeholderState")}</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state} className="dark:bg-gray-900 dark:text-white font-semibold">
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3.5 bg-gray-100 dark:bg-gray-850 text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!fullName || !selectedState) {
                        alert("Please fill in your name and state.");
                        return;
                      }
                      setStep(3);
                    }}
                    className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Voice Intro Recorder */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-6 bg-white/30 dark:bg-violet-950/5 border border-gray-200/50 dark:border-violet-500/10 rounded-3xl space-y-4">
                  <div className="text-center space-y-1">
                    <h3 className="font-bold text-lg">{t("recordIntro")}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold max-w-md mx-auto">
                      {t("recordIntroHelp")}
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center py-6 space-y-4 select-none">
                    {isRecording ? (
                      <div className="flex flex-col items-center space-y-4">
                        {/* Glowing recording pulse circle */}
                        <div className="w-18 h-18 rounded-full bg-red-500 flex items-center justify-center text-white text-xl shadow-lg mic-pulse cursor-pointer" onClick={handleStopRecording}>
                          🛑
                        </div>
                        <span className="text-sm font-extrabold text-red-500 animate-pulse">
                          Recording: {recordingDuration}s
                        </span>
                      </div>
                    ) : transcribing ? (
                      <div className="flex flex-col items-center space-y-4 py-2">
                        {/* Audio Waveform mock */}
                        <div className="flex gap-1 items-end justify-center h-8">
                          <span className="wave-bar" />
                          <span className="wave-bar" />
                          <span className="wave-bar" />
                          <span className="wave-bar" />
                          <span className="wave-bar" />
                          <span className="wave-bar" />
                          <span className="wave-bar" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                          🎙️ Transcribing voice in {locale === "mr" ? "मराठी" : locale === "hi" ? "हिंदी" : "English"}...
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-3">
                        <button
                          type="button"
                          onClick={handleStartRecording}
                          className="w-18 h-18 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white flex items-center justify-center text-2xl shadow-xl hover:shadow-violet-500/20 hover:scale-[1.05] active:scale-[0.95] transition cursor-pointer"
                          title="Start Recording"
                        >
                          🎙️
                        </button>
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                          Click to Speak
                        </span>
                        {audioUrl && (
                          <div className="w-full max-w-xs pt-2">
                            <audio src={audioUrl} controls className="w-full h-8" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Editable Transcript Area */}
                  {transcribedText && (
                    <div className="space-y-4 pt-4 border-t border-gray-150 dark:border-gray-800 animate-fadeIn">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest font-mono">
                          📝 Transcript (Edit if needed)
                        </label>
                        <textarea
                          value={transcribedText}
                          onChange={(e) => setTranscribedText(e.target.value)}
                          className="w-full h-28 p-4 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-850 rounded-2xl text-sm leading-relaxed focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none dark:text-white font-medium"
                          placeholder="Type or modify your introduction here..."
                        />
                      </div>

                      {/* Live Extracted Skills */}
                      <div className="p-4 bg-violet-50/50 dark:bg-violet-950/10 border border-violet-100/50 dark:border-violet-900/35 rounded-2xl space-y-2">
                        <span className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider block">
                          ⚡ Extracted Skills (Live AI Extraction)
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {extractedSkills.map((sk, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-white dark:bg-gray-900 text-xs font-bold rounded-xl text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800 flex items-center gap-1.5 shadow-sm"
                            >
                              🛠️ {sk.name}
                              <span className="text-[9px] px-1.5 py-0.5 bg-violet-50 dark:bg-violet-950 rounded font-black">
                                {sk.proficiency}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3.5 bg-gray-100 dark:bg-gray-850 text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3.5 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? t("submitting") : t("submit")}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
