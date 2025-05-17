from django.contrib import admin
from .models import UploadedDataset

# Register your models here.

@admin.register(UploadedDataset)
class UploadedDatasetAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'filename', 'upload_date')
    search_fields = ('filename', 'user__username')
