from enum import unique
from random import choice, choices
from django.db import models

# Create your models here.
class Client(models.Model):
    company_id = models.IntegerField(primary_key=True)
    company_name = models.CharField(max_length=50)
    company_address = models.TextField()
    company_contact_no = models.CharField(max_length=13)
    company_email = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.company_name

class LoginInfo(models.Model):
    business_id = models.CharField(max_length=50, primary_key=True)
    company = models.ForeignKey(Client, on_delete=models.CASCADE)
    passcode_hash = models.TextField()

class Feedback(models.Model):
    feedback_id = models.IntegerField(primary_key=True)  # Changed from feedbackID
    company = models.ForeignKey(Client, on_delete=models.CASCADE)  # Changed from companyID
    feedback_date = models.DateField()
    feedback_score = models.IntegerField()
    client_complaints = models.CharField(max_length=200, null=True, blank=True)  # Changed from Client_complaints

class Subscription(models.Model):
    plans = [
        ('basic', 'Basic'),
        ('standard', 'Standard'),
        ('partner', 'Partner'),
    ]
    subscription_id = models.IntegerField(primary_key=True)
    company = models.ForeignKey(Client, on_delete=models.CASCADE)
    plan_type = models.CharField(max_length=30, choices=plans)
    monthly_charges = models.FloatField()
    total_charges = models.FloatField()
    start_date = models.DateField()
    end_date = models.DateField()
    active = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        from django.utils import timezone
        current_date = timezone.now().date()
        self.active = current_date <= self.end_date
        super().save(*args, **kwargs)