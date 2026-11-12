from django.contrib import admin
from .models import Transaction, FraudAlert

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display  = ('transaction_id', 'amount', 'is_fraud', 'risk_level', 'fraud_prob', 'created_at')
    list_filter   = ('is_fraud', 'risk_level', 'status')
    search_fields = ('transaction_id',)
    readonly_fields = ('fraud_prob', 'risk_level', 'is_fraud', 'created_at')

@admin.register(FraudAlert)
class FraudAlertAdmin(admin.ModelAdmin):
    list_display = ('transaction', 'resolved', 'created_at')
    list_filter  = ('resolved',)
