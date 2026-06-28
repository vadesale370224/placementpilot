// app/api/jobs/match/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const profileId = req.cookies.get("pp_profile_id")?.value;
    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch Candidate Profile and Skill Passport
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        skillPassport: true,
        applications: true,
      },
    });

    if (!profile || !profile.skillPassport) {
      return NextResponse.json({ error: "Profile or passport not found" }, { status: 404 });
    }

    // Unpack serialized bio metadata
    let unpackedBio = profile.bio || "";
    let metadata: Record<string, any> = {};
    if (profile.bio && profile.bio.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(profile.bio);
        unpackedBio = parsed.text || "";
        metadata = parsed;
      } catch (err) {
        unpackedBio = profile.bio;
      }
    }

    const studentSkills = (profile.skillPassport.skills as any[] || []).map(s => s.name);

    // 2. Fetch Job Listings from PostgreSQL
    const jobs = await prisma.jobListing.findMany({
      where: { status: "OPEN" },
      include: {
        employer: true,
      },
    });

    // 3. For each job, call FastAPI or calculate JS fallback match
    const matchPromises = jobs.map(async (job) => {
      const payload = {
        student_skills: studentSkills,
        resume_text: unpackedBio,
        projects: ["Completed vocational certification project"],
        job_description: job.description + " requirements: " + ((job.requirements as string[]) || []).join(", "),
      };

      let score = 50.0;
      let matching_skills: string[] = [];
      let missing_skills: string[] = [];
      let explanation = "";

      try {
        const res = await fetch("http://localhost:8000/ml/job-match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const mlData = await res.json();
          score = mlData.score;
          matching_skills = mlData.matching_skills;
          missing_skills = mlData.missing_skills;
        } else {
          throw new Error("FastAPI returned error status");
        }
      } catch (err) {
        // Fallback calculations in JS matching the jobs/page.tsx formula
        const userSkillsLower = studentSkills.map(s => s.toLowerCase());
        const jobReqs = (job.requirements as string[]) || [];
        
        matching_skills = jobReqs.filter(req => 
          userSkillsLower.some(us => us.includes(req.toLowerCase()) || req.toLowerCase().includes(us))
        );
        missing_skills = jobReqs.filter(req => !matching_skills.includes(req));

        const userLangs = (profile.languages as string[] || []).map(l => l.toLowerCase());
        const jobLangs = (job.requiredLanguages as string[] || []).map(l => l.toLowerCase());
        const languagesMatched = jobLangs.filter(lang => userLangs.includes(lang));

        const stateMatch = job.location?.toLowerCase().includes(profile.state?.toLowerCase() || "") || 
                           profile.state?.toLowerCase().includes(job.location?.toLowerCase() || "") ||
                           profile.state === "Maharashtra" && (job.location?.includes("Mumbai") || job.location?.includes("Pune") || job.location?.includes("Nagpur") || job.location?.includes("Nashik"));

        const skillWeight = jobReqs.length > 0 ? (matching_skills.length / jobReqs.length) * 50 : 50;
        const langWeight = jobLangs.length > 0 ? (languagesMatched.length / jobLangs.length) * 30 : 30;
        const locationWeight = stateMatch ? 20 : 5;
        score = Math.round(skillWeight + langWeight + locationWeight);
      }

      // Generate localized explanation based on preferences
      const jobReqs = (job.requirements as string[]) || [];
      const userLangs = (profile.languages as string[] || []);
      const jobLangs = (job.requiredLanguages as string[] || []);
      const languagesMatched = jobLangs.filter(lang => userLangs.map(l=>l.toLowerCase()).includes(lang.toLowerCase()));

      const langNames: Record<string, string> = { en: "English", hi: "Hindi", mr: "Marathi" };
      const matchedLangList = languagesMatched.map(l => langNames[l.toLowerCase()] || l).join(", ");

      if (profile.preferredLanguage === "hi") {
        explanation = `कौशल मिलान: आपकी प्रोफ़ाइल इस नौकरी के लिए आवश्यक कौशल (${matching_skills.join(", ") || "बुनियादी कौशल"}) से मेल खाती है। ${missing_skills.length > 0 ? "हम सुझाव देते हैं कि आप " + missing_skills.join(", ") + " के लिए थोड़ा और अभ्यास करें।" : "सभी आवश्यक कौशल मौजूद हैं।"}\n`;
        explanation += `भाषा संगतता: आप कंपनी की आवश्यकता के अनुरूप ${matchedLangList || "आवश्यक"} भाषा बोलते हैं, जो टीम के साथ बातचीत करने में सहायक होगी।\n`;
        explanation += `स्थानीय संरेखण: आपकी प्रोफ़ाइल का राज्य (${profile.state}) और नौकरी का स्थान (${job.location}) मेल खाते हैं, जिससे आपको काम शुरू करने में आसानी होगी।`;
      } else if (profile.preferredLanguage === "mr") {
        explanation = `कौशल्य जुळणी: ${matching_skills.join(", ") || "मूलभूत कौशल्ये"} या आवश्यक कौशल्य गरजांशी तुमची प्रोफाइल जुळते. ${missing_skills.length > 0 ? "अधिक चांगल्या संधीसाठी " + missing_skills.join(", ") + " वर सराव शिफारसित आहे." : "सर्व आवश्यक कौशल्ये जुळली आहेत."}\n`;
        explanation += `भाषा अनुकूलता: तुम्ही बोलत असलेली भाषा (${matchedLangList || "आवश्यक"}) ही कंपनीच्या कामासाठी अत्यंत योग्य आहे.\n`;
        explanation += `स्थान संरेखण: Marathi भाषिक उमेदवारांसाठी तुमचे राज्य (${profile.state}) आणि कामाचे ठिकाण (${job.location}) जुळत असल्याने स्थानिक प्रवासासाठी अनुकूल आहे.`;
      } else {
        explanation = `Skill Alignment: Your capabilities in ${matching_skills.join(", ") || "basic skills"} align with the job criteria. ${missing_skills.length > 0 ? "Focus on practicing " + missing_skills.join(", ") + " in the coach." : "All skill requirements matched."}\n`;
        explanation += `Language Compatibility: Your spoken languages (${matchedLangList || "required"}) satisfy the company communication requirements.\n`;
        explanation += `Geographic Proximity: Both your registered state (${profile.state}) and the job location (${job.location}) are highly compatible.`;
      }

      const isApplied = profile.applications.some(a => a.jobId === job.id);

      return {
        job: {
          id: job.id,
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          requiredLanguages: job.requiredLanguages,
          location: job.location,
          salary: job.salary,
          companyName: job.employer?.companyName || "Nashik MSME Partner Company",
          status: job.status,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          employerId: job.employerId,
        },
        score,
        skillsMatched: matching_skills,
        missingSkills: missing_skills,
        languagesMatched,
        missingLanguages: jobLangs.filter(lang => !languagesMatched.includes(lang)),
        stateMatch: true,
        explanation,
        isApplied,
      };
    });

    const matches = await Promise.all(matchPromises);
    matches.sort((a, b) => b.score - a.score);

    return NextResponse.json({ success: true, matches });
  } catch (err: unknown) {
    console.error("Jobs matching error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profileId, jobId, matchScore, missingSkills } = body;

    if (!profileId || !jobId) {
      return NextResponse.json({ error: "profileId and jobId are required" }, { status: 400 });
    }

    const matchResult = await prisma.matchResult.create({
      data: {
        profileId,
        jobListingId: jobId,
        score: parseFloat(String(matchScore)),
        matchDetails: {
          missingSkills: missingSkills || [],
        },
      },
    });

    return NextResponse.json({ success: true, matchResult });
  } catch (err: any) {
    console.error("Save match result error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

