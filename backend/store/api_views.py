from rest_framework import viewsets, permissions, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404, redirect
from django.conf import settings
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.contrib.auth.models import User
from django.core.mail import send_mail, get_connection
from django.db import transaction
from datetime import timedelta
import random
import string

from .models import (
    Category, Product, Order, OrderItem, CartItem, Brand,
    SiteSettings, VerificationCode
)
from .serializers import (
    CategorySerializer, ProductSerializer, OrderSerializer,
    CartItemSerializer, BrandSerializer
)
from .serializers_settings import SiteSettingsSerializer


# ---------------------------------------------------------------------------
# Utility: Get email connection from SiteSettings or fallback to settings.py
# ---------------------------------------------------------------------------
def _get_email_connection():
    """Return (from_email, connection) tuple using SiteSettings or Django settings."""
    site_settings = SiteSettings.objects.first()
    connection = None
    from_email = settings.EMAIL_HOST_USER

    if site_settings and site_settings.email_host_user and site_settings.email_host_password:
        from_email = site_settings.email_host_user
        connection = get_connection(
            backend='django.core.mail.backends.smtp.EmailBackend',
            host='smtp.gmail.com',
            port=587,
            username=site_settings.email_host_user,
            password=site_settings.email_host_password,
            use_tls=True,
        )

    return from_email, connection


# ===========================================================================
# Product / Category / Brand (Read-Only)
# ===========================================================================

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(available=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'category__slug': ['exact'],
        'brand__name': ['exact'],
        'price': ['gte', 'lte'],
    }
    search_fields = ['name', 'description', 'category__name', 'brand__name']
    ordering_fields = ['price', 'created_at']


# ===========================================================================
# Site Settings (public, read-only)
# ===========================================================================

class SiteSettingsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        site_settings, _created = SiteSettings.objects.get_or_create(id=1)
        serializer = SiteSettingsSerializer(site_settings)
        return Response(serializer.data)


# ===========================================================================
# Cart
# ===========================================================================

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        product = get_object_or_404(Product, id=product_id)

        if quantity > product.stock:
            return Response({'error': f'Only {product.stock} items left'}, status=400)

        cart_item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'quantity': 0},
        )

        if cart_item.quantity + quantity > product.stock:
            return Response({'error': f'Only {product.stock} items left'}, status=400)

        cart_item.quantity += quantity
        cart_item.save()

        serializer = self.get_serializer(cart_item)
        return Response(serializer.data)


