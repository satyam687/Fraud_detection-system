# # """
# # ml_service.py
# # Loads the trained Logistic Regression model + StandardScaler once
# # at module import time and exposes a predict() function.
# # """
# # import os
# # import numpy as np

# # _model  = None
# # _scaler = None


# # def _load():
# #     global _model, _scaler
# #     if _model is not None:
# #         return

# #     try:
# #         import joblib
# #         from django.conf import settings
# #         _model  = joblib.load(settings.ML_MODEL_PATH)
# #         _scaler = joblib.load(settings.ML_SCALER_PATH)
# #         print("[ML] Model & scaler loaded successfully.")
# #     except FileNotFoundError:
# #         print("[ML] WARNING: model files not found – using dummy predictor.")
# #         _model  = None
# #         _scaler = None


# # def predict(data: dict) -> dict:
# #     """
# #     data must have: time, amount, v1 … v28
# #     Returns: {'is_fraud': bool, 'fraud_prob': float, 'risk_level': str}
# #     """
# #     _load()

# #     features = [data.get('time', 0), data.get('amount', 0)]
# #     features += [data.get(f'v{i}', 0) for i in range(1, 29)]  # v1–v28
# #     X = np.array([features])

# #     if _model is None or _scaler is None:
# #         # ── Dummy fallback (no model file yet) ──────────────────
# #         prob     = float(np.random.beta(1, 9))          # mostly low
# #         if data.get('amount', 0) > 1000:
# #             prob = min(prob + 0.4, 0.99)                # high amount → riskier
# #         is_fraud = prob > 0.5
# #     else:
# #         X_scaled  = _scaler.transform(X)
# #         prob      = float(_model.predict_proba(X_scaled)[0][1])
# #         is_fraud  = bool(_model.predict(X_scaled)[0] == 1)

# #     risk_level = 'high' if prob >= 0.7 else ('medium' if prob >= 0.4 else 'low')

# #     return {
# #         'is_fraud':   is_fraud,
# #         'fraud_prob': round(prob, 6),
# #         'risk_level': risk_level,
# #     }

# # ml_service.py
# # Loads the trained Logistic Regression model + StandardScaler once
# # at module import time and exposes a predict() function.

# # FIX: Passes a named pandas DataFrame to scaler.transform() so that
# #      feature names match exactly and sklearn warnings are eliminated.
# #      Model is now trained on the same 30 features used by the app:
# #      time, amount, v1-v28.
# # """
# import numpy as np
# import pandas as pd

# _model  = None
# _scaler = None

# # Exact feature order the model was trained on
# FEATURE_NAMES = ['time', 'amount'] + [f'v{i}' for i in range(1, 29)]


# def _load():
#     global _model, _scaler
#     if _model is not None:
#         return

#     try:
#         import joblib
#         from django.conf import settings
#         _model  = joblib.load(settings.ML_MODEL_PATH)
#         _scaler = joblib.load(settings.ML_SCALER_PATH)
#         print("[ML] Model & scaler loaded successfully.")
#     except FileNotFoundError:
#         print("[ML] WARNING: model files not found - using dummy predictor.")
#         _model  = None
#         _scaler = None


# def predict(data: dict) -> dict:
#     """
#     data must have: time, amount, v1 ... v28
#     Returns: {'is_fraud': bool, 'fraud_prob': float, 'risk_level': str}
#     """
#     _load()

#     # Build feature row as a named DataFrame
#     # This eliminates the sklearn UserWarning about feature names
#     # and guarantees correct column order matching the trained scaler.
#     row = {name: data.get(name, 0) for name in FEATURE_NAMES}
#     X = pd.DataFrame([row], columns=FEATURE_NAMES)

#     if _model is None or _scaler is None:
#         # Dummy fallback (no model file)
#         prob = float(np.random.beta(1, 9))
#         if data.get('amount', 0) > 1000:
#             prob = min(prob + 0.4, 0.99)
#         is_fraud = prob > 0.5
#     else:
#         X_scaled = _scaler.transform(X)
#         prob     = float(_model.predict_proba(X_scaled)[0][1])
#         is_fraud = bool(_model.predict(X_scaled)[0] == 1)

#     risk_level = 'high' if prob >= 0.7 else ('medium' if prob >= 0.4 else 'low')

#     return {
#         'is_fraud':   is_fraud,
#         'fraud_prob': round(prob, 6),
#         'risk_level': risk_level,
#     }
# def predict(data):
#     df = pd.DataFrame([data])

#     # IMPORTANT: match training column order
#     expected_columns = [
#         'amt', 'cc_num', 'city_pop', 'lat', 
#         # add ALL columns used during training
#     ]

#     df = df[expected_columns]   # reorder & filter

#     X_scaled = _scaler.transform(df)
#     result = _model.predict(X_scaled)

#     return result[0]  

"""
ml_service.py
Loads the trained Logistic Regression model + StandardScaler
and provides fraud prediction.
"""
 
import numpy as np
import pandas as pd
import joblib

from django.conf import settings

_model = None
_scaler = None
_feature_columns = None


def _load():
    global _model, _scaler, _feature_columns

    if _model is not None:
        return

    try:
        _model = joblib.load(settings.ML_MODEL_PATH)
        _scaler = joblib.load(settings.ML_SCALER_PATH)
        _feature_columns = joblib.load(settings.ML_FEATURE_PATH)

        print("[ML] Model, scaler & features loaded successfully.")

    except FileNotFoundError:
        print("[ML] WARNING: model files not found - using dummy predictor.")
        _model = None
        _scaler = None
        _feature_columns = None


def predict(data: dict) -> dict:
    _load()

    # ✅ If model not loaded → fallback
    if _model is None or _scaler is None or _feature_columns is None:
        prob = float(np.random.beta(1, 9))
        is_fraud = prob > 0.5

    else:
        # ✅ Create DataFrame from input
        X = pd.DataFrame([data])

        # ✅ Add missing columns
        for col in _feature_columns:
            if col not in X:
                X[col] = 0

        # ✅ Keep correct order
        X = X[_feature_columns]

        # ✅ Scale + Predict
        X_scaled = _scaler.transform(X)

        prob = float(_model.predict_proba(X_scaled)[0][1])
        is_fraud = bool(_model.predict(X_scaled)[0] == 1)

    # ✅ Risk level
    if prob >= 0.7:
        risk_level = 'high'
    elif prob >= 0.4:
        risk_level = 'medium'
    else:
        risk_level = 'low'

    return {
        'is_fraud': is_fraud,
        'fraud_prob': round(prob, 6),
        'risk_level': risk_level,
    }