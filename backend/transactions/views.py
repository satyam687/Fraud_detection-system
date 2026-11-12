from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail

from .models import Transaction
from .Serializer import TransactionSerializer
from .ml_model import get_model_metrics, is_email_suspicious, predict_fraud


# ✅ REGISTER
@api_view(['POST'])
def register(request):
    username = (request.data.get('username') or '').strip()
    password = request.data.get('password') or ''

    if not username or not password:
        return Response({"error": "Username and password are required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    User.objects.create_user(username=username, password=password)
    return Response({"message": "User created"}, status=201)


# ✅ LOGIN
@api_view(['POST'])
def login(request):
    username = (request.data.get('username') or '').strip()
    password = request.data.get('password') or ''

    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({'access': str(refresh.access_token)})

    return Response({"error": "Invalid credentials"}, status=401)


# ✅ CREATE TRANSACTION (FINAL FIX 🔥)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_transaction(request):
    try:
        amount = request.data.get('amount')
        email = request.data.get('email')

        # ✅ amount validation
        if not amount:
            return Response({"error": "Amount is required"}, status=400)

        try:
            amount = float(amount)
        except:
            return Response({"error": "Invalid amount"}, status=400)

        # ✅ email validation
        if not email:
            return Response({"error": "Email is required"}, status=400)

        if "@" not in email:
            return Response({"error": "Invalid email format"}, status=400)

        location = request.data.get('location', 'India')
        device = request.data.get('device', 'Mobile')

        # ✅ fraud logic
        amount_fraud = predict_fraud(
            amount,
            email=email,
            location=location,
            device=device,
        )
        email_fraud = is_email_suspicious(email)

        is_fraud = bool(amount_fraud or email_fraud)

        # ✅ save transaction
        transaction = Transaction.objects.create(
            amount=amount,
            email=email,
            location=location,
            device=device,
            is_fraud=is_fraud
        )

        # ✅ email alert
        subject = "🚨 Fraud Detection Alert"
        message = f"""
Transaction Details:

Amount: ₹{amount}
Email: {email}
Status: {"❌ FRAUD" if is_fraud else "✅ SAFE"}

Thank you.
"""

        try:
            send_mail(
                subject,
                message,
                'your@gmail.com',
                ['user@gmail.com'],
                fail_silently=True
            )
        except Exception as e:
            print("Email error:", e)

        # ✅ response
        return Response({
            "id": transaction.id,
            "amount": amount,
            "email": email,
            "status": "Fraud" if is_fraud else "Safe",
            "is_fraud": is_fraud
        })

    except Exception as e:
        print("ERROR:", e)
        return Response({"error": str(e)}, status=500)


# ✅ TRANSACTION HISTORY
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_history(request):
    data = Transaction.objects.all().order_by('-created_at')
    serializer = TransactionSerializer(data, many=True)
    return Response(serializer.data)


# ✅ MODEL & DATASET METRICS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def model_metrics(request):
    return Response(get_model_metrics())