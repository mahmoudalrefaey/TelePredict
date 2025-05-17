from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class UploadedDataset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    upload_date = models.DateTimeField(auto_now_add=True)
    filename = models.CharField(max_length=255)
    data = models.JSONField()

    def __str__(self):
        return f"{self.filename} ({self.upload_date})"
