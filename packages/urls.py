# packages/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PackageViewSet,
    FreePackagesView,
    MyPackagesView,
    AddFreePackageView,
    CategoryViewSet,
    DashboardStatsView,
    AdminPackageSearchView,
    bulk_delete_categories,
    bulk_create_categories,
    bulk_publish_packages,
    bulk_unpublish_packages,
    bulk_mark_top,
    bulk_delete_packages,
)

app_name = 'packages'

router = DefaultRouter()
router.register(r'packages', PackageViewSet, basename='package')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('free/', FreePackagesView.as_view(), name='free-packages'),
    path('my-packages/', MyPackagesView.as_view(), name='my-packages'),
    path('add-free/<int:package_id>/', AddFreePackageView.as_view(), name='add-free-package'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('admin/search-packages/', AdminPackageSearchView.as_view(), name='admin-search-packages'),
    # ===== Bulk categories =====
    path('categories/bulk/delete/', bulk_delete_categories, name='bulk-categories-delete'),
    path('categories/bulk/create/', bulk_create_categories, name='bulk-categories-create'),
    # ===== Bulk packages =====
    path('packages/bulk/publish/', bulk_publish_packages, name='bulk-packages-publish'),
    path('packages/bulk/unpublish/', bulk_unpublish_packages, name='bulk-packages-unpublish'),
    path('packages/bulk/mark-top/', bulk_mark_top, name='bulk-packages-mark-top'),
    path('packages/bulk/delete/', bulk_delete_packages, name='bulk-packages-delete'),
    path('', include(router.urls)),
]