from django.contrib import admin
from .models import UploadedDataset

# Register your models here.

@admin.register(UploadedDataset)
class UploadedDatasetAdmin(admin.ModelAdmin):
    list_display = ('id', 'staff', 'filename', 'upload_date', 'status')
    search_fields = ('filename', 'staff__name', 'staff__staff_id')
