from django.urls import path 
from .views import register, login, create_transaction, transaction_history, model_metrics

urlpatterns = [
    path('register/', register),
    path('login/', login),
    path('transaction/', create_transaction),
    path('history/', transaction_history),
    path('metrics/', model_metrics),
]