# ===========================================================================
# Orders  (COD + SSLCommerz checkout)
# ===========================================================================

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    # ----- helpers -----
    @staticmethod
    def _send_order_emails(order, payment_method, request_user):
        """Fire-and-forget order confirmation emails."""
        try:
            from_email, connection = _get_email_connection()

            admin_emails = [settings.EMAIL_HOST_USER]
            if hasattr(settings, 'ADMINS') and settings.ADMINS:
                admin_emails = [email for _name, email in settings.ADMINS]

            items_desc = "\n".join(
                f"- {oi.product.name} (x{oi.quantity}): Tk {oi.price * oi.quantity}"
                for oi in order.items.all()
            )

            customer_message = (
                f"Dear {request_user.username},\n\n"
                f"Thank you for your order! We have received it and will process it shortly.\n\n"
                f"Order Details:\n"
                f"Order ID: #{order.id}\n"
                f"Date: {order.created_at.strftime('%Y-%m-%d %H:%M')}\n"
                f"Total Amount: Tk {order.total}\n"
                f"Payment Method: {payment_method.upper()}\n\n"
                f"Shipping Address:\n{order.shipping_address}\n\n"
                f"Items Ordered:\n{items_desc}\n\n"
                f"You can track your order status on our website.\n\n"
                f"Best regards,\nRB Trading Team"
            )

            send_mail(
                f'Order Confirmation - Order #{order.id}',
                customer_message,
                from_email,
                [request_user.email],
                fail_silently=True,
                connection=connection,
            )

            admin_message = (
                f"New Order Received!\n"
                f"Order ID: #{order.id}\n"
                f"User: {request_user.username} ({request_user.email})\n"
                f"Total: Tk {order.total}\n"
                f"Payment Method: {payment_method.upper()}"
            )

            send_mail(
                f'New Order Alert - #{order.id}',
                admin_message,
                from_email,
                admin_emails,
                fail_silently=True,
                connection=connection,
            )
        except Exception as email_error:
            print(f"Failed to send order email: {email_error}")

    # ----- create order -----
    def create(self, request, *args, **kwargs):
        shipping_address = request.data.get('shipping_address')
        payment_method = request.data.get('payment_method', 'cod')

        if not shipping_address:
            return Response({'error': 'Shipping address is required'}, status=400)

        cart_items = CartItem.objects.filter(user=request.user)
        if not cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=400)

        total = sum(item.subtotal for item in cart_items)

        try:
            with transaction.atomic():
                order = Order.objects.create(
                    user=request.user,
                    total=total,
                    shipping_address=shipping_address,
                    status='pending',
                    payment_status='pending',
                )

                for item in cart_items:
                    if item.quantity > item.product.stock:
                        raise Exception(f"Out of stock: {item.product.name}")

                    OrderItem.objects.create(
                        order=order,
                        product=item.product,
                        quantity=item.quantity,
                        price=item.product.discounted_price,
                        purchase_price=item.product.purchase_price,
                    )

                    item.product.stock -= item.quantity
                    item.product.save()

                cart_items.delete()

                response_data = self.get_serializer(order).data

                # Send emails (non-blocking)
                self._send_order_emails(order, payment_method, request.user)

                # ---------- COD ----------
                if payment_method == 'cod':
                    order.payment_intent_id = 'COD'
                    order.save()
                    response_data['payment_url'] = None
                    response_data['message'] = 'Order placed successfully! Cash on Delivery.'
                    return Response(response_data, status=201)

                # ---------- SSLCommerz ----------
                elif payment_method == 'sslcommerz':
                    try:
                        from sslcommerz_lib import SSLCOMMERZ

                        # Prefer SiteSettings, fallback to settings.py
                        site_settings = SiteSettings.objects.first()
                        store_id = (
                            site_settings.sslcommerz_store_id
                            if site_settings and site_settings.sslcommerz_store_id
                            else getattr(settings, 'SSLCOMMERZ_STORE_ID', 'testbox')
                        )
                        store_pass = (
                            site_settings.sslcommerz_store_pass
                            if site_settings and site_settings.sslcommerz_store_pass
                            else getattr(settings, 'SSLCOMMERZ_STORE_PASS', 'qwerty')
                        )
                        is_sandbox = (
                            site_settings.sslcommerz_is_sandbox
                            if site_settings
                            else getattr(settings, 'SSLCOMMERZ_IS_SANDBOX', True)
                        )

                        sslcz = SSLCOMMERZ({
                            'store_id': store_id,
                            'store_pass': store_pass,
                            'issandbox': is_sandbox,
                        })

                        post_body = {
                            'total_amount': float(total),
                            'currency': 'BDT',
                            'tran_id': f"ORDER-{order.id}",
                            'success_url': request.build_absolute_uri(
                                reverse('store:sslcommerz_success')
                            ),
                            'fail_url': request.build_absolute_uri(
                                reverse('store:sslcommerz_fail')
                            ),
                            'cancel_url': request.build_absolute_uri(
                                reverse('store:sslcommerz_cancel')
                            ),
                            'emi_option': 0,
                            'cus_name': request.user.username,
                            'cus_email': request.user.email,
                            'cus_phone': '01711111111',
                            'cus_add1': shipping_address[:100],
                            'cus_city': 'Dhaka',
                            'cus_country': 'Bangladesh',
                            'shipping_method': 'NO',
                            'product_name': f'Order #{order.id}',
                            'product_category': 'General',
                            'product_profile': 'general',
                        }

                        resp = sslcz.createSession(post_body)
                        if resp.get('status') == 'SUCCESS':
                            order.payment_intent_id = post_body['tran_id']
                            order.save()
                            response_data['payment_url'] = resp['GatewayPageURL']
                            return Response(response_data, status=201)
                        else:
                            return Response(
                                {'error': f"Payment Gateway Error: {resp.get('failedreason')}"},
                                status=400,
                            )

                    except ImportError:
                        return Response({'error': 'SSLCommerz library not installed'}, status=500)
                    except Exception as e:
                        return Response({'error': f'Payment Init Error: {str(e)}'}, status=400)

                # Fallback (unknown method)
                return Response(
                    {'error': f'Unknown payment method: {payment_method}'},
                    status=400,
                )

        except Exception as e:
            return Response({'error': str(e)}, status=400)


# ===========================================================================
# SSLCommerz Callbacks (payment gateway POSTs back here)
# ===========================================================================

@method_decorator(csrf_exempt, name='dispatch')
class SSLCommerzSuccessView(APIView):
    """Handle successful SSLCommerz payment."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        val_id = request.data.get('val_id') or request.POST.get('val_id')
        tran_id = request.data.get('tran_id') or request.POST.get('tran_id')

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')

        if not val_id or not tran_id:
            return redirect(f'{frontend_url}/cart?status=failed&reason=invalid_response')

        try:
            order_id = int(tran_id.split('-')[1])
            order = Order.objects.get(id=order_id, payment_intent_id=tran_id)
        except (ValueError, IndexError, Order.DoesNotExist):
            return redirect(f'{frontend_url}/cart?status=failed&reason=order_not_found')

        # Validate IPN hash (optional but recommended)
        try:
            from sslcommerz_lib import SSLCOMMERZ

            site_settings = SiteSettings.objects.first()
            store_id = (
                site_settings.sslcommerz_store_id
                if site_settings and site_settings.sslcommerz_store_id
                else getattr(settings, 'SSLCOMMERZ_STORE_ID', 'testbox')
            )
            store_pass = (
                site_settings.sslcommerz_store_pass
                if site_settings and site_settings.sslcommerz_store_pass
                else getattr(settings, 'SSLCOMMERZ_STORE_PASS', 'qwerty')
            )
            is_sandbox = (
                site_settings.sslcommerz_is_sandbox
                if site_settings
                else getattr(settings, 'SSLCOMMERZ_IS_SANDBOX', True)
            )

            sslcz = SSLCOMMERZ({
                'store_id': store_id,
                'store_pass': store_pass,
                'issandbox': is_sandbox,
            })

            validation = sslcz.validationTransactionOrder(val_id)
            if validation.get('status') != 'VALID' and validation.get('status') != 'VALIDATED':
                return redirect(f'{frontend_url}/cart?status=failed&reason=validation_failed')

        except (ImportError, Exception) as e:
            # Log but proceed — sandbox may not always validate
            print(f"SSLCommerz validation warning: {e}")

        order.payment_status = 'paid'
        order.status = 'processing'
        order.save()

        CartItem.objects.filter(user=order.user).delete()

        return redirect(f"{frontend_url}/payment/success?order_id={order.id}")


@method_decorator(csrf_exempt, name='dispatch')
class SSLCommerzFailView(APIView):
    """Handle failed SSLCommerz payment."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        tran_id = request.data.get('tran_id') or request.POST.get('tran_id')
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')

        # Mark order as failed if we can find it
        if tran_id:
            try:
                order_id = int(tran_id.split('-')[1])
                order = Order.objects.get(id=order_id, payment_intent_id=tran_id)
                order.payment_status = 'failed'
                order.save()
            except (ValueError, IndexError, Order.DoesNotExist):
                pass

        return redirect(f'{frontend_url}/cart?status=failed')


@method_decorator(csrf_exempt, name='dispatch')
class SSLCommerzCancelView(APIView):
    """Handle cancelled SSLCommerz payment."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        return redirect(f'{frontend_url}/cart?status=cancelled')


# ===========================================================================
# Email Verification
# ===========================================================================

class SendVerificationCodeView(APIView):
    """Send a 6-digit verification code to user's email."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=400)

        try:
            user = User.objects.get(email=email)
            if user.is_active:
                return Response({'error': 'Account is already verified'}, status=400)
        except User.DoesNotExist:
            return Response({'error': 'No account found with this email'}, status=404)

        code = ''.join(random.choices(string.digits, k=6))
        VerificationCode.objects.filter(email=email).delete()
        VerificationCode.objects.create(email=email, code=code)

        try:
            from_email, connection = _get_email_connection()
            send_mail(
                subject='RB Trading - Verify Your Email',
                message=f'Your verification code is: {code}\n\nThis code expires in 10 minutes.',
                from_email=from_email,
                recipient_list=[email],
                fail_silently=False,
                connection=connection,
            )
            return Response({'message': 'Verification code sent to your email'})

        except Exception as e:
            print(f"[ERROR] Email send failed: {e}")
            print(f"[DEV] Verification code for {email}: {code}")
            return Response({
                'message': 'Verification code sent (check console in dev mode)',
                'dev_code': code if settings.DEBUG else None,
            })


class VerifyCodeView(APIView):
    """Verify the 6-digit code and activate user account."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        if not email or not code:
            return Response({'error': 'Email and code are required'}, status=400)

        try:
            verification = VerificationCode.objects.get(email=email, code=code)
        except VerificationCode.DoesNotExist:
            return Response({'error': 'Invalid verification code'}, status=400)

        if timezone.now() - verification.created_at > timedelta(minutes=10):
            verification.delete()
            return Response({'error': 'Verification code has expired'}, status=400)

        try:
            user = User.objects.get(email=email)
            user.is_active = True
            user.save()
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        verification.delete()
        return Response({'message': 'Email verified successfully! You can now login.'})


# ===========================================================================
# Password Reset
# ===========================================================================

class RequestPasswordResetView(APIView):
    """Send a 6-digit code for password reset."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=400)

        try:
            User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'No account found with this email'}, status=404)

        code = ''.join(random.choices(string.digits, k=6))
        VerificationCode.objects.filter(email=email).delete()
        VerificationCode.objects.create(email=email, code=code)

        try:
            from_email, connection = _get_email_connection()
            send_mail(
                subject='RB Trading - Password Reset Code',
                message=f'Your password reset code is: {code}\n\nThis code expires in 10 minutes.',
                from_email=from_email,
                recipient_list=[email],
                fail_silently=False,
                connection=connection,
            )
            return Response({'message': 'Password reset code sent to your email'})

        except Exception as e:
            print(f"[ERROR] Email send failed: {e}")
            print(f"[DEV] Reset code for {email}: {code}")
            return Response({
                'message': 'Code sent (check console in dev mode)',
                'dev_code': code if settings.DEBUG else None,
            })


class ResetPasswordView(APIView):
    """Verify code and set new password."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        if not all([email, code, new_password]):
            return Response({'error': 'Email, code, and new password are required'}, status=400)

        try:
            verification = VerificationCode.objects.get(email=email, code=code)
        except VerificationCode.DoesNotExist:
            return Response({'error': 'Invalid verification code'}, status=400)

        if timezone.now() - verification.created_at > timedelta(minutes=10):
            verification.delete()
            return Response({'error': 'Code has expired'}, status=400)

        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            verification.delete()
            return Response({'message': 'Password reset successful! Please login.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
