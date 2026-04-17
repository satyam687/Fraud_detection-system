"""python train_model.py

Requirements:
    pip install scikit-learn pandas numpy imbalanced-learn joblib

Dataset:
    Download creditcard.csv from:
    https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
    Place it in:  backend/ml_model/creditcard.csv
"""

 
# ── Paths ────────────────────────────────────────────────────────────────
# BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
# DATA_PATH  = os.path.join(BASE_DIR, 'ml_model', 'test.csv')
# MODEL_PATH = os.path.join(BASE_DIR, 'ml_model', 'fraud_model.pkl')
# SCALER_PATH= os.path.join(BASE_DIR, 'ml_model', 'scaler.pkl')
# # # ── Paths ─────────────────────────────────────────
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# TRAIN_PATH = os.path.join(BASE_DIR, '..', 'train.csv')
# TEST_PATH  = os.path.join(BASE_DIR, '..', 'test.csv')
# MODEL_PATH  = os.path.join(BASE_DIR, 'ml_model', 'fraud_model.pkl')
# SCALER_PATH = os.path.join(BASE_DIR, 'ml_model', 'scaler.pkl')
 
# def train():
#     print("=" * 60)
#     print("  Credit Card Fraud Detection — Model Training")
#     print("=" * 60)

#     # 1. Load dataset
#     if not os.path.exists(TRAIN_PATH):
#         print(f"\n[ERROR] Dataset not found at: {TRAIN_PATH}")
#        # print("Download from: https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud")
#         sys.exit(1)

#     print("\n[1/6] Loading dataset …")
#     df = pd.read_csv(TRAIN_PATH)
#     print(f"      Shape : {df.shape}")
#     print(f"      Fraud : {df['Class'].sum()} ({df['Class'].mean()*100:.3f}%)")

#     # 2. Features / target
#     print("[2/6] Preparing features …")
#     X = df.drop('Class', axis=1).values   # Time, V1–V28, Amount
#     y = df['Class'].values

#     # 3. Scale
#     print("[3/6] Scaling features …")
#     scaler   = StandardScaler()
#     X_scaled = scaler.fit_transform(X)

#     # 4. SMOTE to handle class imbalance
#     print("[4/6] Applying SMOTE oversampling …")
#     sm        = SMOTE(random_state=42)
#     X_res, y_res = sm.fit_resample(X_scaled, y)
#     print(f"      After SMOTE — Fraud: {y_res.sum()} | Legit: {(y_res==0).sum()}")

#     # 5. Train / test split
#     X_train, X_test, y_train, y_test = train_test_split(
#         X_res, y_res, test_size=0.2, random_state=42, stratify=y_res
#     )

#     # 6. Train Logistic Regression
#     print("[5/6] Training Logistic Regression …")
#     model = LogisticRegression(
#         max_iter=1000,
#         C=0.1,
#         solver='lbfgs',
#         class_weight='balanced',
#         random_state=42,
#     )
#     model.fit(X_train, y_train)

#     # 7. Evaluate
#     print("[6/6] Evaluating …")
#     y_pred = model.predict(X_test)
#     y_prob = model.predict_proba(X_test)[:, 1]

#     print("\nClassification Report:")
#     print(classification_report(y_test, y_pred, target_names=['Legit','Fraud']))
#     print("Confusion Matrix:")
#     print(confusion_matrix(y_test, y_pred))
#     print(f"ROC-AUC Score : {roc_auc_score(y_test, y_prob):.4f}")

#     # 8. Save
#     os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
#     joblib.dump(model,  MODEL_PATH)
#     joblib.dump(scaler, SCALER_PATH)
#     print(f"\nModel  saved → {MODEL_PATH}")
#     print(f"Scaler saved → {SCALER_PATH}")
#     print("\nTraining complete!")

 
import os
import sys
import joblib
import pandas as pd

from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from imblearn.over_sampling import SMOTE

