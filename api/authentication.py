from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
import jwt
from django.conf import settings
from clients.models import Staff, Client

class StaffJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            staff_id = payload.get('staff_id')
            staff = Staff.objects.get(staff_id=staff_id)
            return (staff, None)
        except (jwt.ExpiredSignatureError, jwt.DecodeError, Staff.DoesNotExist):
            raise exceptions.AuthenticationFailed('Invalid or expired staff token')

class ClientJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            company_id = payload.get('company_id')
            client = Client.objects.get(company_id=company_id)
            return (client, None)
        except (jwt.ExpiredSignatureError, jwt.DecodeError, Client.DoesNotExist):
            raise exceptions.AuthenticationFailed('Invalid or expired client token') 