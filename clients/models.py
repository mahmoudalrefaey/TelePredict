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