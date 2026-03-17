from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views
from accounts.views import EmailTokenObtainPairView

router = DefaultRouter()
router.register(r'categories', api_views.CategoryViewSet)
router.register(r'brands', api_views.BrandViewSet)
router.register(r'products', api_views.ProductViewSet)
router.register(r'orders', api_views.OrderViewSet, basename='order')
router.register(r'cart', api_views.CartViewSet, basename='cart')

app_name = 'store'

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/index/', api_views.CategoryViewSet.as_view({'get': 'list'}), name='index'),
    # Custom JWT endpoint that accepts email instead of username
    path('api/auth/jwt/create/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/', include('djoser.urls')),
    path('api/auth/jwt/refresh/', include('djoser.urls.jwt')),
    # Email Verification endpoints
    path('api/auth/send-verification/', api_views.SendVerificationCodeView.as_view(), name='send_verification'),
    path('api/auth/verify-email/', api_views.VerifyCodeView.as_view(), name='verify_email'),
    # Password Reset endpoints
    path('api/auth/request-password-reset/', api_views.RequestPasswordResetView.as_view(), name='request_password_reset'),
    path('api/auth/reset-password/', api_views.ResetPasswordView.as_view(), name='reset_password'),
    # SSLCommerz Callbacks
    path('api/payment/sslcommerz-success/', api_views.SSLCommerzSuccessView.as_view(), name='sslcommerz_success'),
    path('api/payment/sslcommerz-fail/', api_views.SSLCommerzFailView.as_view(), name='sslcommerz_fail'),
    path('api/payment/sslcommerz-cancel/', api_views.SSLCommerzCancelView.as_view(), name='sslcommerz_cancel'),
    # Site Settings
    path('api/site-settings/', api_views.SiteSettingsView.as_view(), name='site_settings'),
]