# ml_service/train.py
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error
import xgboost as xgb
import lightgbm as lgb

# Make directory if not exists
os.makedirs("models", exist_ok=True)

# 1. Generate Synthetic Student Placement Data
def generate_student_data(n_samples=2000):
    np.random.seed(42)
    
    # Independent variables
    cgpa = np.random.uniform(5.5, 10.0, n_samples)
    projects_count = np.random.randint(0, 6, n_samples)
    internships_count = np.random.randint(0, 4, n_samples)
    resume_score = np.random.uniform(40, 100, n_samples)
    leetcode_solved = np.random.randint(0, 600, n_samples)
    coding_rating = np.random.randint(1200, 2200, n_samples)
    aptitude_score = np.random.uniform(40, 100, n_samples)
    mock_interview_score = np.random.uniform(45, 100, n_samples)
    communication_score = np.random.uniform(45, 100, n_samples)
    
    branch = np.random.choice(["Computer Science", "Electronics", "Electrical", "Mechanical", "Civil"], n_samples)
    
    # Target variable: Readiness Score (0 - 100%)
    # Let's write a formula that correlates strongly with mock_interview_score, cgpa, and leetcode_solved
    base_readiness = (
        0.15 * (cgpa * 10) +
        0.15 * aptitude_score +
        0.20 * mock_interview_score +
        0.15 * communication_score +
        0.10 * resume_score +
        0.12 * np.minimum((leetcode_solved / 6), 100) +
        0.05 * (projects_count * 15) +
        0.08 * (internships_count * 25)
    )
    # Clip base readiness and scale
    base_readiness = np.clip(base_readiness, 0, 200)
    readiness_score = (base_readiness / base_readiness.max()) * 92 + np.random.normal(0, 2.5, n_samples)
    readiness_score = np.clip(readiness_score, 30, 98) # Keep within realistic bounds
    
    df = pd.DataFrame({
        "cgpa": cgpa,
        "branch": branch,
        "projects_count": projects_count,
        "internships_count": internships_count,
        "resume_score": resume_score,
        "leetcode_solved": leetcode_solved,
        "coding_rating": coding_rating,
        "aptitude_score": aptitude_score,
        "mock_interview_score": mock_interview_score,
        "communication_score": communication_score,
        "readiness_score": readiness_score
    })
    return df

print("Generating synthetic student profiles...")
data = generate_student_data(2500)

# 2. Feature Engineering & Preprocessing
# One-hot encode branch
data_encoded = pd.get_dummies(data, columns=["branch"], drop_first=False)

# Convert boolean columns to int
for col in data_encoded.columns:
    if data_encoded[col].dtype == bool:
        data_encoded[col] = data_encoded[col].astype(int)

# Separate features and target
X = data_encoded.drop(columns=["readiness_score"])
y = data_encoded["readiness_score"]

# Save columns list for inference
feature_names = X.columns.tolist()
joblib.dump(feature_names, "models/feature_names.joblib")

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Model Training & Comparison
models = {
    "LinearRegression": LinearRegression(),
    "RandomForest": RandomForestRegressor(n_estimators=100, random_state=42, max_depth=12),
    "XGBoost": xgb.XGBRegressor(n_estimators=100, random_state=42, max_depth=6, learning_rate=0.08),
    "LightGBM": lgb.LGBMRegressor(n_estimators=100, random_state=42, max_depth=6, learning_rate=0.08, verbose=-1)
}

best_model = None
best_r2 = -1
best_name = ""

print("\n--- Model Evaluation ---")
for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    r2 = r2_score(y_test, preds)
    mse = mean_squared_error(y_test, preds)
    rmse = np.sqrt(mse)
    
    print(f"{name} -> R2 Score: {r2:.4f} | RMSE: {rmse:.4f}")
    
    if r2 > best_r2:
        best_r2 = r2
        best_model = model
        best_name = name

print(f"\nWinner: {best_name} (R2: {best_r2:.4f})")

# 4. Save best model
joblib.dump(best_model, "models/readiness_model.joblib")
print(f"Serialized best model successfully to models/readiness_model.joblib")
