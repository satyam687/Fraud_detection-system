from django.urls import path
from .views import (
    PredictFraudView,
    TransactionListView,
    TransactionDetailView,
    DashboardStatsView,
    FraudAlertListView,
)

urlpatterns = [
    path('predict/',              PredictFraudView.as_view()),
    path('transactions/',         TransactionListView.as_view()),
    path('transactions/<int:pk>/',TransactionDetailView.as_view()),
    path('stats/',                DashboardStatsView.as_view()),
    path('alerts/',               FraudAlertListView.as_view()),
    path('alerts/<int:pk>/resolve/', FraudAlertListView.as_view()),
]
