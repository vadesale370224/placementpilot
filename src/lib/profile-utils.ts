import { MockProfile, MockSkillPassport } from "./dbMock";

export function calculateProfileCompletion(profile: MockProfile | null, passport: MockSkillPassport | null): number {
  if (!profile) return 0;
  let score = 0;
  
  // 1. Personal Information (20%): fullName and phone
  if (profile.fullName && profile.fullName.trim() && profile.phone && profile.phone.trim()) {
    score += 20;
  }
  
  // 2. Education (20%): collegeName, degree, branch
  if (profile.collegeName && profile.collegeName.trim() && profile.degree && profile.degree.trim() && profile.branch && profile.branch.trim()) {
    score += 20;
  }
  
  // 3. Skills (20%): at least 1 skill in passport
  if (passport && passport.skills && passport.skills.length > 0) {
    score += 20;
  }
  
  // 4. Resume (20%): resumeUrl
  if (profile.resumeUrl && profile.resumeUrl.trim()) {
    score += 20;
  }
  
  // 5. Career Preferences (20%): preferredRole and preferredLocation
  if (profile.preferredRole && profile.preferredRole.trim() && profile.preferredLocation && profile.preferredLocation.trim()) {
    score += 20;
  }
  
  return score;
}

export function getProfileCompletionBadge(score: number) {
  if (score < 50) {
    return {
      text: "Incomplete Profile",
      className: "bg-red-500/10 text-red-500 border border-red-500/20"
    };
  } else if (score >= 50 && score <= 80) {
    return {
      text: "Basic Profile",
      className: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
    };
  } else {
    return {
      text: "Complete Profile",
      className: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
    };
  }
}
