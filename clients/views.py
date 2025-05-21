from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Client, Staff, Subscription, Feedback
from .serializers import ClientSerializer, StaffSerializer, SubscriptionSerializer, FeedbackSerializer
from api.authentication import ClientJWTAuthentication
from django.contrib.auth.hashers import make_password
from datetime import date
from api.views import SubscriptionSerializer

# Create your views here.

class ClientProfileView(APIView):
    authentication_classes = [ClientJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            client = request.user
            
            # Get client's staff members
            staff_members = Staff.objects.filter(client=client)
            staff_data = StaffSerializer(staff_members, many=True).data
            
            # Get client's subscriptions
            subscriptions = Subscription.objects.filter(company=client)
            subscription_data = SubscriptionSerializer(subscriptions, many=True).data
            
            # Get client's feedback history
            feedback_history = Feedback.objects.filter(company=client).order_by('-feedback_date')
            feedback_data = FeedbackSerializer(feedback_history, many=True).data
            
            # Prepare response data
            response_data = {
                'client_info': {
                    'company_id': client.company_id,
                    'company_name': client.company_name,
                    'company_email': client.company_email,
                    'company_address': client.company_address,
                    'company_contact_no': client.company_contact_no,
                },
                'staff_members': staff_data,
                'subscriptions': subscription_data,
                'feedback_history': feedback_data
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ClientHomeView(APIView):
    authentication_classes = [ClientJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            client = request.user
            
            # Get summary counts
            staff_count = Staff.objects.filter(client=client).count()
            subscription_count = Subscription.objects.filter(company=client).count()
            feedback_count = Feedback.objects.filter(company=client).count()
            
            # Prepare response data with only shortcuts and summary
            response_data = {
                'summary': {
                    'total_staff': staff_count,
                    'total_subscriptions': subscription_count,
                    'total_feedback': feedback_count
                },
                'shortcuts': {
                    'add_staff': {
                        'url': '/api/client/add-staff/',
                        'button_text': 'Add New Staff',
                        'icon': 'user-plus'
                    },
                    'submit_feedback': {
                        'url': '/api/client/feedback/',
                        'button_text': 'Submit Feedback',
                        'icon': 'comment'
                    },
                    'view_profile': {
                        'url': '/api/client/profile/',
                        'button_text': 'View Profile',
                        'icon': 'user'
                    }
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class FeedbackSubmissionView(APIView):
    authentication_classes = [ClientJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            client = request.user
            
            # Validate feedback score
            feedback_score = request.data.get('feedback_score')
            if not isinstance(feedback_score, int) or feedback_score < 1 or feedback_score > 5:
                return Response(
                    {'error': 'Feedback score must be an integer between 1 and 5'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the next feedback_id
            last_feedback = Feedback.objects.order_by('-feedback_id').first()
            next_id = (last_feedback.feedback_id + 1) if last_feedback else 1
            
            # Create new feedback
            feedback = Feedback.objects.create(
                feedback_id=next_id,
                company=client,
                feedback_date=date.today(),
                feedback_score=feedback_score,
                client_complaints=request.data.get('client_complaints', '')
            )
            
            return Response({
                'message': 'Feedback submitted successfully',
                'feedback': FeedbackSerializer(feedback).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class StaffRegistrationView(APIView):
    authentication_classes = [ClientJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            client = request.user
            
            # Validate required fields
            required_fields = ['staff_id', 'name', 'email', 'password']
            for field in required_fields:
                if field not in request.data:
                    return Response(
                        {'error': f'Missing required field: {field}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Check if staff_id already exists
            if Staff.objects.filter(staff_id=request.data['staff_id']).exists():
                return Response(
                    {'error': 'Staff ID already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create new staff member
            staff = Staff.objects.create(
                staff_id=request.data['staff_id'],
                client=client,
                name=request.data['name'],
                email=request.data['email'],
                password=make_password(request.data['password'])
            )
            
            return Response({
                'message': 'Staff registered successfully',
                'staff': StaffSerializer(staff).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )