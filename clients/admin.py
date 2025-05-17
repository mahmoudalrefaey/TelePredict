from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Client)
admin.site.register(LoginInfo)
admin.site.register(Feedback)
admin.site.register(Subscription)