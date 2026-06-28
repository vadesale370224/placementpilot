// src/lib/dbMock.ts

export interface MockProfile {
  id: string;
  fullName: string;
  phone: string;
  bio: string;
  avatarUrl?: string;
  companyName?: string;
  preferredLanguage: string;
  languages: string[];
  state: string;
  isVerified: boolean;
  collegeName?: string;
  degree?: string;
  branch?: string;
  year?: string;
  cgpa?: string;
  preferredRole?: string;
  preferredLocation?: string;
  expectedSalary?: string;
  employmentType?: string;
  resumeUrl?: string;
  originalTranscript?: string;
  extractedFields?: string; // stringified JSON
  extractionConfidence?: number;
  onboardingCompleted?: boolean;
}

export interface MockSkill {
  name: string;
  proficiency: string; // 'Beginner' | 'Intermediate' | 'Expert'
  status: 'SELF_REPORTED' | 'AI_VERIFIED' | 'INSTITUTE_VERIFIED' | 'EMPLOYER_VERIFIED';
}

export interface MockSkillPassport {
  id: string;
  profileId: string;
  skills: MockSkill[];
  readinessScore: number;
  verificationLevel: 'SELF_REPORTED' | 'AI_VERIFIED' | 'INSTITUTE_VERIFIED' | 'EMPLOYER_VERIFIED';
}

export interface MockJobListing {
  id: string;
  employerId: string;
  title: string;
  companyName: string;
  description: string;
  requirements: string[];
  requiredLanguages: string[];
  location: string;
  salary: string;
  status: string;
}

export interface MockApplication {
  id: string;
  jobId: string;
  jobSeekerId: string;
  status: string;
  createdAt: string;
}

export interface MockMatchResult {
  id: string;
  jobListingId: string;
  profileId: string;
  score: number;
  matchDetails: {
    skillsMatched: string[];
    missingSkills: string[];
    languagesMatched: string[];
    missingLanguages: string[];
    stateMatch: boolean;
    explanation: string;
  };
}

export interface MockInterviewSession {
  id: string;
  applicationId?: string;
  profileId: string;
  topic: string;
  status: string;
  scheduledAt: string;
  feedback?: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    detailedFeedback: string;
  };
  transcript?: string;
}

// 5 Realistic seeded job listings for the Indian context (MVP)
const DEFAULT_JOBS: MockJobListing[] = [
  {
    id: "job-electrician",
    employerId: "emp-shree",
    title: "Industrial Electrician / औद्योगिक इलेक्ट्रिशियन",
    companyName: "Shree Electricals & Power Ltd",
    description: "Looking for an ITI-qualified Electrician to handle machinery wiring, control panels, electrical maintenance, and general troubleshooting in our manufacturing plant. Knowledge of industrial safety protocols is mandatory.",
    requirements: ["Wiring", "Electrical Maintenance", "Troubleshooting", "Safety Protocols"],
    requiredLanguages: ["hi", "mr"],
    location: "Mumbai, Maharashtra",
    salary: "₹18,000 - ₹25,000 / month",
    status: "OPEN"
  },
  {
    id: "job-welder",
    employerId: "emp-lt",
    title: "MIG/TIG Welder / वेल्डर",
    companyName: "L&T Heavy Engineering",
    description: "Experienced structural MIG and TIG welder needed. Must read blue-prints, perform metal fabrication, grinding, and maintain welding equipment. High focus on safety.",
    requirements: ["Welding", "Blueprints", "Metal Fabrication", "Grinding"],
    requiredLanguages: ["hi"],
    location: "Pune, Maharashtra",
    salary: "₹20,000 - ₹28,000 / month",
    status: "OPEN"
  },
  {
    id: "job-retail",
    employerId: "emp-reliance",
    title: "Retail Sales Associate / रिटेल असोसिएट",
    companyName: "Reliance Retail India",
    description: "Assist retail customers, handle cashiering & billing using systems, maintain stock inventory levels, and drive counter sales. Speaks fluent local languages.",
    requirements: ["Customer Relations", "Billing & Cashiering", "Inventory Management", "Sales"],
    requiredLanguages: ["mr", "en"],
    location: "Pune, Maharashtra",
    salary: "₹15,000 - ₹20,000 / month",
    status: "OPEN"
  },
  {
    id: "job-support",
    employerId: "emp-tata",
    title: "Customer Support Executive / कस्टमर सपोर्ट",
    companyName: "Tata Communications BPO",
    description: "Answer calls, resolve subscriber tickets, verify consumer data, and handle telecalling. Must possess excellent communication and typing skills in English, Hindi, and Marathi.",
    requirements: ["Communication", "Problem Solving", "Data Entry", "Call Handling"],
    requiredLanguages: ["en", "hi", "mr"],
    location: "Mumbai, Maharashtra",
    salary: "₹22,000 - ₹30,000 / month",
    status: "OPEN"
  },
  {
    id: "job-delivery",
    employerId: "emp-swiggy",
    title: "Delivery Executive / डिलिव्हरी एक्झिक्युटिव्ह",
    companyName: "Swiggy Express Logistics",
    description: "Partner with Swiggy to deliver food and packages. Requires smart route navigation using phone maps, active time management, positive customer interactions, and safe driving.",
    requirements: ["Route Navigation", "Time Management", "Customer Interaction", "Driving"],
    requiredLanguages: ["mr", "hi"],
    location: "Nagpur, Maharashtra",
    salary: "₹18,000 - ₹24,000 / month",
    status: "OPEN"
  }
];

