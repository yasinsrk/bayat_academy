# packages/views.py - COMPLETE FIXED VERSION
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Package, UserPackage, Category
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from rest_framework.decorators import api_view, permission_classes
from .serializers import (
    PackageSerializer, PackageDetailSerializer,
    UserPackageSerializer, PackageAccessSerializer,
    CategorySerializer
)


# ===== CategoryViewSet =====
class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet برای مدیریت دسته‌بندی‌ها"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# ===== PackageViewSet =====
class PackageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for packages (Full CRUD for admin)
    """
    queryset = Package.objects.all()
    serializer_class = PackageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PackageDetailSerializer
        return PackageSerializer

    def get_queryset(self):
        queryset = Package.objects.all()
        if self.request.user and self.request.user.is_superuser:
            return queryset
        return queryset.filter(is_published=True)

    # ===== FIXED: No copying of request.data =====
    def create(self, request, *args, **kwargs):
        """Create package with file upload support"""
        # Don't copy request.data - use it directly
        # The files are in request.FILES and will be handled automatically
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    # ===== FIXED: No copying of request.data =====
    def update(self, request, *args, **kwargs):
        """Update package with file upload support"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Don't copy request.data - use it directly
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='check-access')
    def check_access(self, request, pk=None):
        package = self.get_object()
        has_access = False
        message = None

        if package.is_free:
            if request.user.is_authenticated:
                user_package = UserPackage.objects.filter(
                    user=request.user,
                    package=package,
                    is_active=True
                ).first()
                if user_package:
                    has_access = True
                    message = "شما این دوره را به کتابخانه خود اضافه کرده‌اید"
                else:
                    has_access = False
                    message = "برای مشاهده، دوره را به دوره‌های خود اضافه کنید"
            else:
                has_access = False
                message = "لطفاً ابتدا وارد شوید"

        elif request.user.is_authenticated:
            user_package = UserPackage.objects.filter(
                user=request.user,
                package=package,
                is_active=True
            ).first()
            if user_package:
                has_access = user_package.is_valid()
                if has_access:
                    message = "شما به این دوره دسترسی دارید"
                else:
                    message = "دسترسی شما منقضی شده است"
            else:
                message = "شما این دوره را خریداری نکرده‌اید"
        else:
            message = "لطفاً ابتدا وارد شوید"

        return Response({
            'has_access': has_access,
            'package_id': package.id,
            'package_title': package.title,
            'is_free': package.is_free,
            'message': message
        })

    @action(detail=True, methods=['post'], url_path='spotplayer-license')
    def spotplayer_license(self, request, pk=None):
        """دریافت / ساخت کد لایسنس اسپات پلیر"""
        import logging
        logger = logging.getLogger(__name__)

        logger.info(f"🔵 SpotPlayer License Request for package {pk}")

        package = self.get_object()
        logger.info(f"📦 Package: {package.title}")
        logger.info(f"🎬 Course ID: {package.spot_player_course_id}")

        if not request.user.is_authenticated:
            return Response({'error': 'لطفاً ابتدا وارد شوید'}, status=401)

        user_package = UserPackage.objects.filter(
            user=request.user, package=package, is_active=True
        ).first()

        if not user_package:
            return Response({'error': 'شما به این دوره دسترسی ندارید'}, status=403)

        # اگه قبلاً لایسنس ساخته شده، همون رو برگردون
        if user_package.spot_player_license:
            return Response({
                'license': user_package.spot_player_license,
                'package_title': package.title,
                'created_at': user_package.license_created_at,
                'spot_player_url': 'https://spotplayer.ir',
            })

        # اگه دوره توی اسپات پلیر آپلود نشده
        if not package.spot_player_course_id:
            return Response(
                {'error': 'این دوره هنوز در اسپات پلیر آماده نشده است'},
                status=400
            )

        try:
            from .services.spotplayer import SpotPlayerService

            data = SpotPlayerService.create_license(
                course_id=package.spot_player_course_id,
                user=request.user,
                package_id=package.id
            )

            license_key = data.get('key') or data.get('license') or data.get('_id')

            if not license_key:
                return Response({'error': 'پاسخ نامعتبر از اسپات پلیر'}, status=500)

            user_package.spot_player_license = license_key
            user_package.license_created_at = timezone.now()
            user_package.license_payload = data
            user_package.save()

            return Response({
                'license': license_key,
                'package_title': package.title,
                'created_at': user_package.license_created_at,
                'spot_player_url': 'https://spotplayer.ir',
            })

        except Exception as e:
            logger.error(f"💥 Exception: {e}", exc_info=True)
            return Response({'error': str(e)}, status=500)

# ===== FreePackagesView ====
class FreePackagesView(generics.ListAPIView):
    serializer_class = PackageSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Package.objects.filter(is_published=True, is_free=True)


# ===== MyPackagesView =====
class MyPackagesView(generics.ListAPIView):
    serializer_class = UserPackageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserPackage.objects.filter(
            user=self.request.user,
            is_active=True
        ).select_related('package', 'user').order_by('-purchased_at')


