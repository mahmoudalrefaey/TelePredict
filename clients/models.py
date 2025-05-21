from enum import unique
from random import choice, choices
from django.db import models

# Create your models here.
class Client(models.Model):
    company_id = models.IntegerField(primary_key=True)
    company_name = models.CharField(max_length=50)
    company_address = models.TextField()
    company_contact_no = models.CharField(max_length=13)
    company_email = models.CharField(max_length=50)
    password = models.CharField(max_length=128)  # Store hashed password
    
    @property
    def is_authenticated(self):
        return True  # Client users are always authenticated when they exist

    @property
    def is_anonymous(self):
        return False

    def get_username(self):
        return str(self.company_id)
    
    def __str__(self):
        return self.company_name

class Staff(models.Model):
    staff_id = models.CharField(max_length=50, primary_key=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    password = models.CharField(max_length=128)  # Store hashed password
    # Add more fields as needed

    @property
    def is_authenticated(self):
        return True  # Staff users are always authenticated when they exist

    def __str__(self):
        return f"{self.name} ({self.staff_id})"

class Feedback(models.Model):
    feedback_id = models.IntegerField(primary_key=True)
    company = models.ForeignKey(Client, on_delete=models.CASCADE)
    feedback_date = models.DateField()
    feedback_score = models.IntegerField()
    client_complaints = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return f"Feedback from {self.company.company_name} on {self.feedback_date}"

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

    PLAN_DURATIONS = {
        'basic': 2,
        'standard': 4,
        'partner': 6,
    }
    PLAN_PRICES = {
        'basic': 100.0,
        'standard': 250.0,
        'partner': 500.0,
    }

    def get_plan_duration(self):
        return self.PLAN_DURATIONS.get(self.plan_type, 0)

    def get_monthly_rate(self):
        return self.PLAN_PRICES.get(self.plan_type, 0.0)

    def save(self, *args, **kwargs):
        from datetime import date, timedelta
        # Set start_date to today if not set
        if not self.start_date:
            self.start_date = date.today()
        # Enforce only one active subscription per client
        if self.active:
            existing = Subscription.objects.filter(company=self.company, active=True).exclude(pk=self.pk)
            if existing.exists():
                raise ValueError("A client can only have one active subscription at a time.")
        if self.plan_type in self.PLAN_DURATIONS:
            duration = self.PLAN_DURATIONS[self.plan_type]
            self.monthly_charges = self.PLAN_PRICES[self.plan_type]
            self.total_charges = self.monthly_charges * duration
            if self.start_date:
                self.end_date = self.start_date + timedelta(days=30*duration)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Subscription {self.subscription_id} for {self.company.company_name} ({self.plan_type}) | Duration: {self.get_plan_duration()} months | Monthly: ${self.get_monthly_rate()} | Total: ${self.total_charges}"

    def max_staff_allowed(self):
        if self.plan_type == 'basic':
            return 5
        elif self.plan_type == 'standard':
            return 20
        elif self.plan_type == 'partner':
            return None  # Unlimited
        return 0

    def clean(self):
        from datetime import date, timedelta
        # Set start_date if not set
        if not self.start_date:
            self.start_date = date.today()
        # Set charges and end_date based on plan
        if self.plan_type in self.PLAN_DURATIONS:
            duration = self.PLAN_DURATIONS[self.plan_type]
            self.monthly_charges = self.PLAN_PRICES[self.plan_type]
            self.total_charges = self.monthly_charges * duration
            if self.start_date:
                self.end_date = self.start_date + timedelta(days=30*duration)