from django.db import models


class Transaction(models.Model):
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('analysed',  'Analysed'),
        ('flagged',   'Flagged'),
    ]

    transaction_id = models.CharField(max_length=120, unique=True)
    amount         = models.FloatField()
    time           = models.FloatField(help_text='Seconds elapsed since first transaction')

    # 28 PCA-transformed features from the Kaggle dataset
    v1  = models.FloatField(default=0.0); v2  = models.FloatField(default=0.0)
    v3  = models.FloatField(default=0.0); v4  = models.FloatField(default=0.0)
    v5  = models.FloatField(default=0.0); v6  = models.FloatField(default=0.0)
    v7  = models.FloatField(default=0.0); v8  = models.FloatField(default=0.0)
    v9  = models.FloatField(default=0.0); v10 = models.FloatField(default=0.0)
    v11 = models.FloatField(default=0.0); v12 = models.FloatField(default=0.0)
    v13 = models.FloatField(default=0.0); v14 = models.FloatField(default=0.0)
    v15 = models.FloatField(default=0.0); v16 = models.FloatField(default=0.0)
    v17 = models.FloatField(default=0.0); v18 = models.FloatField(default=0.0)
    v19 = models.FloatField(default=0.0); v20 = models.FloatField(default=0.0)
    v21 = models.FloatField(default=0.0); v22 = models.FloatField(default=0.0)
    v23 = models.FloatField(default=0.0); v24 = models.FloatField(default=0.0)
    v25 = models.FloatField(default=0.0); v26 = models.FloatField(default=0.0)
    v27 = models.FloatField(default=0.0); v28 = models.FloatField(default=0.0)

    # Prediction results
    is_fraud    = models.BooleanField(default=False)
    fraud_prob  = models.FloatField(default=0.0, help_text='0.0 – 1.0')
    risk_level  = models.CharField(max_length=20, default='low',
                                   choices=[('low','Low'),('medium','Medium'),('high','High')])
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='analysed')
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_id} | {'FRAUD' if self.is_fraud else 'OK'} | ${self.amount:.2f}"

    def save(self, *args, **kwargs):
        p = self.fraud_prob
        if p >= 0.7:
            self.risk_level = 'high'
            self.status     = 'flagged'
        elif p >= 0.4:
            self.risk_level = 'medium'
        else:
            self.risk_level = 'low'
        super().save(*args, **kwargs)


class FraudAlert(models.Model):
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE,
                                       related_name='alert')
    message     = models.TextField()
    resolved    = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Alert for {self.transaction.transaction_id}"