# ===== AddFreePackageView =====
class AddFreePackageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, package_id):
        package = get_object_or_404(Package, id=package_id, is_published=True)

        if not package.is_free:
            return Response(
                {'error': 'این دوره رایگان نیست'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_package, created = UserPackage.objects.get_or_create(
            user=request.user,
            package=package,
            defaults={
                'price_paid': 0,
                'is_active': True
            }
        )

        if created:
            return Response({
                'message': 'دوره با موفقیت به دوره‌های شما اضافه شد',
                'package': {
                    'id': package.id,
                    'title': package.title
                }
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message': 'این دوره قبلاً به دوره‌های شما اضافه شده است',
                'package': {
                    'id': package.id,
                    'title': package.title
                }
            }, status=status.HTTP_200_OK)


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if not user.is_superuser:
            return Response(
                {'error': 'شما دسترسی لازم را ندارید'},
                status=status.HTTP_403_FORBIDDEN
            )

        # ── read range from query ──
        # accepted: 1d, 7d, 30d, 90d, 1y, all
        range_key = request.query_params.get('range', '30d')

        now = timezone.now()
        if range_key == '1d':
            start = now - timedelta(days=1)
            buckets = 24  # hourly
        elif range_key == '7d':
            start = now - timedelta(days=7)
            buckets = 7
        elif range_key == '30d':
            start = now - timedelta(days=30)
            buckets = 30
        elif range_key == '90d':
            start = now - timedelta(days=90)
            buckets = 12  # weekly
        elif range_key == '1y':
            start = now - timedelta(days=365)
            buckets = 12  # monthly
        else:
            start = None
            buckets = 12

        # ── base querysets ──
        from payments.models import Payment
        payments_qs = Payment.objects.all()
        if start:
            payments_qs = payments_qs.filter(created_at__gte=start)

        total_packages = Package.objects.filter(is_published=True).count()
        total_categories = Category.objects.count()
        total_users = User.objects.count()

        paid_qs = payments_qs.filter(status=Payment.Status.PAID)
        pending_qs = payments_qs.filter(status=Payment.Status.PENDING)
        failed_qs = payments_qs.filter(status=Payment.Status.FAILED)

        total_revenue = paid_qs.aggregate(total=Sum('amount'))['total'] or 0
        successful_payments = paid_qs.count()
        pending_payments = pending_qs.count()
        failed_payments = failed_qs.count()

        # ── monthly series (or bucketed per range) ──
        monthly_revenue = []
        if range_key == '1d':
            # hourly buckets (last 24 hours)
            for i in range(23, -1, -1):
                b_start = now - timedelta(hours=i + 1)
                b_end = now - timedelta(hours=i)
                rev = Payment.objects.filter(
                    status=Payment.Status.PAID,
                    paid_at__gte=b_start,
                    paid_at__lt=b_end
                ).aggregate(total=Sum('amount'))['total'] or 0
                monthly_revenue.append({
                    'month': b_end.strftime('%H:%M'),
                    'revenue': rev,
                })
        elif range_key == '7d':
            for i in range(6, -1, -1):
                b_start = now - timedelta(days=i + 1)
                b_end = now - timedelta(days=i)
                rev = Payment.objects.filter(
                    status=Payment.Status.PAID,
                    paid_at__gte=b_start,
                    paid_at__lt=b_end
                ).aggregate(total=Sum('amount'))['total'] or 0
                monthly_revenue.append({
                    'month': b_end.strftime('%m/%d'),
                    'revenue': rev,
                })
        elif range_key == '90d':
            # 12 weekly buckets
            for i in range(11, -1, -1):
                b_start = now - timedelta(days=(i + 1) * 7)
                b_end = now - timedelta(days=i * 7)
                rev = Payment.objects.filter(
                    status=Payment.Status.PAID,
                    paid_at__gte=b_start,
                    paid_at__lt=b_end
                ).aggregate(total=Sum('amount'))['total'] or 0
                monthly_revenue.append({
                    'month': f'هفته {12 - i}',
                    'revenue': rev,
                })
        else:
            # default: 6 monthly buckets
            months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
                      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
            for i in range(5, -1, -1):
                b_start = now - timedelta(days=30 * (i + 1))
                b_end = now - timedelta(days=30 * i)
                rev = Payment.objects.filter(
                    status=Payment.Status.PAID,
                    paid_at__gte=b_start,
                    paid_at__lt=b_end
                ).aggregate(total=Sum('amount'))['total'] or 0
                monthly_revenue.append({
                    'month': months[5 - i],
                    'revenue': rev,
                })

        # ── growth: compare this period vs previous ──
        if start:
            period_len = now - start
            prev_start = start - period_len
            current_rev = paid_qs.aggregate(total=Sum('amount'))['total'] or 0
            prev_rev = Payment.objects.filter(
                status=Payment.Status.PAID,
                paid_at__gte=prev_start,
                paid_at__lt=start
            ).aggregate(total=Sum('amount'))['total'] or 0
            growth = ((current_rev - prev_rev) / prev_rev * 100) if prev_rev > 0 else 0
        else:
            growth = 0

        # ── top packages ──
        top_packages = Package.objects.annotate(
            student_count=Count('purchased_by', filter=Q(purchased_by__is_active=True))
        ).order_by('-student_count')[:5]

        top_packages_data = []
        for pkg in top_packages:
            revenue = Payment.objects.filter(
                package=pkg,
                status=Payment.Status.PAID
            ).aggregate(total=Sum('amount'))['total'] or 0
            top_packages_data.append({
                'id': pkg.id,
                'name': pkg.title,
                'students': pkg.student_count,
                'revenue': revenue,
            })

        # ── recent orders ──
        recent_orders = Payment.objects.filter(
            status=Payment.Status.PAID
        ).select_related('user', 'package').order_by('-paid_at')[:10]

        recent_orders_data = []
        for order in recent_orders:
            recent_orders_data.append({
                'id': order.id,
                'user': order.user.get_full_name() or order.user.username,
                'package': order.package.title,
                'amount': order.amount,
                'date': order.paid_at.isoformat() if order.paid_at else None,  # ← ISO
                'status': order.status,
            })

        return Response({
            'range': range_key,
            'stats': {
                'total_packages': total_packages,
                'total_categories': total_categories,
                'total_users': total_users,
                'total_revenue': total_revenue,
                'successful_payments': successful_payments,
                'pending_payments': pending_payments,
                'failed_payments': failed_payments,
                'growth': round(growth, 1),
            },
            'monthly_revenue': monthly_revenue,
            'top_packages': top_packages_data,
            'recent_orders': recent_orders_data,
        })


class AdminPackageSearchView(APIView):
    """Fast search for the command palette."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        q = (request.query_params.get('q') or '').strip()
        if len(q) < 2:
            return Response({'results': []})

        from django.db.models import Q
        packages = Package.objects.filter(
            Q(title__icontains=q) | Q(description__icontains=q)
        ).order_by('-created_at')[:6]

        return Response({
            'results': [
                {
                    'id': p.id,
                    'title': p.title,
                    'subtitle': 'منتشر شده' if p.is_published else 'پیش‌نویس',
                    'href': f'/admin/packages/{p.id}/edit',
                }
                for p in packages
            ]
        })

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def bulk_delete_categories(request):
    """
    Body: { ids: [1,2,3] }
    Categories in use (with packages) will be skipped.
    """
    ids = request.data.get('ids') or []
    if not ids:
        return Response({'error': 'هیچ دسته‌ای انتخاب نشده'}, status=400)

    # فقط اون‌هایی که هیچ دوره‌ای ندارن حذف میشن
    safe_ids = []
    skipped = []
    for cat in Category.objects.filter(id__in=ids):
        if cat.packages.exists():
            skipped.append(cat.id)
        else:
            safe_ids.append(cat.id)

    deleted_count = 0
    if safe_ids:
        deleted_count, _ = Category.objects.filter(id__in=safe_ids).delete()

    return Response({
        'deleted': deleted_count,
        'skipped': skipped,
        'skipped_count': len(skipped),
    })


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def bulk_create_categories(request):
    """
    Body: { names: ['هوش مصنوعی', 'طراحی', ...] }
    """
    names = request.data.get('names') or []
    if not names:
        return Response({'error': 'هیچ نامی ارسال نشده'}, status=400)

    created = []
    skipped = []
    for raw in names:
        name = str(raw).strip()
        if not name:
            continue
        if Category.objects.filter(name=name).exists():
            skipped.append(name)
            continue
        cat = Category.objects.create(name=name)
        created.append({'id': cat.id, 'name': cat.name})

    return Response({
        'created': created,
        'skipped': skipped,
        'created_count': len(created),
    })



@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def bulk_publish_packages(request):
    """Body: { ids: [1,2,3] }"""
    ids = request.data.get('ids') or []
    if not ids:
        return Response({'error': 'هیچ دوره‌ای انتخاب نشده'}, status=400)

    from django.utils import timezone
    count = Package.objects.filter(id__in=ids, is_published=False).update(
        is_published=True,
        published_at=timezone.now()
    )
    return Response({'updated': count})


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def bulk_unpublish_packages(request):
    """Body: { ids: [1,2,3] }"""
    ids = request.data.get('ids') or []
    if not ids:
        return Response({'error': 'هیچ دوره‌ای انتخاب نشده'}, status=400)

    count = Package.objects.filter(id__in=ids, is_published=True).update(
        is_published=False,
        published_at=None
    )
    return Response({'updated': count})


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def bulk_mark_top(request):
    """Body: { ids: [1,2,3], value: true|false }"""
    ids = request.data.get('ids') or []
    value = bool(request.data.get('value', True))
    if not ids:
        return Response({'error': 'هیچ دوره‌ای انتخاب نشده'}, status=400)

    count = Package.objects.filter(id__in=ids).update(is_top=value)
    return Response({'updated': count})


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def bulk_delete_packages(request):
    """Body: { ids: [1,2,3] }"""
    ids = request.data.get('ids') or []
    if not ids:
        return Response({'error': 'هیچ دوره‌ای انتخاب نشده'}, status=400)

    deleted, _ = Package.objects.filter(id__in=ids).delete()
    return Response({'deleted': deleted})