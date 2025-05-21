from django.db import models
from clients.models import Staff

# Create your models here.

class UploadedDataset(models.Model):
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE)
    upload_date = models.DateTimeField(auto_now_add=True)
    filename = models.CharField(max_length=255)
    data = models.JSONField()
    status = models.CharField(max_length=20, default='pending')

    def __str__(self):
        return f"{self.filename} ({self.upload_date})"
