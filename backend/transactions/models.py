from django.db import models

# Create your models here.
class Transaction(models.Model):
 amount = models.FloatField()
 email = models.EmailField()
 location = models.CharField(max_length=103)
 device = models.CharField(max_length=103)
 is_fraud = models.BooleanField(default=False)
 created_at = models.DateTimeField(auto_now_add=True)
 
