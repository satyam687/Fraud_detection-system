import uuid
from django.db.models import Sum, Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view
from rest_framework.response import Response
 
from .models import Transaction, FraudAlert
from .serializers import (
    TransactionSerializer, FraudAlertSerializer,
    PredictInputSerializer, DashboardStatsSerializer,
)
from .ml_service import predict


@api_view(['GET'])
def get_transactions(request):
    search = request.GET.get('search', '')
    risk = request.GET.get('risk')
    is_fraud = request.GET.get('is_fraud')

    qs = Transaction.objects.all()

    if search:
        qs = qs.filter(description__icontains=search)

    if risk:
        qs = qs.filter(risk=risk)

    if is_fraud:
        qs = qs.filter(is_fraud=is_fraud == 'true')

    data = list(qs.values())
    return Response(data)


# ── Pagination ──────────────────────────────────────────────────────────
class TxPagination(PageNumberPagination):
    page_size            = 10
    page_size_query_param = 'page_size'
    max_page_size        = 100


# ── POST /api/fraud/predict/ ─────────────────────────────────────────────
class PredictFraudView(APIView):
    def post(self, request):
        ser = PredictInputSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        data = ser.validated_data
        tx_id = data.get('transaction_id') or f"TX-{uuid.uuid4().hex[:10].upper()}"

        # Run ML prediction
        result = predict(data)

        # Persist to MySQL
        tx = Transaction.objects.create(
            transaction_id = tx_id,
            amount         = data['amount'],
            time           = data['time'],
            **{f'v{i}': data[f'v{i}'] for i in range(1, 29)},
            is_fraud       = result['is_fraud'],
            fraud_prob     = result['fraud_prob'],
        )

        # Create alert for high-risk
        if result['is_fraud'] or result['risk_level'] == 'high':
            FraudAlert.objects.create(
                transaction=tx,
                message=(
                    f"Fraud detected on transaction {tx_id}. "
                    f"Amount: ${data['amount']:.2f}. "
                    f"Probability: {result['fraud_prob']*100:.1f}%."
                ),
            )

        return Response({
            'transaction_id':   tx_id,
            'is_fraud':         result['is_fraud'],
            'fraud_probability': round(result['fraud_prob'] * 100, 2),
            'risk_level':       result['risk_level'],
            'amount':           data['amount'],
            'message':          'FRAUD DETECTED — Alert created.' if result['is_fraud'] else 'Transaction appears legitimate.',
        }, status=status.HTTP_201_CREATED)


# ── GET /api/fraud/transactions/ ─────────────────────────────────────────
class TransactionListView(APIView):
    def get(self, request):
        qs = Transaction.objects.all()

        # Filters
        risk   = request.query_params.get('risk')
        fraud  = request.query_params.get('is_fraud')
        search = request.query_params.get('search')

        if risk:
            qs = qs.filter(risk_level=risk)
        if fraud is not None:
            qs = qs.filter(is_fraud=(fraud.lower() == 'true'))
        if search:
            qs = qs.filter(transaction_id__icontains=search)

        paginator = TxPagination()
        page = paginator.paginate_queryset(qs, request)
        ser  = TransactionSerializer(page, many=True)
        return paginator.get_paginated_response(ser.data)


# ── GET /api/fraud/transactions/<id>/ ────────────────────────────────────
class TransactionDetailView(APIView):
    def get(self, request, pk):
        try:
            tx = Transaction.objects.get(pk=pk)
        except Transaction.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(TransactionSerializer(tx).data)


# ── GET /api/fraud/stats/ ────────────────────────────────────────────────
class DashboardStatsView(APIView):
    def get(self, request):
        total = Transaction.objects.count()
        fraud = Transaction.objects.filter(is_fraud=True).count()
        legit = total - fraud
        agg   = Transaction.objects.aggregate(
            total_amount = Sum('amount'),
            fraud_amount = Sum('amount', filter=Q(is_fraud=True)),
        )
        high_risk = Transaction.objects.filter(risk_level='high').count()

        data = {
            'total_transactions': total,
            'total_fraud':        fraud,
            'total_legitimate':   legit,
            'fraud_rate':         round((fraud / total * 100) if total else 0, 2),
            'total_amount':       round(agg['total_amount'] or 0, 2),
            'fraud_amount':       round(agg['fraud_amount'] or 0, 2),
            'high_risk_count':    high_risk,
        }
        return Response(DashboardStatsSerializer(data).data)

class CustomPagination(PageNumberPagination):
    page_size = 10

@api_view(['GET'])
def get_transactions(request):
    qs = Transaction.objects.all()

    search = request.GET.get('search')
    if search:
        qs = qs.filter(transaction_id__icontains=search)

    paginator = CustomPagination()
    page = paginator.paginate_queryset(qs, request)

    return paginator.get_paginated_response([
        {
            "id": tx.id,
            "transaction_id": tx.transaction_id,
            "amount": tx.amount
        }
        for tx in page
    ])
# ── GET /api/fraud/alerts/ ───────────────────────────────────────────────
class FraudAlertListView(APIView):
    def get(self, request):
        alerts = FraudAlert.objects.select_related('transaction').filter(resolved=False)
        return Response(FraudAlertSerializer(alerts, many=True).data)

    def patch(self, request, pk=None):
        """PATCH /api/fraud/alerts/<pk>/resolve/ to resolve alert"""
        try:
            alert = FraudAlert.objects.get(pk=pk)
        except FraudAlert.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        alert.resolved = True
        alert.save()
        return Response({'message': 'Alert resolved.'})