class DBMock {
  private isClient = typeof window !== "undefined";

  private getStorageItem<T>(key: string, defaultValue: T): T {
    if (!this.isClient) return defaultValue;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  private setStorageItem<T>(key: string, value: T): void {
    if (!this.isClient) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  getProfile(): MockProfile | null {
    return this.getStorageItem<MockProfile | null>("pp_profile", null);
  }

  saveProfile(profile: MockProfile): void {
    this.setStorageItem("pp_profile", profile);
  }

  getSkillPassport(): MockSkillPassport | null {
    return this.getStorageItem<MockSkillPassport | null>("pp_passport", null);
  }

  saveSkillPassport(passport: MockSkillPassport): void {
    this.setStorageItem("pp_passport", passport);
  }

  getJobListings(): MockJobListing[] {
    return DEFAULT_JOBS;
  }

  getApplications(): MockApplication[] {
    return this.getStorageItem<MockApplication[]>("pp_applications", []);
  }

  saveApplication(app: MockApplication): void {
    const apps = this.getApplications();
    apps.push(app);
    this.setStorageItem("pp_applications", apps);
  }

  getMatchResults(): MockMatchResult[] {
    return this.getStorageItem<MockMatchResult[]>("pp_match_results", []);
  }

  saveMatchResults(results: MockMatchResult[]): void {
    this.setStorageItem("pp_match_results", results);
  }

  getInterviewSessions(): MockInterviewSession[] {
    return this.getStorageItem<MockInterviewSession[]>("pp_interviews", []);
  }

  saveInterviewSession(session: MockInterviewSession): void {
    const sessions = this.getInterviewSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index !== -1) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    this.setStorageItem("pp_interviews", sessions);
  }

  clearAll(): void {
    if (!this.isClient) return;
    localStorage.removeItem("pp_profile");
    localStorage.removeItem("pp_passport");
    localStorage.removeItem("pp_applications");
    localStorage.removeItem("pp_match_results");
    localStorage.removeItem("pp_interviews");
  }

  preloadDemoData(): void {
    const profileId = "prof-demo-iti";
    const demoProfile: MockProfile = {
      id: profileId,
      fullName: "Rahul Ghadge (राहुल घाडगे)",
      phone: "+91 98765 43210",
      bio: "मी एक आयटीआय इलेक्ट्रिशियन आहे. मला वायरिंग, इलेक्ट्रिकल मेंटेनन्स आणि सेफ्टीचे ज्ञान आहे. मी मराठी आणि हिंदी दोन्ही बोलू शकतो.",
      preferredLanguage: "mr", // Start in Marathi
      languages: ["mr", "hi"],
      state: "Maharashtra",
      isVerified: true,
      collegeName: "Government ITI College",
      degree: "ITI Certification",
      branch: "Electrical / Electrician",
      year: "2026",
      cgpa: "8.2",
      preferredRole: "ITI Electrician",
      preferredLocation: "Mumbai, Maharashtra",
      expectedSalary: "₹20,000 - ₹25,000 / month",
      employmentType: "Full-time",
      onboardingCompleted: true,
    };
    this.saveProfile(demoProfile);

    const demoPassport: MockSkillPassport = {
      id: "pass-demo-iti",
      profileId: profileId,
      skills: [
        { name: "Wiring", proficiency: "Expert", status: "AI_VERIFIED" },
        { name: "Electrical Maintenance", proficiency: "Expert", status: "AI_VERIFIED" },
        { name: "Safety Protocols", proficiency: "Intermediate", status: "SELF_REPORTED" }
      ],
      readinessScore: 75.0,
      verificationLevel: "AI_VERIFIED"
    };
    this.saveSkillPassport(demoPassport);
    
    // Reset applications and interview logs for clean slate
    if (this.isClient) {
      localStorage.removeItem("pp_applications");
      localStorage.removeItem("pp_match_results");
      localStorage.removeItem("pp_interviews");
    }
  }
}

export const dbMock = new DBMock();
