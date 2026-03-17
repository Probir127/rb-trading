from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User


class UserCreateSerializer(BaseUserCreateSerializer):
    """
    Custom user registration serializer.
    Accepts email, username, password, re_password.
    Sets is_active = False so user must verify email before logging in.
    """

    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'username', 'password')

    def perform_create(self, validated_data):
        user = super().perform_create(validated_data)
        user.is_active = False
        user.save()
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer that authenticates by email instead of username.
    Looks up the User by email, then authenticates with the found username.
    """

    def validate(self, attrs):
        # Djoser LOGIN_FIELD='email' means the 'username' field in the JWT
        # request body actually contains the email. We resolve it here.
        email = attrs.get('email') or attrs.get(self.username_field)
        password = attrs.get('password')

        if email and password:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                from rest_framework_simplejwt.exceptions import InvalidToken
                from rest_framework import serializers
                raise serializers.ValidationError(
                    'No active account found with the given credentials'
                )

            # Replace email with username for the default authenticate() call
            attrs[self.username_field] = user.username

        return super().validate(attrs)