# ── Paths ─────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TRAIN_PATH = os.path.join(BASE_DIR, '..', 'train.csv')
TEST_PATH  = os.path.join(BASE_DIR, '..', 'test.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'fraud_detection', 'ml_model', 'fraud_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'fraud_detection', 'ml_model', 'scaler.pkl')
FEATURE_PATH = os.path.join(BASE_DIR, 'fraud_detection', 'ml_model', 'features.pkl')
 

def train():

   print("=" * 60)
print("  Fraud Detection Model Training")
print("=" * 60)

# 1. Load datasets (✅ reduced size to avoid memory error)
if not os.path.exists(TRAIN_PATH) or not os.path.exists(TEST_PATH):
    print("\n[ERROR] train.csv or test.csv not found")
    sys.exit(1)

print("\n[1/6] Loading datasets...")
train_df = pd.read_csv(TRAIN_PATH).sample(100000, random_state=42)
test_df  = pd.read_csv(TEST_PATH).sample(30000, random_state=42)

print(f"Train Shape: {train_df.shape}")
print(f"Test Shape : {test_df.shape}")

# 2. Drop unnecessary columns (✅ memory + performance)
DROP_COLS = [
    'Unnamed: 0', 'trans_date_trans_time', 'merchant',
    'first', 'last', 'street', 'city', 'state', 'job', 'dob'
]

train_df.drop(columns=DROP_COLS, inplace=True, errors='ignore')
test_df.drop(columns=DROP_COLS, inplace=True, errors='ignore')

# 3. Detect target column
print("\n[DEBUG] Checking columns...")
print(list(train_df.columns))

if 'is_fraud' in train_df.columns:
    TARGET = 'is_fraud'
elif 'isFraud' in train_df.columns:
    TARGET = 'isFraud'
elif 'Class' in train_df.columns:
    TARGET = 'Class'
else:
    raise ValueError("Target column not found")

print(f"✅ Using target column: {TARGET}")

# 4. Features / target
print("\n[2/6] Preparing data...")
X_train = train_df.drop(TARGET, axis=1)
y_train = train_df[TARGET]

X_test  = test_df.drop(TARGET, axis=1)
y_test  = test_df[TARGET]

# ✅ Drop high-cardinality columns (CRITICAL FIX)
DROP_HIGH_CARDINAL = ['cc_num', 'trans_num']
X_train.drop(columns=DROP_HIGH_CARDINAL, inplace=True, errors='ignore')
X_test.drop(columns=DROP_HIGH_CARDINAL, inplace=True, errors='ignore')

# ✅ Encode only safe categorical columns
categorical_cols = X_train.select_dtypes(include=['object', 'string']).columns

X_train = pd.get_dummies(X_train, columns=categorical_cols)
X_test  = pd.get_dummies(X_test, columns=categorical_cols)

# ✅ Align columns
X_train, X_test = X_train.align(X_test, join='left', axis=1, fill_value=0)

# ✅ Save feature names
feature_columns = X_train.columns.tolist()

# ✅ Convert to float (memory optimized)
X_train = X_train.astype('float32')
X_test  = X_test.astype('float32')
# 5. Scaling
print("\n[3/6] Scaling...")
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test  = scaler.transform(X_test)

# 6. SMOTE
print("\n[4/6] Applying SMOTE...")
sm = SMOTE(random_state=42)
X_train, y_train = sm.fit_resample(X_train, y_train)

# 7. Train model
print("\n[5/6] Training model...")
model = LogisticRegression(
    max_iter=1000,
    C=0.1,
    solver='lbfgs',
    class_weight='balanced',
    random_state=42,
)
model.fit(X_train, y_train)

# 8. Evaluate
print("\n[6/6] Evaluating...")
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

print("\nClassification Report:")
print(classification_report(y_test, y_pred))
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))
print(f"\nROC-AUC Score: {roc_auc_score(y_test, y_prob):.4f}")

# 9. Save model
print("\nSaving model...")
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

joblib.dump(model, MODEL_PATH)
joblib.dump(scaler, SCALER_PATH)
joblib.dump(feature_columns, FEATURE_PATH)

print("✅ Model, scaler & features saved successfully!")


if __name__ == "__main__":
    train()
