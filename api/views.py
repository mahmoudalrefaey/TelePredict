from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import pandas as pd
import os
import logging
from ml_utils.predictor import ChurnPredictor, ModelPredictionError
from ml_utils.preprocessor import DataPreprocessingError
from .models import UploadedDataset
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from clients.models import Client, Subscription, Staff
from django.contrib.auth.hashers import make_password, check_password
from django.http import HttpResponse
import csv
from datetime import datetime
import jwt
from django.conf import settings
from .authentication import StaffJWTAuthentication
from rest_framework.authentication import BaseAuthentication

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create your views here.

# Registration serializer
class RegisterSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    company_id = serializers.IntegerField(write_only=True)
    company_name = serializers.CharField(write_only=True)
    company_address = serializers.CharField(write_only=True)
    company_contact_no = serializers.CharField(write_only=True)
    company_email = serializers.EmailField(write_only=True)

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError('Passwords do not match.')
        if Client.objects.filter(company_id=data['company_id']).exists():
            raise serializers.ValidationError('Company ID already exists.')
        return data

    def create(self, validated_data):
        try:
            validated_data.pop('password2')
            client = Client.objects.create(
                company_id=validated_data['company_id'],
                company_name=validated_data['company_name'],
                company_address=validated_data['company_address'],
                company_contact_no=validated_data['company_contact_no'],
                company_email=validated_data['company_email'],
                password=make_password(validated_data['password'])
            )
            return client
        except Exception as e:
            raise serializers.ValidationError({'detail': f'Registration failed: {str(e)}'})

    def to_representation(self, instance):
        return {
            "company_id": instance.company_id,
            "company_name": instance.company_name,
            "company_address": instance.company_address,
            "company_contact_no": instance.company_contact_no,
            "company_email": instance.company_email,
        }

# Registration API view
class RegisterView(generics.CreateAPIView):
    queryset = Client.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

# Login API view (using SimpleJWT)
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer

