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
from rest_framework.decorators import api_view, permission_classes
from clients.models import Client, LoginInfo
from django.contrib.auth.hashers import make_password

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create your views here.

# Registration serializer
class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    company_id = serializers.IntegerField(write_only=True)
    company_name = serializers.CharField(write_only=True)
    company_address = serializers.CharField(write_only=True)
    company_contact_no = serializers.CharField(write_only=True)
    company_email = serializers.EmailField(write_only=True)
    business_id = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError('Passwords do not match.')
        if Client.objects.filter(company_email=data['company_email']).exists():
            raise serializers.ValidationError('Company email already exists.')
        if LoginInfo.objects.filter(business_id=data['business_id']).exists():
            raise serializers.ValidationError('Business ID already exists.')
        if Client.objects.filter(company_id=data['company_id']).exists():
            raise serializers.ValidationError('Company ID already exists.')
        return data

    def create(self, validated_data):
        try:
            # Remove password2 from validated_data
            validated_data.pop('password2')
            # Create Django User
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password']
            )
            # Create Client
            client = Client.objects.create(
                company_id=validated_data['company_id'],
                company_name=validated_data['company_name'],
                company_address=validated_data['company_address'],
                company_contact_no=validated_data['company_contact_no'],
                company_email=validated_data['company_email']
            )
            # Create LoginInfo (passcode hash = password hash)
            passcode_hash = make_password(validated_data['password'])
            login_info = LoginInfo.objects.create(
                business_id=validated_data['business_id'],
                company=client,
                passcode_hash=passcode_hash
            )
            return user
        except Exception as e:
            raise serializers.ValidationError({'detail': f'Registration failed: {str(e)}'})

    def to_representation(self, instance):
        return {
            "username": instance.username,
            "email": instance.email,
        }

# Registration API view
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

# Login API view (using SimpleJWT)
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer

class DataUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            df = pd.read_csv(file_obj)
            # Example preprocessing: drop missing, encode categoricals, normalize numerics
            df = df.dropna()
            for col in df.select_dtypes(include=['object']).columns:
                df[col] = df[col].astype('category').cat.codes
            for col in df.select_dtypes(include=['float64', 'int64']).columns:
                df[col] = (df[col] - df[col].mean()) / df[col].std()
            preview = df.head(5).to_dict(orient='records')
            # Save uploaded dataset to database IMMEDIATELY
            try:
                entry = UploadedDataset.objects.create(
                    user=request.user,
                    filename=file_obj.name,
                    data=df.to_dict(orient='records')
                )
                logger.info(f"Saved upload: id={entry.id}, user={request.user.username}, filename={file_obj.name}")
            except Exception as e:
                logger.error(f"Error saving uploaded dataset: {str(e)}")
            return Response({'preview': preview, 'columns': list(df.columns)}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PredictView(APIView):
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
                upload = UploadedDataset.objects.get(id=upload_id, user=request.user)
            except UploadedDataset.DoesNotExist:
                return Response({'error': 'Upload not found.'}, status=status.HTTP_404_NOT_FOUND)
            # Convert stored data back to DataFrame
            df = pd.DataFrame(upload.data)
            if df.empty:
                return Response({'error': 'Stored dataset is empty.'}, status=status.HTTP_400_BAD_REQUEST)
            # Extract customerID if present
            customer_ids = None
            if 'customerID' in df.columns:
                customer_ids = df['customerID'].tolist()
                df = df.drop(columns=['customerID'])
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
                # Attach customerID to each result if available and format output
                if customer_ids is not None:
                    output = []
                    for i in range(len(results['predictions'])):
                        pred_label = 'Churn Risk' if int(results['predictions'][i]) == 1 else 'Not Churning'
                        output.append({
                            'customerID': customer_ids[i],
                            'predicted_class': pred_label,
                            'probability': f"{round(float(results['probabilities'][i]) * 100, 2)}%"
                        })
                    return Response({'results': output}, status=status.HTTP_200_OK)
                else:
                    # If no customerID, just return index as id
                    output = []
                    for i in range(len(results['predictions'])):
                        pred_label = 'Churn Risk' if int(results['predictions'][i]) == 1 else 'Not Churning'
                        output.append({
                            'customerID': i,
                            'predicted_class': pred_label,
                            'probability': f"{round(float(results['probabilities'][i]) * 100, 2)}%"
                        })
                    return Response({'results': output}, status=status.HTTP_200_OK)
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def history_list(request):
    uploads = UploadedDataset.objects.filter(user=request.user).order_by('-upload_date')
    data = [
        {
            'id': upload.id,
            'filename': upload.filename,
            'upload_date': upload.upload_date.strftime('%Y-%m-%d %H:%M:%S')
        }
        for upload in uploads
    ]
    return Response({'history': data})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def history_detail(request, id):
    try:
        upload = UploadedDataset.objects.get(id=id, user=request.user)
        return Response({'id': upload.id, 'filename': upload.filename, 'upload_date': upload.upload_date.strftime('%Y-%m-%d %H:%M:%S'), 'data': upload.data})
    except UploadedDataset.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
