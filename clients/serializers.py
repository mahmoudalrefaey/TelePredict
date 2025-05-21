from rest_framework import serializers
from .models import Client, Staff, Subscription, Feedback

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = ['staff_id', 'name', 'email']

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['subscription_id', 'plan_type', 'monthly_charges', 'total_charges', 
                 'start_date', 'end_date', 'active']

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['feedback_id', 'feedback_date', 'feedback_score', 'client_complaints']

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['company_id', 'company_name', 'company_email', 'company_address', 
                 'company_contact_no'] 