from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split

DATASET_PATH = Path(__file__).resolve().parent / "dataset.csv"
FEATURE_COLUMNS = [
    "amount",
    "email_suspicious",
    "is_foreign_location",
    "is_unknown_device",
]
SUSPICIOUS_EMAIL_DOMAINS = {"tempmail.com", "fake.com", "spam.com", "mailinator.com"}
TRUSTED_LOCATIONS = {"india"}
TRUSTED_DEVICES = {"mobile", "web", "desktop"}


def is_email_suspicious(email: str) -> bool:
    """Return True if the email address is missing, malformed, or uses a disposable domain."""
    if not email or "@" not in email:
        return True
    domain = email.split("@")[-1].strip().lower()
    return domain in SUSPICIOUS_EMAIL_DOMAINS


def extract_features(
    amount: float,
    email: str = "",
    location: str = "India",
    device: str = "Mobile",
) -> pd.DataFrame:
    """Convert raw transaction fields into a single-row model feature DataFrame."""
    email_flag = 1 if (email and is_email_suspicious(email)) else 0
    location_norm = (location or "India").strip().lower()
    device_norm = (device or "Mobile").strip().lower()

    foreign_flag = 0 if location_norm in TRUSTED_LOCATIONS else 1
    unknown_device_flag = 0 if device_norm in TRUSTED_DEVICES else 1

    return pd.DataFrame(
        [
            {
                "amount": float(amount),
                "email_suspicious": email_flag,
                "is_foreign_location": foreign_flag,
                "is_unknown_device": unknown_device_flag,
            }
        ],
        columns=FEATURE_COLUMNS,
    )


def generate_dataset(
    output_path: Path = DATASET_PATH,
    n_samples: int = 2000,
    fraud_ratio: float = 0.2,
    seed: int = 42,
) -> pd.DataFrame:
    """Generate a reproducible synthetic transaction dataset and save it to CSV."""
    rng = np.random.default_rng(seed)
    n_fraud = int(round(n_samples * fraud_ratio))
    n_legit = n_samples - n_fraud

    legit_amounts = np.round(
        np.clip(rng.lognormal(mean=6.8, sigma=0.85, size=n_legit), 50, 22000), 2
    )
    legit_df = pd.DataFrame(
        {
            "amount": legit_amounts,
            "email_suspicious": rng.binomial(1, 0.03, size=n_legit),
            "is_foreign_location": rng.binomial(1, 0.08, size=n_legit),
            "is_unknown_device": rng.binomial(1, 0.06, size=n_legit),
            "fraud": 0,
        }
    )

    fraud_amounts = np.round(
        np.clip(rng.lognormal(mean=8.7, sigma=0.75, size=n_fraud), 300, 50000), 2
    )
    fraud_df = pd.DataFrame(
        {
            "amount": fraud_amounts,
            "email_suspicious": rng.binomial(1, 0.58, size=n_fraud),
            "is_foreign_location": rng.binomial(1, 0.52, size=n_fraud),
            "is_unknown_device": rng.binomial(1, 0.48, size=n_fraud),
            "fraud": 1,
        }
    )

    dataset = (
        pd.concat([legit_df, fraud_df], ignore_index=True)
        .sample(frac=1.0, random_state=seed)
        .reset_index(drop=True)
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    dataset.to_csv(output_path, index=False)
    return dataset


def train_and_evaluate(dataset_path: Path = DATASET_PATH):
    """Load the dataset, train RandomForestClassifier on an 80/20 split, and compute metrics."""
    if dataset_path.exists():
        data = pd.read_csv(dataset_path)
    else:
        data = generate_dataset(dataset_path)

    X = data[FEATURE_COLUMNS]
    y = data["fraud"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        random_state=42,
    )
    rf_model.fit(X_train, y_train)

    y_pred = rf_model.predict(X_test)
    y_prob = rf_model.predict_proba(X_test)[:, 1]

    metrics = {
        "dataset_size": int(len(data)),
        "fraud_records": int((y == 1).sum()),
        "legitimate_records": int((y == 0).sum()),
        "ml_algorithm": "Random Forest Classifier",
        "train_test_split": "80% / 20%",
        "train_size": int(len(X_train)),
        "test_size": int(len(X_test)),
        "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_prob)), 4),
    }
    return rf_model, metrics


model, MODEL_METRICS = train_and_evaluate()


def predict_fraud(
    amount: float,
    email: str = "",
    location: str = "India",
    device: str = "Mobile",
) -> bool:
    """Predict whether a transaction is fraudulent using the trained Random Forest model."""
    features = extract_features(amount=amount, email=email, location=location, device=device)
    return bool(model.predict(features)[0])


def get_model_metrics() -> dict:
    """Return dataset summary and test-split evaluation metrics for the trained model."""
    return dict(MODEL_METRICS)


if __name__ == "__main__":
    for key, value in get_model_metrics().items():
        print(f"{key}: {value}")
