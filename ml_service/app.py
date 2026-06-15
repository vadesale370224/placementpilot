# ml_service/app.py
import os
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

app = FastAPI(title="PlacementPilot ML Intelligence Engine", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
# Try fallback to project root models folder if not found in ml_service/models
if not os.path.exists(MODELS_DIR) or not os.path.exists(os.path.join(MODELS_DIR, "readiness_model.joblib")):
    MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")

readiness_model = None
feature_names = None
sentence_transformer_model = None
use_transformers = True

try:
    model_path = os.path.join(MODELS_DIR, "readiness_model.joblib")
    features_path = os.path.join(MODELS_DIR, "feature_names.joblib")
    if os.path.exists(model_path) and os.path.exists(features_path):
        readiness_model = joblib.load(model_path)
        feature_names = joblib.load(features_path)
        print(f"Loaded readiness model from: {model_path}")
    else:
        print("Readiness model files not found. Model will be fitted dynamically if training script was run elsewhere.")
except Exception as e:
    print(f"Error loading readiness model: {e}")

# Lazily load SentenceTransformer to avoid blocking startup
def get_sentence_transformer():
    global sentence_transformer_model, use_transformers
    if sentence_transformer_model is None and use_transformers:
        try:
            from sentence_transformers import SentenceTransformer
            # Using the fast, lightweight 90MB CPU-friendly model
            sentence_transformer_model = SentenceTransformer('all-MiniLM-L6-v2')
            print("Successfully initialized Sentence Transformers ('all-MiniLM-L6-v2').")
        except Exception as e:
            print(f"Warning: SentenceTransformers failed to load, falling back to Jaccard/TF-IDF token matching. Error: {e}")
            use_transformers = False
    return sentence_transformer_model

# ----------------- PYDANTIC SCHEMAS -----------------

class ReadinessInput(BaseModel):
    cgpa: float = Field(..., ge=0.0, le=10.0)
    branch: str = Field(..., description="e.g. Computer Science, Electronics, Electrical, Mechanical, Civil")
    projects_count: int = Field(..., ge=0)
    internships_count: int = Field(..., ge=0)
    resume_score: float = Field(..., ge=0.0, le=100.0)
    leetcode_solved: int = Field(..., ge=0)
    coding_rating: int = Field(..., ge=0)
    aptitude_score: float = Field(..., ge=0.0, le=100.0)
    mock_interview_score: float = Field(..., ge=0.0, le=100.0)
    communication_score: float = Field(..., ge=0.0, le=100.0)

class JobMatchInput(BaseModel):
    student_skills: List[str]
    resume_text: str
    projects: List[str]
    job_description: str

class SkillGapInput(BaseModel):
    current_skills: List[str]
    target_company_requirements: List[str]

class InterviewPredictInput(BaseModel):
    mock_interview_scores: List[float]
    communication_score: float
    technical_score: float
    confidence_score: float
    response_completeness: float

class SpeechAnalysisInput(BaseModel):
    speech_rate: float = Field(..., description="words per minute")
    pause_count: int
    filler_words_count: int
    confidence_metrics: float = Field(..., ge=0.0, le=100.0)


# ----------------- MODULE 1: PLACEMENT READINESS PREDICTOR -----------------

@app.post("/ml/readiness-score")
async def predict_readiness(data: ReadinessInput):
    global readiness_model, feature_names
    
    if readiness_model is None or feature_names is None:
        raise HTTPException(status_code=503, detail="Readiness model not loaded or trained yet.")
        
    try:
        # Construct input DataFrame
        input_data = {col: 0 for col in feature_names}
        
        # Numeric values
        input_data["cgpa"] = data.cgpa
        input_data["projects_count"] = data.projects_count
        input_data["internships_count"] = data.internships_count
        input_data["resume_score"] = data.resume_score
        input_data["leetcode_solved"] = data.leetcode_solved
        input_data["coding_rating"] = data.coding_rating
        input_data["aptitude_score"] = data.aptitude_score
        input_data["mock_interview_score"] = data.mock_interview_score
        input_data["communication_score"] = data.communication_score
        
        # One-hot encoded branch
        branch_col = f"branch_{data.branch}"
        if branch_col in input_data:
            input_data[branch_col] = 1
            
        df = pd.DataFrame([input_data])[feature_names]
        
        # Inference
        raw_pred = readiness_model.predict(df)[0]
        score = float(np.clip(raw_pred, 30.0, 98.0))
        
        # Confidence logic based on input variance and values
        # e.g., higher solves and GPA give a tighter bound
        confidence = 85.0 + (data.cgpa / 10.0) * 5.0 + (min(data.leetcode_solved, 300) / 300.0) * 5.0
        confidence = float(np.clip(confidence, 80.0, 97.0))
        
        # Explainability rules
        explainability = []
        if data.resume_score >= 80:
            explainability.append("Strong Resume formatting and structure")
        else:
            explainability.append("Weak Resume (consider adding quantifiable achievements)")
            
        if data.leetcode_solved >= 150 or data.coding_rating >= 1600:
            explainability.append("Strong Data Structures & Algorithms (DSA) profile")
        else:
            explainability.append("Aptitude / Coding solves could be improved")
            
        if data.mock_interview_score >= 80 and data.communication_score >= 80:
            explainability.append("Strong Communication & vocal mock performance")
        elif data.communication_score < 70:
            explainability.append("Weak Vocal Communication (practice in AI Coach)")
            
        return {
            "score": round(score, 1),
            "confidence": round(confidence, 1),
            "explainability": explainability
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


# ----------------- MODULE 2: JOB MATCHING ENGINE -----------------

@app.post("/ml/job-match")
async def job_match(data: JobMatchInput):
    # Prepare text representations
    student_profile_text = f"Skills: {', '.join(data.student_skills)}. Resume: {data.resume_text}. Projects: {'. '.join(data.projects)}"
    job_desc_text = data.job_description
    
    score = 50.0 # Base fallback
    
    # Try Sentence Transformers
    transformer = get_sentence_transformer()
    if transformer is not None:
        try:
            from sentence_transformers import util
            emb_student = transformer.encode(student_profile_text, convert_to_tensor=True)
            emb_job = transformer.encode(job_desc_text, convert_to_tensor=True)
            cos_sim = util.cos_sim(emb_student, emb_job).item()
            score = 30.0 + cos_sim * 70.0 # Map similarity to 30%-100% range
        except Exception as e:
            print(f"Cosine similarity error: {e}, falling back to token matching.")
            transformer = None
            
    # Fallback to Jaccard / Token overlap similarity
    if transformer is None:
        student_tokens = set(student_profile_text.lower().replace(",", "").replace(".", "").split())
        job_tokens = set(job_desc_text.lower().replace(",", "").replace(".", "").split())
        intersection = student_tokens.intersection(job_tokens)
        union = student_tokens.union(job_tokens)
        jaccard = len(intersection) / len(union) if union else 0.0
        score = 45.0 + jaccard * 55.0
        
    score = float(np.clip(score, 30.0, 99.0))
    
    # Calculate matching & missing skills based on substring overlap
    matching_skills = []
    missing_skills = []
    
    desc_lower = job_desc_text.lower()
    for skill in data.student_skills:
        if skill.lower() in desc_lower:
            matching_skills.append(skill)
            
    # Sample learning recommendations based on missing items
    # In production, this can query a DB or use classification
    tech_keywords = ["react", "next.js", "node.js", "python", "docker", "kubernetes", "typescript", "sql", "postgresql", "mongodb", "aws", "git", "wiring", "welding", "safety", "billing", "excel", "sales"]
    job_requirements = [kw for kw in tech_keywords if kw in desc_lower]
    
    for req in job_requirements:
        if not any(req in sk.lower() for sk in data.student_skills):
            missing_skills.append(req.title())
            
    # Recommended learning path
    recommended_path = []
    for skill in missing_skills[:3]:
        recommended_path.append(f"Complete a structured project using {skill}")
        recommended_path.append(f"Practice 5 technical interview questions in AI Coach on {skill}")
        
    return {
        "score": round(score, 1),
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "recommended_learning_path": recommended_path if recommended_path else ["All skill requirements satisfied! Keep practicing coding mocks."]
    }


# ----------------- MODULE 3: SKILL GAP DETECTOR -----------------

@app.post("/ml/skill-gap")
async def detect_skill_gap(data: SkillGapInput):
    current_lower = [s.lower() for s in data.current_skills]
    missing_skills = []
    
    for req in data.target_company_requirements:
        if req.lower() not in current_lower:
            missing_skills.append(req)
            
    # Priorities & learning roadmaps
    # Simple rule-based logic to prioritize (e.g. core skills get high priority)
    priority_ranking = {}
    estimated_time = {}
    roadmap = []
    
    for i, skill in enumerate(missing_skills):
        priority = "High" if i == 0 else "Medium" if i == 1 else "Low"
        priority_ranking[skill] = priority
        
        hours = 15 if priority == "High" else 10 if priority == "Medium" else 6
        estimated_time[skill] = f"{hours} hours"
        
        roadmap.append(f"Phase {i+1}: Focus on learning {skill} (Est: {hours}h). Practice core concepts.")
        
    return {
        "missing_skills": missing_skills,
        "priority_ranking": priority_ranking,
        "estimated_learning_time": estimated_time,
        "personalized_roadmap": roadmap if roadmap else ["No skill gaps detected for this target company level!"]
    }


# ----------------- MODULE 4: INTERVIEW SUCCESS PREDICTOR -----------------

@app.post("/ml/interview-predict")
async def predict_interview_success(data: InterviewPredictInput):
    # Calculate dynamic probability using Logistic Regression analogy
    avg_mock_score = sum(data.mock_interview_scores) / len(data.mock_interview_scores) if data.mock_interview_scores else 50.0
    
    # Logit parameters representing trained coefficients
    z = (
        0.04 * (avg_mock_score - 70) +
        0.03 * (data.communication_score - 70) +
        0.04 * (data.technical_score - 70) +
        0.02 * (data.confidence_score - 70) +
        0.02 * (data.response_completeness - 70)
    )
    probability = 1 / (1 + np.exp(-z)) # Sigmoid activation
    score = float(probability * 100)
    score = float(np.clip(score, 20.0, 97.0))
    
    # Reasons & improvement details
    reasons = []
    weak_areas = []
    improvement_plan = []
    
    if data.communication_score >= 80:
        reasons.append("Highly polished communication style and pacing")
    else:
        weak_areas.append("Communication pacing / speech delivery")
        improvement_plan.append("Perform 3 additional mock speech coach modules focusing on fluid delivery.")
        
    if data.technical_score >= 80:
        reasons.append("Strong technical explanations using industry keywords")
    else:
        weak_areas.append("Technical keyword matching and completeness")
        improvement_plan.append("Structure answers using the STAR format (Situation, Task, Action, Result).")
        
    if data.confidence_score < 75:
        weak_areas.append("Vocal hesitation and fillers detected")
        improvement_plan.append("Reduce the usage of fill words like 'uh', 'um', or 'like'.")
        
    if not reasons:
        reasons.append("Adequate base scoring; focus on technical explanations")
        
    return {
        "success_probability": round(score, 1),
        "reasons": reasons,
        "weak_areas": weak_areas if weak_areas else ["None detected"],
        "improvement_plan": improvement_plan if improvement_plan else ["Keep maintaining current performance level. Practice advanced mock questions."]
    }


# ----------------- MODULE 5: SPEECH CONFIDENCE ANALYZER -----------------

@app.post("/ml/speech-analysis")
async def analyze_speech(data: SpeechAnalysisInput):
    # Speaking speed reference: 120-150 words per minute is optimal
    speed_deviation = abs(data.speech_rate - 135)
    
    # Speaking Quality Score formula
    quality_score = 100.0 - (data.filler_words_count * 4.5) - (data.pause_count * 2.0) - (speed_deviation * 0.4)
    quality_score = float(np.clip(quality_score, 40.0, 98.0))
    
    # Communication Score
    comm_score = 0.6 * data.confidence_metrics + 0.4 * quality_score
    comm_score = float(np.clip(comm_score, 45.0, 98.0))
    
    # Speech recommendations
    suggestions = []
    if data.speech_rate < 110:
        suggestions.append("Speaking rate is a bit slow. Aim to speed up slightly for energetic delivery.")
    elif data.speech_rate > 160:
        suggestions.append("Speaking rate is fast. Take slow breaths and pace yourself to ensure clear understanding.")
        
    if data.filler_words_count > 4:
        suggestions.append("High count of filler words ('um', 'uh'). Try pausing silently instead of using fillers.")
        
    if data.pause_count > 6:
        suggestions.append("Frequent pauses detected. Structure your thoughts before answering to minimize hesitation.")
        
    if not suggestions:
        suggestions.append("Great vocal pacing, confidence, and speech structure!")
        
    return {
        "confidence_score": round(data.confidence_metrics, 1),
        "speaking_quality_score": round(quality_score, 1),
        "communication_score": round(comm_score, 1),
        "suggestions": suggestions
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
