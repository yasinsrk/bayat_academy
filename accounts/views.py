from rest_framework import generics, status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer, UserProfileSerializer, SavedViewSerializer
from .models import User, SavedView
from rest_framework.decorators import api_view, permission_classes

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    Login user with username OR phone number + password
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        phone = request.data.get('phone')
        password = request.data.get('password')

        print(f"===== Login Attempt =====")
        print(f"Username: {username}")
        print(f"Phone: {phone}")
        print(f"Password: {password}")

        if not password:
            return Response(
                {'error': 'رمز عبور الزامی است'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = None

        # ===== اول با یوزرنیم امتحان کن =====
        if username:
            try:
                user_obj = User.objects.get(username=username)
                user = authenticate(username=username, password=password)
                if user:
                    print(f"✅ Login successful with username: {username}")
            except User.DoesNotExist:
                print(f"❌ User with username '{username}' not found")

        # ===== اگر با یوزرنیم پیدا نشد، با شماره موبایل امتحان کن =====
        if not user and phone:
            try:
                user_obj = User.objects.get(phone=phone)
                user = authenticate(username=user_obj.username, password=password)
                if user:
                    print(f"✅ Login successful with phone: {phone}")
            except User.DoesNotExist:
                print(f"❌ User with phone '{phone}' not found")

        if not user:
            return Response(
                {'error': 'یوزرنیم/شماره موبایل یا رمز عبور اشتباه است'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'error': 'حساب کاربری غیرفعال است'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {'message': 'Successfully logged out'},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserViewSet(viewsets.ModelViewSet):
    """
    مدیریت کامل کاربران (فقط ادمین)
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # فقط ادمین ها میتونن لیست کاربران رو ببینن
        if user.is_superuser:
            return User.objects.all().order_by('-date_joined')
        # کاربر عادی فقط خودش رو میبینه
        return User.objects.filter(id=user.id)

    def get_permissions(self):
        # برای لیست، حذف و ویرایش فقط ادمین
        if self.action in ['list', 'destroy', 'update', 'partial_update']:
            self.permission_classes = [permissions.IsAdminUser]
        return super().get_permissions()

    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        """
        فعال/غیرفعال کردن کاربر
        """
        if not request.user.is_superuser:
            return Response(
                {'error': 'شما دسترسی لازم را ندارید'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            user = self.get_object()
            user.is_active = not user.is_active
            user.save()
            return Response({
                'message': f'کاربر {"فعال" if user.is_active else "غیرفعال"} شد',
                'is_active': user.is_active
            })
        except User.DoesNotExist:
            return Response(
                {'error': 'کاربر یافت نشد'},
                status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, *args, **kwargs):
        """
        حذف کاربر (فقط ادمین)
        """
        if not request.user.is_superuser:
            return Response(
                {'error': 'شما دسترسی لازم را ندارید'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


# ===== ✅ UserStatsView (آمار کاربران) =====
class UserStatsView(APIView):
    """
    دریافت آمار کاربران (فقط ادمین)
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()
        superusers = User.objects.filter(is_superuser=True).count()
        instructors = User.objects.filter(is_instructor=True).count()

        users_with_purchases = User.objects.filter(
            purchased_packages__is_active=True
        ).distinct().count()

        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': inactive_users,
            'superusers': superusers,
            'instructors': instructors,
            'users_with_purchases': users_with_purchases,
        })

class AdminUserSearchView(APIView):
    """Fast search for the command palette."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        q = (request.query_params.get('q') or '').strip()
        if len(q) < 2:
            return Response({'results': []})

        from django.db.models import Q
        users = User.objects.filter(
            Q(username__icontains=q) |
            Q(email__icontains=q) |
            Q(phone__icontains=q) |
            Q(first_name__icontains=q) |
            Q(last_name__icontains=q)
        ).order_by('-date_joined')[:6]

        return Response({
            'results': [
                {
                    'id': u.id,
                    'title': u.get_full_name() or u.username,
                    'subtitle': u.email or u.phone or f'@{u.username}',
                    'avatar_letter': (u.get_full_name() or u.username)[:1].upper(),
                    'href': f'/admin/users?id={u.id}',
                }
                for u in users
            ]
        })


class SavedViewViewSet(viewsets.ModelViewSet):
    """
    CRUD for the current admin's saved views.
    Scoped per-user; each user only sees their own.
    """
    serializer_class = SavedViewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = SavedView.objects.filter(user=self.request.user)
        page_type = self.request.query_params.get('page_type')  # ← renamed
        if page_type:
            qs = qs.filter(page=page_type)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # ensure user can't reassign ownership
        serializer.save(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def bulk_activate_users(request):
    """Body: { ids: [1,2,3] }"""
    ids = request.data.get('ids') or []
    if not ids:
        return Response({'error': 'هیچ کاربری انتخاب نشده'}, status=400)
    updated = User.objects.filter(id__in=ids).update(is_active=True)
    return Response({'updated': updated})


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def bulk_deactivate_users(request):
    """Body: { ids: [1,2,3] } — soft delete style"""
    ids = request.data.get('ids') or []
    if not ids:
        return Response({'error': 'هیچ کاربری انتخاب نشده'}, status=400)
    # جلوگیری از غیرفعال کردن خود ادمین
    ids = [i for i in ids if i != request.user.id]
    updated = User.objects.filter(id__in=ids).update(is_active=False)
    return Response({'updated': updated})


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def bulk_make_instructor(request):
    """Body: { ids: [1,2,3], value: true|false }"""
    ids = request.data.get('ids') or []
    value = bool(request.data.get('value', True))
    if not ids:
        return Response({'error': 'هیچ کاربری انتخاب نشده'}, status=400)
    updated = User.objects.filter(id__in=ids, is_superuser=False).update(is_instructor=value)
    return Response({'updated': updated})


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def bulk_delete_users(request):
    """
    Body: { ids: [1,2,3] }
    Real delete — for safety, skip superusers.
    """
    ids = request.data.get('ids') or []
    if not ids:
        return Response({'error': 'هیچ کاربری انتخاب نشده'}, status=400)
    # نباید خودت یا ادمین‌های دیگه رو حذف کنی
    ids = [i for i in ids if i != request.user.id]
    deleted, _ = User.objects.filter(id__in=ids, is_superuser=False).delete()
    return Response({'deleted': deleted})


