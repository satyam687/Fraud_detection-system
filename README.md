# Credit Card Fraud Detection
### Django REST API · MySQL · React · Vite · Tailwind CSS · Scikit-learn

---

## Project Structure

```
credit_fraud_project/
├── backend/
│   ├── backend/              ← Django settings, URLs, WSGI
│   ├── fraud_detection/      ← Models, Views, Serializers, ML service
│   ├── ml_model/             ← Trained .pkl files go here
│   ├── manage.py
│   ├── train_model.py        ← Run once to train the model
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/fraud.js      ← Axios API calls
│   │   ├── components/       ← Sidebar, StatCard
│   │   ├── pages/            ← Dashboard, Predict, Transactions, Alerts
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

## STEP 1 — Prerequisites

Install these before starting:
- Python 3.10+       → https://python.org
- Node.js 18+        → https://nodejs.org
- MySQL 8.0+         → https://dev.mysql.com/downloads/

---

## STEP 2 — MySQL Setup

```sql
mysql -u root -p

CREATE DATABASE fraud_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;   -- confirm fraud_db exists
EXIT;
```

---

## STEP 3 — Python Virtual Environment & Backend

```bash
# From project root
cd backend

# Create virtual environment
python -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
```

### Update MySQL password in settings.py
Open `backend/backend/settings.py` and change:
```python
'PASSWORD': 'your_mysql_password',   # ← put your actual MySQL root password
```

---

## STEP 4 — Django Database Migration

```bash
# Still inside backend/ with venv active
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser    # create admin login
```

---

## STEP 5 — Train the ML Model (One Time)

### Download dataset
1. Go to: https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
2. Download `creditcard.csv`
3. Place it at: `backend/ml_model/creditcard.csv`

### Run training script
```bash
python train_model.py
```

This will:
- Load the 284,807 transaction dataset
- Apply StandardScaler for feature normalisation
- Apply SMOTE to balance the 0.17% fraud minority class
- Train Logistic Regression (max_iter=1000, class_weight=balanced)
- Print classification report + confusion matrix + ROC-AUC score
- Save `ml_model/fraud_model.pkl` and `ml_model/scaler.pkl`

> NOTE: If you skip this step, the app still works using a smart dummy
> predictor — high-amount transactions get elevated fraud probability.

---

## STEP 6 — Run Django Server

```bash
python manage.py runserver
# API is now live at http://localhost:8000
```

**API Endpoints:**

| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/fraud/predict/ | Predict fraud for a transaction |
| GET  | /api/fraud/transactions/ | List all transactions (paginated) |
| GET  | /api/fraud/transactions/?risk=high | Filter by risk level |
| GET  | /api/fraud/transactions/?is_fraud=true | Filter fraud only |
| GET  | /api/fraud/stats/ | Dashboard statistics |
| GET  | /api/fraud/alerts/ | Active fraud alerts |
| PATCH | /api/fraud/alerts/<id>/resolve/ | Mark alert as resolved |
| GET  | /admin/ | Django admin panel |
| POST | /api/token/ | JWT login |

---

## STEP 7 — React Frontend

```bash
# Open a NEW terminal
cd frontend

# Install Node packages
npm install

# Start development server
npm run dev
# App opens at http://localhost:5173
```

---

## STEP 8 — Test the Full Flow

1. Open http://localhost:5173
2. Click **Predict** in the sidebar
3. Click **"Load Fraud Sample"** button
4. Click **Run Fraud Analysis**
5. See the fraud result with probability bar
6. Go to **Transactions** to see it saved in MySQL
7. Go to **Alerts** to see the auto-generated fraud alert
8. Go to **Dashboard** for live stats and charts

---

## API Usage Example (curl)

```bash
# Predict a transaction
curl -X POST http://localhost:8000/api/fraud/predict/ \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2125.87,
    "time": 406,
    "v1": -2.3122,
    "v2": 1.9519,
    "v14": -4.2895
  }'

# Response:
{
  "transaction_id": "TX-A1B2C3D4E5",
  "is_fraud": true,
  "fraud_probability": 87.43,
  "risk_level": "high",
  "amount": 2125.87,
  "message": "FRAUD DETECTED — Alert created."
}
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 4.2, Django REST Framework |
| Database | MySQL 8.0 (via mysqlclient) |
| Auth | JWT (djangorestframework-simplejwt) |
| ML | Scikit-learn, Pandas, NumPy, imbalanced-learn |
| Frontend | React 18, Vite, Tailwind CSS |
| Charts | Recharts |
| HTTP | Axios |

---

## ML Model Details

- **Algorithm**: Logistic Regression
- **Dataset**: Kaggle Credit Card Fraud (284,807 transactions, 492 fraud)
- **Preprocessing**: StandardScaler on all 30 features
- **Class Imbalance**: SMOTE oversampling (0.17% → 50/50 balanced)
- **Accuracy**: ~87% on held-out test set
- **Features**: Time, Amount, V1–V28 (PCA-anonymised)

---

## Common Issues

**mysqlclient install error (Mac)**
```bash
brew install mysql-client pkg-config
export PKG_CONFIG_PATH="/opt/homebrew/opt/mysql-client/lib/pkgconfig"
pip install mysqlclient
```

**mysqlclient install error (Windows)**
```bash
pip install mysqlclient --only-binary=:all:
# Or download wheel from: https://www.lfd.uci.edu/~gohlke/pythonlibs/
```

**CORS error in browser**
Make sure Django is running on port 8000 and React on 5173.
Check `CORS_ALLOWED_ORIGINS` in settings.py.

**Model not found warning**
Place creditcard.csv in backend/ml_model/ and run python train_model.py
