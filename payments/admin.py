# payments/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    # ===== لیست =====
    list_display = (
        'id',
        'user_link',
        'package_link',
        'amount_display',
        'status_badge',
        'authority',
        'ref_id',
        'created_at',
        'paid_at',
    )

    # ===== فیلترها =====
    list_filter = (
        'status',
        'created_at',
        'paid_at',
        'package',
    )

    # ===== جستجو =====
    search_fields = (
        'user__username',
        'user__email',
        'user__phone',
        'package__title',
        'authority',
        'ref_id',
    )

    # ===== فقط خواندنی =====
    readonly_fields = (
        'authority',
        'created_at',
        'updated_at',
        'amount',
        'user',
        'package',
        'status_badge',
        'payment_details',
    )

    # ===== تعداد در هر صفحه =====
    list_per_page = 25

    # ===== تاریخ‌ها =====
    date_hierarchy = 'created_at'

    # ===== ترتیب =====
    ordering = ['-created_at']

    # ===== فیلدست‌ها =====
    fieldsets = (
        ('اطلاعات کاربر', {
            'fields': ('user', 'user_info')
        }),
        ('اطلاعات دوره', {
            'fields': ('package', 'package_info')
        }),
        ('اطلاعات پرداخت', {
            'fields': ('amount_display', 'authority', 'ref_id', 'status_badge', 'paid_at')
        }),
        ('جزئیات کامل', {
            'fields': ('payment_details',),
            'classes': ('collapse',),
        }),
        ('زمان‌ها', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    # ===== متدهای نمایش =====
    def user_link(self, obj):
        """لینک به کاربر در ادمین"""
        if obj.user:
            url = reverse('admin:accounts_user_change', args=[obj.user.id])
            return format_html(
                '<a href="{}" style="font-weight:500;">{} {}</a>',
                url,
                obj.user.get_full_name() or obj.user.username,
                format_html('<span style="color:#8a8a9a;font-size:11px;">({})</span>', obj.user.username)
            )
        return '-'

    user_link.short_description = 'کاربر'
    user_link.admin_order_field = 'user__username'

    def package_link(self, obj):
        """لینک به پکیج در ادمین"""
        if obj.package:
            url = reverse('admin:packages_package_change', args=[obj.package.id])
            return format_html(
                '<a href="{}" style="font-weight:500;">{}</a>',
                url,
                obj.package.title
            )
        return '-'

    package_link.short_description = 'دوره'
    package_link.admin_order_field = 'package__title'

    def amount_display(self, obj):
        """نمایش مبلغ با فرمت"""
        # ===== FIX: Format number first, then pass to format_html =====
        amount_formatted = f"{int(obj.amount):,}"
        return format_html(
            '<span style="font-weight:600;color:#1a1a2e;">{} تومان</span>',
            amount_formatted
        )

    amount_display.short_description = 'مبلغ'
    amount_display.admin_order_field = 'amount'

    def status_badge(self, obj):
        """نمایش وضعیت با رنگ"""
        colors = {
            'pending': ('#FFB800', 'در انتظار'),
            'paid': ('#00C9A7', 'پرداخت شده ✅'),
            'failed': ('#FF6B6B', 'ناموفق ❌'),
            'cancelled': ('#8a8a9a', 'لغو شده ⏹'),
        }
        color, label = colors.get(obj.status, ('#8a8a9a', obj.status))
        return format_html(
            '<span style="background:{}15;color:{};padding:4px 12px;border-radius:50px;font-size:12px;font-weight:600;">{}</span>',
            color, color, label
        )

    status_badge.short_description = 'وضعیت'
    status_badge.admin_order_field = 'status'

    def user_info(self, obj):
        """اطلاعات کامل کاربر"""
        if not obj.user:
            return '-'
        return format_html(
            '''
            <div style="display:flex;flex-direction:column;gap:4px;">
                <span style="font-weight:500;">{} {}</span>
                <span style="color:#8a8a9a;font-size:13px;">📱 {}</span>
                <span style="color:#8a8a9a;font-size:13px;">✉️ {}</span>
                <span style="color:#8a8a9a;font-size:12px;">👤 @{}</span>
            </div>
            ''',
            obj.user.get_full_name() or '',
            obj.user.username,
            obj.user.phone or 'ثبت نشده',
            obj.user.email or 'ثبت نشده',
            obj.user.username
        )

    user_info.short_description = 'اطلاعات کاربر'

    def package_info(self, obj):
        """اطلاعات کامل پکیج"""
        if not obj.package:
            return '-'
        # ===== FIX: Format number first =====
        price_formatted = f"{int(obj.package.price):,}"
        return format_html(
            '''
            <div style="display:flex;flex-direction:column;gap:4px;">
                <span style="font-weight:500;">📚 {}</span>
                <span style="color:#8a8a9a;font-size:13px;">💰 {} تومان</span>
                <span style="color:#8a8a9a;font-size:12px;">{} دسته‌بندی</span>
            </div>
            ''',
            obj.package.title,
            price_formatted,
            obj.package.categories.count()
        )

    package_info.short_description = 'اطلاعات دوره'

    def payment_details(self, obj):
        """جزئیات کامل پرداخت"""
        status_colors = {
            'pending': '#FFB800',
            'paid': '#00C9A7',
            'failed': '#FF6B6B',
            'cancelled': '#8a8a9a',
        }
        # ===== FIX: Format number first =====
        amount_formatted = f"{int(obj.amount):,}"
        return format_html(
            '''
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:12px;background:#f8f9fa;border-radius:8px;">
                <div>
                    <span style="color:#8a8a9a;font-size:12px;">وضعیت</span>
                    <div style="font-weight:600;color:{};">{}</div>
                </div>
                <div>
                    <span style="color:#8a8a9a;font-size:12px;">مبلغ</span>
                    <div style="font-weight:600;">{} تومان</div>
                </div>
                <div>
                    <span style="color:#8a8a9a;font-size:12px;">کد تراکنش</span>
                    <div style="font-weight:500;">{}</div>
                </div>
                <div>
                    <span style="color:#8a8a9a;font-size:12px;">شماره مرجع</span>
                    <div style="font-weight:500;">{}</div>
                </div>
                <div>
                    <span style="color:#8a8a9a;font-size:12px;">زمان ایجاد</span>
                    <div>{}</div>
                </div>
                <div>
                    <span style="color:#8a8a9a;font-size:12px;">زمان پرداخت</span>
                    <div>{}</div>
                </div>
            </div>
            ''',
            status_colors.get(obj.status, '#8a8a9a'),
            obj.get_status_display(),
            amount_formatted,
            obj.authority or '-',
            obj.ref_id or '-',
            obj.created_at.strftime('%Y/%m/%d %H:%M') if obj.created_at else '-',
            obj.paid_at.strftime('%Y/%m/%d %H:%M') if obj.paid_at else '-'
        )

    payment_details.short_description = 'جزئیات'

    # ===== اکشن‌ها =====
    actions = ['mark_as_paid', 'mark_as_failed', 'mark_as_cancelled']

    def mark_as_paid(self, request, queryset):
        """تغییر وضعیت به پرداخت شده"""
        updated = queryset.update(
            status=Payment.Status.PAID,
            paid_at=timezone.now()
        )
        self.message_user(request, f'✅ {updated} تراکنش به وضعیت "پرداخت شده" تغییر کرد.')

    mark_as_paid.short_description = '✅ تغییر وضعیت به پرداخت شده'

    def mark_as_failed(self, request, queryset):
        """تغییر وضعیت به ناموفق"""
        updated = queryset.update(status=Payment.Status.FAILED)
        self.message_user(request, f'❌ {updated} تراکنش به وضعیت "ناموفق" تغییر کرد.')

    mark_as_failed.short_description = '❌ تغییر وضعیت به ناموفق'

    def mark_as_cancelled(self, request, queryset):
        """تغییر وضعیت به لغو شده"""
        updated = queryset.update(status=Payment.Status.CANCELLED)
        self.message_user(request, f'⏹ {updated} تراکنش به وضعیت "لغو شده" تغییر کرد.')

    mark_as_cancelled.short_description = '⏹ تغییر وضعیت به لغو شده'

    # ===== فیلترهای سفارشی =====
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'package')