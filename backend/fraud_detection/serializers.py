from rest_framework import serializers
from .models import Transaction, FraudAlert


class TransactionSerializer(serializers.ModelSerializer):
    fraud_percent = serializers.SerializerMethodField()

    class Meta:
        model  = Transaction
        fields = '__all__'

    def get_fraud_percent(self, obj):
        return round(obj.fraud_prob * 100, 2)


class FraudAlertSerializer(serializers.ModelSerializer):
    transaction = TransactionSerializer(read_only=True)

    class Meta:
        model  = FraudAlert
        fields = '__all__'


class PredictInputSerializer(serializers.Serializer):
    transaction_id = serializers.CharField(max_length=120, required=False)
    amount         = serializers.FloatField()
    time           = serializers.FloatField(default=0.0)
    v1  = serializers.FloatField(default=0.0); v2  = serializers.FloatField(default=0.0)
    v3  = serializers.FloatField(default=0.0); v4  = serializers.FloatField(default=0.0)
    v5  = serializers.FloatField(default=0.0); v6  = serializers.FloatField(default=0.0)
    v7  = serializers.FloatField(default=0.0); v8  = serializers.FloatField(default=0.0)
    v9  = serializers.FloatField(default=0.0); v10 = serializers.FloatField(default=0.0)
    v11 = serializers.FloatField(default=0.0); v12 = serializers.FloatField(default=0.0)
    v13 = serializers.FloatField(default=0.0); v14 = serializers.FloatField(default=0.0)
    v15 = serializers.FloatField(default=0.0); v16 = serializers.FloatField(default=0.0)
    v17 = serializers.FloatField(default=0.0); v18 = serializers.FloatField(default=0.0)
    v19 = serializers.FloatField(default=0.0); v20 = serializers.FloatField(default=0.0)
    v21 = serializers.FloatField(default=0.0); v22 = serializers.FloatField(default=0.0)
    v23 = serializers.FloatField(default=0.0); v24 = serializers.FloatField(default=0.0)
    v25 = serializers.FloatField(default=0.0); v26 = serializers.FloatField(default=0.0)
    v27 = serializers.FloatField(default=0.0); v28 = serializers.FloatField(default=0.0)


class DashboardStatsSerializer(serializers.Serializer):
    total_transactions = serializers.IntegerField()
    total_fraud        = serializers.IntegerField()
    total_legitimate   = serializers.IntegerField()
    fraud_rate         = serializers.FloatField()
    total_amount       = serializers.FloatField()
    fraud_amount       = serializers.FloatField()
    high_risk_count    = serializers.IntegerField()
