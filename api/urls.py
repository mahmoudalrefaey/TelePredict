from django.urls import path
from .views import RegisterView, MyTokenObtainPairView, DataUploadView, PredictView, history_list, history_detail
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('upload/', DataUploadView.as_view(), name='data-upload'),
    path('predict/', PredictView.as_view(), name='predict'),
    path('history/', history_list, name='history-list'),
    path('history/<int:id>/', history_detail, name='history-detail'),
] 