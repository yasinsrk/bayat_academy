# payments/views.py
import requests
import uuid
import json
import logging
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from packages.models import Package, UserPackage
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from django.db.models import Sum
from datetime import timedelta
from rest_framework import viewsets, permissions
from .models import Payment
from .serializers import PaymentSerializer

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    try:
        user = request.user
        package_ids = request.data.get('package_ids', [])
        callback_url = request.data.get('callback_url')

        if not package_ids:
            return Response({'error': 'هیچ دوره‌ای انتخاب نشده است'}, status=status.HTTP_400_BAD_REQUEST)

        packages = Package.objects.filter(id__in=package_ids)
        if not packages.exists():
            return Response({'error': 'دوره‌ای یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

        total_price = 0
        for pkg in packages:
            if not pkg.is_free:
                price = pkg.discounted_price if pkg.has_discount else pkg.price
                total_price += int(price)

        authority = str(uuid.uuid4()).replace('-', '')[:16]
        payment = Payment.objects.create(
            user=user,
            package=packages.first(),
            amount=total_price,
            authority=authority,
            status=Payment.Status.PENDING
        )

        if total_price == 0:
            payment.status = Payment.Status.PAID
            payment.paid_at = timezone.now()
            payment.save()

            for pkg in packages:
                UserPackage.objects.get_or_create(
                    user=user,
                    package=pkg,
                    defaults={'price_paid': 0, 'is_active': True}
                )

            return Response({
                'status': 'success',
                'message': 'پرداخت با موفقیت انجام شد',
                'payment_url': f"{settings.FRONTEND_URL}/payment/success?authority={authority}"
            })

        try:
            import json

            # ===== مرچنت آیدی ۳۶ کاراکتری =====
            merchant_id = settings.ZARINPAL_MERCHANT_ID

            payload = {
                'merchant_id': merchant_id,
                'amount': int(total_price),
                'currency': 'IRT',
                'description': f'خرید دوره از بیات‌آکادمی',
                'callback_url': callback_url or settings.ZARINPAL_CALLBACK_URL,
                'metadata': {
                    'mobile': user.phone or '',
                    'email': user.email or '',
                }
            }

            print("=" * 60)
            print("🔵 Sending to Zarinpal:")
            print(json.dumps(payload, indent=2, ensure_ascii=False))
            print("=" * 60)

            zarinpal_base = (
                'https://sandbox.zarinpal.com'
                if settings.ZARINPAL_SANDBOX
                else 'https://payment.zarinpal.com'
            )
            response = requests.post(
                f'{zarinpal_base}/pg/v4/payment/request.json',
                json=payload,
                headers={
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout=30
            )

            print("=" * 60)
            print(f"🔵 Response Status: {response.status_code}")
            print(f"🔵 Response Text: {response.text}")
            print("=" * 60)

            if not response.text:
                payment.status = Payment.Status.FAILED
                payment.save()
                return Response({
                    'error': 'پاسخ خالی از زرین‌پال'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            result = response.json()

            # ===== بررسی موفقیت =====
            if result.get('data', {}).get('code') == 100:
                authority = result['data']['authority']
                payment.authority = authority
                payment.save()

                payment_url = f"{zarinpal_base}/pg/StartPay/{authority}"

                return Response({
                    'status': 'success',
                    'payment_url': payment_url,
                    'authority': authority
                })
            else:
                payment.status = Payment.Status.FAILED
                payment.save()

                error_msg = result.get('errors', {}).get('message') or result.get('data', {}).get('message',
                                                                                                  'خطای ناشناخته')

                return Response({
                    'error': 'خطا در اتصال به درگاه پرداخت',
                    'code': result.get('data', {}).get('code'),
                    'message': error_msg,
                    'full_response': result
                }, status=status.HTTP_400_BAD_REQUEST)

        except requests.exceptions.RequestException as e:
            payment.status = Payment.Status.FAILED
            payment.save()
            return Response({
                'error': 'خطا در اتصال به درگاه پرداخت',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        return Response({
            'error': 'خطای داخلی سرور',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """
    تایید پرداخت از زرین‌پال (سندباکس)
    """
    try:
        authority = request.data.get('authority')
        status_param = request.data.get('status')

        print("=" * 60)
        print(f"🔵 verify_payment called")
        print(f"🔵 authority: {authority}")
        print(f"🔵 status_param: {status_param}")
        print("=" * 60)

        if not authority:
            return Response({'error': 'کد تراکنش یافت نشد'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(authority=authority)
        except Payment.DoesNotExist:
            return Response({'error': 'تراکنش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

        # ===== فقط اگه Status=OK باشه =====
        if status_param == 'OK':
            try:
                merchant_id = settings.ZARINPAL_MERCHANT_ID

                payload = {
                    'merchant_id': merchant_id,
                    'amount': int(payment.amount),
                    'authority': authority
                }

                print("=" * 60)
                print("🔵 Sending verify to Zarinpal:")
                print(json.dumps(payload, indent=2, ensure_ascii=False))
                print("=" * 60)

                zarinpal_base = (
                    'https://sandbox.zarinpal.com'
                    if settings.ZARINPAL_SANDBOX
                    else 'https://payment.zarinpal.com'
                )
                response = requests.post(
                    f'{zarinpal_base}/pg/v4/payment/verify.json',
                    json=payload,
                    headers={
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout=30
                )

                print("=" * 60)
                print(f"🔵 Verify Response Status: {response.status_code}")
                print(f"🔵 Verify Response Text: {response.text}")
                print("=" * 60)

                if not response.text:
                    return Response({
                        'error': 'پاسخ خالی از زرین‌پال'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                result = response.json()

                # ===== کد 100 = موفق, کد 101 = قبلاً تایید شده =====
                code = result.get('data', {}).get('code')

                if code == 100 or code == 101:
                    # پرداخت موفق
                    payment.status = Payment.Status.PAID
                    payment.ref_id = result['data'].get('ref_id')
                    payment.paid_at = timezone.now()
                    payment.save()

                    # اضافه کردن به دوره‌های کاربر
                    package = payment.package
                    UserPackage.objects.get_or_create(
                        user=payment.user,
                        package=package,
                        defaults={'price_paid': payment.amount, 'is_active': True}
                    )

                    return Response({
                        'status': 'success',
                        'message': 'پرداخت با موفقیت انجام شد',
                        'ref_id': payment.ref_id
                    })
                else:
                    # پرداخت ناموفق
                    payment.status = Payment.Status.FAILED
                    payment.save()

                    error_message = result.get('data', {}).get('message', 'خطای ناشناخته')

                    return Response({
                        'error': 'پرداخت ناموفق بود',
                        'code': code,
                        'message': error_message
                    }, status=status.HTTP_400_BAD_REQUEST)

            except requests.exceptions.RequestException as e:
                print(f"❌ Zarinpal verify error: {e}")
                return Response({
                    'error': 'خطا در تایید پرداخت',
                    'detail': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # لغو شده توسط کاربر
            payment.status = Payment.Status.CANCELLED
            payment.save()
            return Response({
                'status': 'cancelled',
                'message': 'پرداخت توسط کاربر لغو شد'
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(f"❌ Unexpected error in verify_payment: {e}")
        return Response({
            'error': 'خطای داخلی سرور',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentStatsView(APIView):
    """
    دریافت آمار تراکنش‌ها (فقط ادمین)
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        # ===== آمار کلی =====
        total_revenue = Payment.objects.filter(
            status=Payment.Status.PAID
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_transactions = Payment.objects.count()
        successful = Payment.objects.filter(status=Payment.Status.PAID).count()
        failed = Payment.objects.filter(status=Payment.Status.FAILED).count()
        pending = Payment.objects.filter(status=Payment.Status.PENDING).count()
        cancelled = Payment.objects.filter(status=Payment.Status.CANCELLED).count()

        # ===== درآمد ماهانه (۶ ماه اخیر) =====
        persian_months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور']
        monthly_revenue = []

        for i in range(6, 0, -1):
            month_start = timezone.now() - timedelta(days=30 * i)
            month_end = timezone.now() - timedelta(days=30 * (i - 1))

            revenue = Payment.objects.filter(
                status=Payment.Status.PAID,
                paid_at__gte=month_start,
                paid_at__lt=month_end
            ).aggregate(total=Sum('amount'))['total'] or 0

            monthly_revenue.append({
                'month': persian_months[6 - i],
                'revenue': revenue
            })

        # ===== فروش به تفکیک دوره =====
        revenue_by_package = {}
        paid_payments = Payment.objects.filter(
            status=Payment.Status.PAID
        ).select_related('package')

        for p in paid_payments:
            pkg_name = p.package.title if p.package else 'نامشخص'
            revenue_by_package[pkg_name] = revenue_by_package.get(pkg_name, 0) + p.amount

        revenue_by_package_list = [
            {'name': k, 'revenue': v}
            for k, v in revenue_by_package.items()
        ]
        revenue_by_package_list.sort(key=lambda x: x['revenue'], reverse=True)

        return Response({
            'total_revenue': total_revenue,
            'total_transactions': total_transactions,
            'successful': successful,
            'failed': failed,
            'pending': pending,
            'cancelled': cancelled,
            'monthly_revenue': monthly_revenue,
            'revenue_by_package': revenue_by_package_list[:10],
        })


class PaymentViewSet(viewsets.ModelViewSet):
    """
    مدیریت تراکنش‌ها (فقط ادمین)
    """
    queryset = Payment.objects.all().order_by('-created_at')
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Payment.objects.all().order_by('-created_at')
        return Payment.objects.filter(user=user).order_by('-created_at')

    def get_permissions(self):
        if self.action in ['list', 'destroy', 'update', 'partial_update']:
            self.permission_classes = [permissions.IsAdminUser]
        return super().get_permissions()


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def bulk_update_payment_status(request):
    """
    Body: { ids: [1,2,3], status: 'paid' | 'failed' | 'pending' | 'cancelled' }
    """
    ids = request.data.get('ids') or []
    new_status = request.data.get('status')

    valid_statuses = [c[0] for c in Payment.Status.choices]
    if new_status not in valid_statuses:
        return Response(
            {'error': 'وضعیت نامعتبر است'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not ids:
        return Response(
            {'error': 'هیچ ردیفی انتخاب نشده'},
            status=status.HTTP_400_BAD_REQUEST
        )

    updated = Payment.objects.filter(id__in=ids).update(status=new_status)

    # If marking as PAID, set paid_at
    if new_status == Payment.Status.PAID:
        Payment.objects.filter(id__in=ids, paid_at__isnull=True).update(
            paid_at=timezone.now()
        )

    return Response({
        'updated': updated,
        'status': new_status,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def bulk_delete_payments(request):
    """
    Body: { ids: [1,2,3] }
    """
    ids = request.data.get('ids') or []
    if not ids:
        return Response(
            {'error': 'هیچ ردیفی انتخاب نشده'},
            status=status.HTTP_400_BAD_REQUEST
        )

    deleted_count, _ = Payment.objects.filter(id__in=ids).delete()
    return Response({'deleted': deleted_count})