class DataUploadView(APIView):
    authentication_classes = [StaffJWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        try:
            file_obj = request.FILES.get('file')
            if not file_obj:
                return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                df = pd.read_csv(file_obj)
            except Exception as e:
                logger.error(f"Error reading CSV: {str(e)}")
                return Response({'error': f'Error reading CSV: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                # Store customerID separately if it exists
                customer_ids = None
                if 'customerID' in df.columns:
                    customer_ids = df['customerID'].tolist()
                    df = df.drop(columns=['customerID'])

                # Preprocess the remaining data
                df = df.dropna()
                for col in df.select_dtypes(include=['object']).columns:
                    df[col] = df[col].astype('category').cat.codes
                for col in df.select_dtypes(include=['float64', 'int64']).columns:
                    df[col] = (df[col] - df[col].mean()) / df[col].std()

                # Create preview with original customerID if available
                preview_data = df.head(5).to_dict(orient='records')
                if customer_ids is not None:
                    preview = []
                    for i, row in enumerate(preview_data):
                        preview.append({
                            'customerID': customer_ids[i],
                            **row
                        })
                else:
                    preview = preview_data

            except Exception as e:
                logger.error(f"Error preprocessing data: {str(e)}")
                return Response({'error': f'Error preprocessing data: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                # Log the data being saved
                logger.info(f"Data being saved: {df.to_dict(orient='records')}")
                entry = UploadedDataset.objects.create(
                    staff=request.user,  # Link to staff
                    filename=file_obj.name,
                    data={
                        'processed_data': df.to_dict(orient='records'),
                        'customer_ids': customer_ids
                    }
                )
                logger.info(f"Saved upload: id={entry.id}, staff={request.user}, filename={file_obj.name}")
            except Exception as e:
                logger.error(f"Error saving uploaded dataset: {str(e)}")
                return Response({'error': f'Error saving uploaded dataset: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({
                'upload_id': entry.id,
                'preview': preview, 
                'columns': list(df.columns),
                'total_rows': len(df),
                'filename': file_obj.name,
                'has_customer_ids': customer_ids is not None
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Unexpected error in upload: {str(e)}")
            return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PredictView(APIView):
    authentication_classes = [StaffJWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'finalized_model.pkl')
        self.predictor = None
        
    def post(self, request, format=None):
        """
        Handle prediction by upload_id.
        Expects JSON body: { "upload_id": <id> }
        """
        logger.info("Received prediction request")
        try:
            upload_id = request.data.get('upload_id')
            if not upload_id:
                return Response({'error': 'No upload_id provided.'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                upload = UploadedDataset.objects.get(id=upload_id, staff=request.user)
            except UploadedDataset.DoesNotExist:
                return Response({'error': 'Upload not found.'}, status=status.HTTP_404_NOT_FOUND)
            
            # Convert stored data back to DataFrame
            df = pd.DataFrame(upload.data['processed_data'])
            if df.empty:
                return Response({'error': 'Stored dataset is empty.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get customer IDs if they exist
            customer_ids = upload.data.get('customer_ids')
            
            # Initialize predictor if not already done
            if self.predictor is None:
                try:
                    self.predictor = ChurnPredictor(self.model_path)
                except ModelPredictionError as e:
                    logger.error(f"Error initializing predictor: {str(e)}")
                    return Response(
                        {'error': f'Error initializing model: {str(e)}'}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            
            # Make predictions
            try:
                results = self.predictor.predict(df)
                logger.info("Successfully generated predictions")
                
                # Format output with customer IDs if available
                output = []
                for i in range(len(results['predictions'])):
                    churn_probability = float(results['probabilities'][i]) * 100
                    is_churn = int(results['predictions'][i]) == 1
                    
                    # Determine risk level
                    if churn_probability >= 75:
                        risk_level = "High Risk"
                    elif churn_probability >= 50:
                        risk_level = "Medium Risk"
                    else:
                        risk_level = "Low Risk"
                    
                    result_item = {
                        'predicted_class': "Churn Risk" if is_churn else "Not Churning",
                        'churn_probability': f"{round(churn_probability, 2)}%",
                        'risk_level': risk_level,
                        'recommendation': "Immediate action required" if is_churn and churn_probability >= 75 else 
                                        "Monitor closely" if is_churn and churn_probability >= 50 else 
                                        "Regular monitoring"
                    }
                    
                    if customer_ids is not None:
                        result_item['customerID'] = customer_ids[i]
                    else:
                        result_item['customerID'] = f"ID_{i}"
                    
                    output.append(result_item)
                
                # Update the status to 'processed' and save results
                upload.status = 'processed'
                upload.data = {
                    'processed_data': upload.data['processed_data'],
                    'customer_ids': customer_ids,
                    'predictions': output
                }
                upload.save()
                
                return Response({
                    'results': output,
                    'summary': {
                        'total_customers': len(output),
                        'high_risk_count': sum(1 for r in output if r['risk_level'] == "High Risk"),
                        'medium_risk_count': sum(1 for r in output if r['risk_level'] == "Medium Risk"),
                        'low_risk_count': sum(1 for r in output if r['risk_level'] == "Low Risk")
                    }
                }, status=status.HTTP_200_OK)
                
            except (ModelPredictionError, DataPreprocessingError) as e:
                logger.error(f"Error making predictions: {str(e)}")
                return Response(
                    {'error': f'Error making predictions: {str(e)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return Response(
                {'error': f'Unexpected error: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class HistoryListView(APIView):
    authentication_classes = [StaffJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        uploads = UploadedDataset.objects.filter(staff=request.user).order_by('-upload_date')
        data = [
            {
                'id': upload.id,
                'filename': upload.filename,
                'upload_date': upload.upload_date,
                'status': upload.status
            }
            for upload in uploads
        ]
        return Response(data)

class HistoryDetailView(APIView):
    authentication_classes = [StaffJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            upload = UploadedDataset.objects.get(id=id, staff=request.user)
            return Response({
                'id': upload.id,
                'filename': upload.filename,
                'upload_date': upload.upload_date,
                'status': upload.status,
                'data': upload.data
            })
        except UploadedDataset.DoesNotExist:
            return Response({'error': 'Upload not found.'}, status=status.HTTP_404_NOT_FOUND)

class ExportResultsView(APIView):
    authentication_classes = [StaffJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, upload_id):
        try:
            # Get the uploaded dataset
            upload = UploadedDataset.objects.get(id=upload_id, staff=request.user)
            
            # Check if the data has the expected structure
            if not upload.data or 'predictions' not in upload.data:
                return Response({'error': 'No prediction results found.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create the response
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="predictions_{upload_id}.csv"'
            
            # Create CSV writer
            writer = csv.writer(response)
            
            # Write header
            writer.writerow(['Customer ID', 'Predicted Class', 'Churn Probability', 'Risk Level', 'Recommendation'])
            
            # Write data
            for row in upload.data['predictions']:
                writer.writerow([
                    row.get('customerID', 'N/A'),
                    row.get('predicted_class', 'N/A'),
                    row.get('churn_probability', 'N/A'),
                    row.get('risk_level', 'N/A'),
                    row.get('recommendation', 'N/A')
                ])
            
            return response
        except UploadedDataset.DoesNotExist:
            return Response({'error': 'Upload not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HomeView(APIView):
    authentication_classes = [StaffJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        clients = Client.objects.all()
        serializer = ClientSerializer(clients, many=True)
        return Response(serializer.data)

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['subscription_id', 'plan_type', 'monthly_charges', 'total_charges', 'start_date', 'end_date', 'active']

class ClientSerializer(serializers.ModelSerializer):
    subscriptions = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = ['company_id', 'company_name', 'company_address', 'company_contact_no', 'company_email', 'subscriptions']

    def get_subscriptions(self, obj):
        subs = Subscription.objects.filter(company=obj)
        return SubscriptionSerializer(subs, many=True).data

@api_view(['POST'])
@permission_classes([AllowAny])
def staff_register(request):
    serializer = StaffRegisterSerializer(data=request.data)
    if serializer.is_valid():
        staff = serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

class StaffRegisterSerializer(serializers.Serializer):
    staff_id = serializers.CharField()
    client_id = serializers.IntegerField(write_only=True)
    name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError('Passwords do not match.')
        if len(data['password']) < 8:
            raise serializers.ValidationError('Password must be at least 8 characters long.')
        if Staff.objects.filter(staff_id=data['staff_id']).exists():
            raise serializers.ValidationError('Staff ID already exists.')
        if not Client.objects.filter(company_id=data['client_id']).exists():
            raise serializers.ValidationError('Client does not exist.')
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        client = Client.objects.get(company_id=validated_data['client_id'])
        staff = Staff.objects.create(
            staff_id=validated_data['staff_id'],
            client=client,
            name=validated_data['name'],
            email=validated_data['email'],
            password=make_password(validated_data['password'])
        )
        return staff

    def to_representation(self, instance):
        return {
            "staff_id": instance.staff_id,
            "client_id": instance.client.company_id,
            "name": instance.name,
            "email": instance.email,
        }

class StaffLoginSerializer(serializers.Serializer):
    staff_id = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            staff = Staff.objects.get(staff_id=data['staff_id'])
            if not check_password(data['password'], staff.password):
                raise serializers.ValidationError('Invalid password.')
            return {"staff_id": staff.staff_id, "client_id": staff.client.company_id, "name": staff.name, "email": staff.email}
        except Staff.DoesNotExist:
            raise serializers.ValidationError('Staff ID not found.')

@api_view(['POST'])
@permission_classes([AllowAny])
def staff_login(request):
    serializer = StaffLoginSerializer(data=request.data)
    if serializer.is_valid():
        staff = Staff.objects.get(staff_id=request.data['staff_id'])
        payload = {
            'staff_id': staff.staff_id,
            'client_id': staff.client.company_id,
            'name': staff.name,
            'email': staff.email,
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return Response({'token': token, **payload}, status=200)
    return Response(serializer.errors, status=400)

class ClientLoginSerializer(serializers.Serializer):
    company_id = serializers.IntegerField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            client = Client.objects.get(company_id=data['company_id'])
            if not check_password(data['password'], client.password):
                raise serializers.ValidationError('Invalid password.')
            return {
                "company_id": client.company_id,
                "company_name": client.company_name,
                "company_email": client.company_email,
            }
        except Client.DoesNotExist:
            raise serializers.ValidationError('Company ID not found.')

@api_view(['POST'])
@permission_classes([AllowAny])
def client_login(request):
    serializer = ClientLoginSerializer(data=request.data)
    if serializer.is_valid():
        client = Client.objects.get(company_id=request.data['company_id'])
        payload = {
            'company_id': client.company_id,
            'company_name': client.company_name,
            'company_email': client.company_email,
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return Response({'token': token, **payload}, status=200)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def login_info(request):
    return Response({
        'message': 'Please use /api/client/login/ for company login or /api/staff/login/ for staff login.'
    })

class ClientAddStaffSerializer(serializers.Serializer):
    staff_id = serializers.CharField()
    name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError('Passwords do not match.')
        if len(data['password']) < 8:
            raise serializers.ValidationError('Password must be at least 8 characters long.')
        if Staff.objects.filter(staff_id=data['staff_id']).exists():
            raise serializers.ValidationError('Staff ID already exists.')
        return data

    def create(self, validated_data, client):
        validated_data.pop('password2')
        staff = Staff.objects.create(
            staff_id=validated_data['staff_id'],
            client=client,
            name=validated_data['name'],
            email=validated_data['email'],
            password=make_password(validated_data['password'])
        )
        return staff

    def to_representation(self, instance):
        return {
            "staff_id": instance.staff_id,
            "name": instance.name,
            "email": instance.email,
        }

class ClientJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        try:
            # Extract the token from the header
            token = auth_header.split(' ')[1]
            # Decode the token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            # Get the client
            client = Client.objects.get(company_id=payload['company_id'])
            return (client, None)
        except (jwt.InvalidTokenError, Client.DoesNotExist, IndexError):
            return None

    def authenticate_header(self, request):
        return 'Bearer'

@api_view(['POST'])
@authentication_classes([ClientJWTAuthentication])
@permission_classes([IsAuthenticated])
def client_add_staff(request):
    """
    Endpoint for clients to add new staff members.
    Requires client authentication.
    """
    try:
        # Get the client from the authenticated user
        client = request.user
        
        # Log the request data for debugging
        logger.info(f"Received staff registration request from client {client.company_id}")
        logger.info(f"Request data: {request.data}")
        
        # Initialize serializer with request data
        serializer = ClientAddStaffSerializer(data=request.data)
        
        if serializer.is_valid():
            # Create staff member with the authenticated client
            staff = serializer.create(serializer.validated_data, client)
            logger.info(f"Successfully created staff member {staff.staff_id} for client {client.company_id}")
            return Response(ClientAddStaffSerializer(staff).data, status=status.HTTP_201_CREATED)
        
        logger.error(f"Validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Client.DoesNotExist:
        logger.error(f"Client not found for user {request.user}")
        return Response(
            {'error': 'Client not found.'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Unexpected error in client_add_staff: {str(e)}", exc_info=True)
        return Response(
            {
                'error': 'Internal server error',
                'detail': str(e),
                'type': type(e).__name__
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
