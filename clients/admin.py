from django.contrib import admin
from .models import Client, Feedback, Subscription, Staff
from django.contrib.auth.hashers import make_password
from django import forms

# Custom form for Client to only display raw password
class ClientAdminForm(forms.ModelForm):
    password = forms.CharField(required=False, widget=forms.PasswordInput, help_text="Leave blank to keep unchanged.")

    class Meta:
        model = Client
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            # If the password is hashed, show empty field
            if self.instance.password and self.instance.password.startswith('pbkdf2_'):
                self.fields['password'].initial = ''
            else:
                self.fields['password'].initial = self.instance.password

    def clean_password(self):
        password = self.cleaned_data.get('password')
        if not password and self.instance and self.instance.pk:
            # Keep the existing password if not changed
            return self.instance.password
        return password

# Custom admin for Client to hash password
class ClientAdmin(admin.ModelAdmin):
    form = ClientAdminForm
    list_display = ('company_id', 'company_name', 'company_email')

    def save_model(self, request, obj, form, change):
        # Hash the password if it's not already hashed
        raw_password = form.cleaned_data.get('password')
        if raw_password and not raw_password.startswith('pbkdf2_'):
            obj.password = make_password(raw_password)
        super().save_model(request, obj, form, change)

# Custom form for Staff to only display raw password
class StaffAdminForm(forms.ModelForm):
    password = forms.CharField(required=False, widget=forms.PasswordInput, help_text="Leave blank to keep unchanged.")

    class Meta:
        model = Staff
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            # If the password is hashed, show empty field
            if self.instance.password and self.instance.password.startswith('pbkdf2_'):
                self.fields['password'].initial = ''
            else:
                self.fields['password'].initial = self.instance.password

    def clean_password(self):
        password = self.cleaned_data.get('password')
        if not password and self.instance and self.instance.pk:
            # Keep the existing password if not changed
            return self.instance.password
        return password

class StaffAdmin(admin.ModelAdmin):
    form = StaffAdminForm
    list_display = ('staff_id', 'name', 'email', 'client')

    def save_model(self, request, obj, form, change):
        raw_password = form.cleaned_data.get('password')
        if raw_password and not raw_password.startswith('pbkdf2_'):
            obj.password = make_password(raw_password)
        super().save_model(request, obj, form, change)

admin.site.register(Client, ClientAdmin)
admin.site.register(Feedback)
admin.site.register(Subscription)
admin.site.register(Staff, StaffAdmin)