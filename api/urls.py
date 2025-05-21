from django.urls import path
from .views import (
    RegisterView, DataUploadView, PredictView,
    HistoryListView, HistoryDetailView, ExportResultsView,
    staff_register, staff_login, client_login, login_info, client_add_staff
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Client related endpoints
    path('client/register/', RegisterView.as_view(), name='client-register'),
    path('client/login/', client_login, name='client-login'),
    path('client/add-staff/', client_add_staff, name='client-add-staff'),
    
    # Staff related endpoints
    path('staff/register/', staff_register, name='staff-register'),
    path('staff/login/', staff_login, name='staff-login'),
    path('staff/upload/', DataUploadView.as_view(), name='staff-upload'),
    path('staff/predict/', PredictView.as_view(), name='staff-predict'),
    path('staff/history/', HistoryListView.as_view(), name='staff-history-list'),
    path('staff/history/<int:id>/', HistoryDetailView.as_view(), name='staff-history-detail'),
    path('staff/export/<int:upload_id>/', ExportResultsView.as_view(), name='staff-export'),
    
    # Common endpoints
    path('login-info/', login_info, name='login-info'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
] 