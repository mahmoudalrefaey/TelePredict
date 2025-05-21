from django.contrib import admin
from .models import Client, Feedback, Subscription, Staff
from django.contrib.auth.hashers import make_password
from django import forms
from django.core.exceptions import ValidationError

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

class SubscriptionInline(admin.StackedInline):
    model = Subscription
    extra = 1
    min_num = 1
    max_num = 1
    can_delete = False
    fields = ('plan_type', 'monthly_charges', 'total_charges', 'start_date', 'end_date', 'active')
    readonly_fields = ('monthly_charges', 'total_charges', 'start_date', 'end_date')
    verbose_name = 'Subscription (required)'
    verbose_name_plural = 'Subscription (required)'

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        formset.validate_min = True
        return formset

class ClientAdmin(admin.ModelAdmin):
    form = ClientAdminForm
    list_display = ('company_id', 'company_name', 'company_email', 'staff_count')
    inlines = [SubscriptionInline]

    def staff_count(self, obj):
        return Staff.objects.filter(client=obj).count()
    staff_count.short_description = 'Staff Count'

    def save_model(self, request, obj, form, change):
        # Hash the password if it's not already hashed
        raw_password = form.cleaned_data.get('password')
        if raw_password and not raw_password.startswith('pbkdf2_'):
            obj.password = make_password(raw_password)
        super().save_model(request, obj, form, change)

# Custom form for Staff to only display raw password and enforce staff limit
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

    def clean(self):
        cleaned_data = super().clean()
        client = cleaned_data.get('client')
        if client:
            from .models import Subscription
            subscription = Subscription.objects.filter(company=client, active=True).first()
            if subscription:
                max_staff = subscription.max_staff_allowed()
                staff_count = Staff.objects.filter(client=client).count()
                # If adding a new staff (not editing existing)
                if not self.instance.pk and max_staff is not None and staff_count >= max_staff:
                    raise ValidationError(f"Staff limit reached for this subscription plan ({subscription.plan_type}).")
        return cleaned_data

class StaffAdmin(admin.ModelAdmin):
    form = StaffAdminForm
    list_display = ('staff_id', 'name', 'email', 'client')

    def save_model(self, request, obj, form, change):
        raw_password = form.cleaned_data.get('password')
        if raw_password and not raw_password.startswith('pbkdf2_'):
            obj.password = make_password(raw_password)
        super().save_model(request, obj, form, change)

class SubscriptionAdminForm(forms.ModelForm):
    class Meta:
        model = Subscription
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Only allow editing plan_type and active, others are readonly
        for field in ['monthly_charges', 'total_charges', 'start_date', 'end_date']:
            if field in self.fields:
                self.fields[field].disabled = True

    def clean_plan_type(self):
        plan_type = self.cleaned_data.get('plan_type')
        if not plan_type:
            raise ValidationError('Plan type is required.')
        return plan_type

class SubscriptionAdmin(admin.ModelAdmin):
    form = SubscriptionAdminForm
    list_display = ('subscription_id', 'company', 'plan_type', 'active', 'plan_duration', 'monthly_rate', 'total_charges')
    list_filter = ('plan_type', 'active')
    readonly_fields = ('plan_duration', 'monthly_rate', 'total_charges')
    actions = ['activate_subscriptions', 'deactivate_subscriptions']

    def plan_duration(self, obj):
        return f"{obj.get_plan_duration()} months"
    plan_duration.short_description = 'Plan Duration'

    def monthly_rate(self, obj):
        return f"${obj.get_monthly_rate()}"
    monthly_rate.short_description = 'Monthly Rate'

    def total_charges(self, obj):
        return f"${obj.total_charges}"
    total_charges.short_description = 'Total Charge'

    @admin.action(description="Activate selected subscriptions")
    def activate_subscriptions(self, request, queryset):
        for subscription in queryset:
            subscription.active = True
            subscription.save()
        self.message_user(request, "Selected subscriptions have been activated.")

    @admin.action(description="Deactivate selected subscriptions")
    def deactivate_subscriptions(self, request, queryset):
        for subscription in queryset:
            subscription.active = False
            subscription.save()
        self.message_user(request, "Selected subscriptions have been deactivated.")

admin.site.register(Client, ClientAdmin)
admin.site.register(Feedback)
admin.site.register(Subscription, SubscriptionAdmin)
admin.site.register(Staff, StaffAdmin)