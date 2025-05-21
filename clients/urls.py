from django.urls import path
from .views import ClientHomeView, FeedbackSubmissionView, ClientProfileView

urlpatterns = [
    path('client/home/', ClientHomeView.as_view(), name='client-home'),
    path('client/feedback/', FeedbackSubmissionView.as_view(), name='client-feedback'),
    path('client/profile/', ClientProfileView.as_view(), name='client-profile'),
]
