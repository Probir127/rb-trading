from rest_framework import serializers
from .models import SiteSettings

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'site_name', 
            'contact_email', 
            'contact_phone', 
            'address',
            'facebook_link',
            'twitter_link',
            'instagram_link'
        ]
