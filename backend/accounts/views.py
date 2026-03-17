from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import EmailTokenObtainPairSerializer


class EmailTokenObtainPairView(TokenObtainPairView):
    """Custom JWT view that uses email instead of username"""
    serializer_class = EmailTokenObtainPairSerializer
