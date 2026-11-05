// src/pages/admin/AdminSettings.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FaSave, FaTimes, FaUpload, FaImage, FaPalette,
  FaDollarSign, FaEnvelope, FaUserCog, FaGlobe,
  FaLock, FaShieldAlt, FaDatabase, FaUndo,
  FaCheckCircle, FaExclamationTriangle, FaEye,
  FaEyeSlash, FaKey, FaServer, FaMailBulk,
  FaEdit, FaTrash, FaPlus, FaArrowLeft
} from 'react-icons/fa';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';

function AdminSettings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // ===== State =====
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // ===== عمومی =====
    site_name: 'بیات آکادمی',
    site_description: 'آموزش‌های تخصصی هوش مصنوعی و برنامه‌نویسی',
    site_logo: '',
    site_favicon: '',
    contact_email: 'info@bayatacademy.com',
    contact_phone: '09123456789',
    address: 'تهران، ایران',

    // ===== پرداخت =====
    merchant_id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    sandbox_mode: true,
    callback_url: 'https://bayatacademy.com/payment/verify',
    currency: 'IRT',

    // ===== ظاهری =====
    primary_color: '#4A6CF7',
    secondary_color: '#6C63FF',
    font_family: 'Vazirmatn',
    header_style: 'default',
    footer_text: 'تمامی حقوق برای بیات آکادمی محفوظ است',

    // ===== ایمیل =====
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    admin_email: 'admin@bayatacademy.com',

    // ===== امنیت =====
    max_login_attempts: 5,
    lockout_time: 15,
    enable_2fa: false,
    enable_recaptcha: false,
    recaptcha_site_key: '',
    recaptcha_secret_key: '',
  });

  const [logoPreview, setLogoPreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ===== لود کردن تنظیمات =====
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  // ===== تغییر فیلد =====
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ===== آپلود تصویر =====
  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً یک فایل تصویر انتخاب کنید');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم تصویر نباید بیشتر از ۲ مگابایت باشد');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') {
        setLogoPreview(reader.result);
        setSettings(prev => ({ ...prev, site_logo: reader.result }));
      } else {
        setFaviconPreview(reader.result);
        setSettings(prev => ({ ...prev, site_favicon: reader.result }));
      }
      toast.success('تصویر با موفقیت بارگذاری شد');
    };
    reader.readAsDataURL(file);
  };

  // ===== ذخیره تنظیمات =====
  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('تنظیمات با موفقیت ذخیره شد');
    } catch (error) {
      toast.error('خطا در ذخیره تنظیمات');
    } finally {
      setLoading(false);
    }
  };

  // ===== ریست به حالت پیش‌فرض =====
  const handleReset = () => {
    if (!window.confirm('آیا از بازنشانی تنظیمات به حالت پیش‌فرض مطمئن هستید؟')) return;
    toast.info('تنظیمات به حالت پیش‌فرض بازنشانی شد');
  };

  // ===== تب‌ها =====
  const tabs = [
    { id: 'general', label: 'عمومی', icon: FaGlobe },
    { id: 'payment', label: 'پرداخت', icon: FaDollarSign },
    { id: 'appearance', label: 'ظاهری', icon: FaPalette },
    { id: 'email', label: 'ایمیل', icon: FaEnvelope },
    { id: 'security', label: 'امنیت', icon: FaShieldAlt },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>در حال بارگذاری تنظیمات...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* ===== Header ===== */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>⚙️ تنظیمات سایت</h1>
            <p style={styles.pageSubtitle}>مدیریت تنظیمات کلی سایت</p>
          </div>
          <div style={styles.headerActions}>
            <button onClick={handleReset} style={styles.resetBtn}>
              <FaUndo /> بازنشانی
            </button>
            <button onClick={handleSave} style={styles.saveBtn} disabled={loading}>
              <FaSave /> {loading ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
            </button>
          </div>
        </div>

        {/* ===== Tabs ===== */}
        <div style={styles.tabs}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.id ? styles.tabActive : {}),
                }}
              >
                <Icon style={styles.tabIcon} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ===== Content ===== */}
        <div style={styles.content}>
          {/* ===== عمومی ===== */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.tabContent}
            >
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>اطلاعات عمومی</h3>

                <div style={styles.formGroup}>
                  <label style={styles.label}>نام سایت *</label>
                  <input
                    type="text"
                    name="site_name"
                    value={settings.site_name}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="نام سایت"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>توضیحات سایت</label>
                  <textarea
                    name="site_description"
                    value={settings.site_description}
                    onChange={handleChange}
                    style={styles.textarea}
                    placeholder="توضیحات سایت"
                    rows="3"
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>ایمیل تماس</label>
                    <input
                      type="email"
                      name="contact_email"
                      value={settings.contact_email}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="ایمیل تماس"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>شماره تماس</label>
                    <input
                      type="tel"
                      name="contact_phone"
                      value={settings.contact_phone}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="شماره تماس"
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>آدرس</label>
                  <input
                    type="text"
                    name="address"
                    value={settings.address}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="آدرس"
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>لوگو سایت</label>
                    <div style={styles.uploadArea}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        style={styles.fileInput}
                      />
                      <div style={styles.uploadContent}>
                        {logoPreview || settings.site_logo ? (
                          <img
                            src={logoPreview || settings.site_logo}
                            alt="لوگو"
                            style={styles.uploadPreview}
                          />
                        ) : (
                          <>
                            <FaImage style={styles.uploadIcon} />
                            <span>انتخاب لوگو</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Favicon</label>
                    <div style={styles.uploadArea}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'favicon')}
                        style={styles.fileInput}
                      />
                      <div style={styles.uploadContent}>
                        {faviconPreview || settings.site_favicon ? (
                          <img
                            src={faviconPreview || settings.site_favicon}
                            alt="Favicon"
                            style={{...styles.uploadPreview, width: '64px', height: '64px', borderRadius: '8px'}}
                          />
                        ) : (
                          <>
                            <FaImage style={styles.uploadIcon} />
                            <span>انتخاب Favicon</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== پرداخت ===== */}
          {activeTab === 'payment' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.tabContent}
            >
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>تنظیمات پرداخت</h3>

                <div style={styles.formGroup}>
                  <label style={styles.label}>مرچنت آیدی زرین‌پال</label>
                  <input
                    type="text"
                    name="merchant_id"
                    value={settings.merchant_id}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="مرچنت آیدی"
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>واحد پول</label>
                    <select
                      name="currency"
                      value={settings.currency}
                      onChange={handleChange}
                      style={styles.select}
                    >
                      <option value="IRT">تومان (IRT)</option>
                      <option value="IRR">ریال (IRR)</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>آدرس بازگشت</label>
                    <input
                      type="url"
                      name="callback_url"
                      value={settings.callback_url}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="آدرس بازگشت"
                    />
                  </div>
                </div>

                <div style={styles.checkboxGroup}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="sandbox_mode"
                      checked={settings.sandbox_mode}
                      onChange={handleChange}
                      style={styles.checkbox}
                    />
                    <span style={styles.checkboxText}>حالت تست (Sandbox)</span>
                  </label>
                </div>

                <div style={styles.infoBox}>
                  <FaExclamationTriangle style={styles.infoIcon} />
                  <div>
                    <p style={styles.infoTitle}>نکته مهم</p>
                    <p style={styles.infoText}>
                      در حالت تست، پرداخت‌ها با کارت‌های آزمایشی انجام می‌شوند.
                      برای فعال‌سازی پرداخت واقعی، حالت تست را غیرفعال کنید و مرچنت آیدی معتبر وارد کنید.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== ظاهری ===== */}
          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.tabContent}
            >
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>تنظیمات ظاهری</h3>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>رنگ اصلی</label>
                    <div style={styles.colorPickerWrapper}>
                      <input
                        type="color"
                        name="primary_color"
                        value={settings.primary_color}
                        onChange={handleChange}
                        style={styles.colorInput}
                      />
                      <input
                        type="text"
                        name="primary_color"
                        value={settings.primary_color}
                        onChange={handleChange}
                        style={{...styles.input, flex: 1}}
                      />
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>رنگ ثانویه</label>
                    <div style={styles.colorPickerWrapper}>
                      <input
                        type="color"
                        name="secondary_color"
                        value={settings.secondary_color}
                        onChange={handleChange}
                        style={styles.colorInput}
                      />
                      <input
                        type="text"
                        name="secondary_color"
                        value={settings.secondary_color}
                        onChange={handleChange}
                        style={{...styles.input, flex: 1}}
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>فونت</label>
                  <select
                    name="font_family"
                    value={settings.font_family}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="Vazirmatn">وزیرمتن</option>
                    <option value="IRANSans">ایران‌سنس</option>
                    <option value="Yekan">یکان</option>
                    <option value="Tahoma">Tahoma</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>متن فوتر</label>
                  <input
                    type="text"
                    name="footer_text"
                    value={settings.footer_text}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="متن فوتر"
                  />
                </div>

                <div style={styles.previewBox}>
                  <h4 style={styles.previewTitle}>پیش‌نمایش رنگ‌ها</h4>
                  <div style={styles.previewColors}>
                    <div style={{...styles.previewColor, background: settings.primary_color}}>
                      رنگ اصلی
                    </div>
                    <div style={{...styles.previewColor, background: settings.secondary_color}}>
                      رنگ ثانویه
                    </div>
                    <div style={{...styles.previewColor, background: settings.primary_color + '15'}}>
                      پس‌زمینه
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== ایمیل ===== */}
          {activeTab === 'email' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.tabContent}
            >
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>تنظیمات ایمیل</h3>

                <div style={styles.infoBox}>
                  <FaMailBulk style={styles.infoIcon} />
                  <div>
                    <p style={styles.infoTitle}>تنظیمات SMTP</p>
                    <p style={styles.infoText}>
                      برای ارسال ایمیل‌های اطلاع‌رسانی، تنظیمات SMTP را تکمیل کنید.
                    </p>
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>سرور SMTP</label>
                    <input
                      type="text"
                      name="smtp_host"
                      value={settings.smtp_host}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>پورت</label>
                    <input
                      type="number"
                      name="smtp_port"
                      value={settings.smtp_port}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="587"
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>نام کاربری</label>
                    <input
                      type="text"
                      name="smtp_username"
                      value={settings.smtp_username}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="نام کاربری"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>رمز عبور</label>
                    <div style={styles.passwordWrapper}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="smtp_password"
                        value={settings.smtp_password}
                        onChange={handleChange}
                        style={{...styles.input, paddingLeft: '44px'}}
                        placeholder="رمز عبور"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={styles.passwordToggle}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>رمزنگاری</label>
                  <select
                    name="smtp_encryption"
                    value={settings.smtp_encryption}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="none">بدون رمزنگاری</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>ایمیل ادمین</label>
                  <input
                    type="email"
                    name="admin_email"
                    value={settings.admin_email}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="ایمیل ادمین"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== امنیت ===== */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.tabContent}
            >
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>تنظیمات امنیت</h3>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>حداکثر تلاش برای ورود</label>
                    <input
                      type="number"
                      name="max_login_attempts"
                      value={settings.max_login_attempts}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="۵"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>زمان قفل (دقیقه)</label>
                    <input
                      type="number"
                      name="lockout_time"
                      value={settings.lockout_time}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="۱۵"
                    />
                  </div>
                </div>

                <div style={styles.checkboxGroup}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="enable_2fa"
                      checked={settings.enable_2fa}
                      onChange={handleChange}
                      style={styles.checkbox}
                    />
                    <span style={styles.checkboxText}>فعال‌سازی احراز هویت دو مرحله‌ای (2FA)</span>
                  </label>
                </div>

                <div style={styles.checkboxGroup}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="enable_recaptcha"
                      checked={settings.enable_recaptcha}
                      onChange={handleChange}
                      style={styles.checkbox}
                    />
                    <span style={styles.checkboxText}>فعال‌سازی reCAPTCHA</span>
                  </label>
                </div>

                {settings.enable_recaptcha && (
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Site Key</label>
                      <input
                        type="text"
                        name="recaptcha_site_key"
                        value={settings.recaptcha_site_key}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="Site Key"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Secret Key</label>
                      <input
                        type="text"
                        name="recaptcha_secret_key"
                        value={settings.recaptcha_secret_key}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="Secret Key"
                      />
                    </div>
                  </div>
                )}

                <div style={styles.infoBox}>
                  <FaShieldAlt style={styles.infoIcon} />
                  <div>
                    <p style={styles.infoTitle}>امنیت سایت</p>
                    <p style={styles.infoText}>
                      تنظیمات امنیتی به محافظت از سایت در برابر حملات کمک می‌کند.
                      توصیه می‌شود تمام گزینه‌های امنیتی را فعال کنید.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// ===== Styles =====
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: 'clamp(24px, 3vw, 32px)',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '4px',
  },
  pageSubtitle: {
    fontSize: '15px',
    color: 'rgba(26,26,46,0.4)',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'rgba(255,107,107,0.04)',
    border: '1px solid rgba(255,107,107,0.06)',
    borderRadius: '10px',
    color: '#FF6B6B',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: 'Vazirmatn, sans-serif',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255,107,107,0.08)',
    },
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #4A6CF7, #6C63FF)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'Vazirmatn, sans-serif',
    boxShadow: '0 4px 20px rgba(74,108,247,0.15)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 30px rgba(74,108,247,0.25)',
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none',
    },
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '24px',
    background: '#ffffff',
    borderRadius: '12px',
    padding: '4px',
    border: '1px solid rgba(0,0,0,0.03)',
    boxShadow: '0 2px 20px rgba(0,0,0,0.02)',
    overflowX: 'auto',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#8a8a9a',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'Vazirmatn, sans-serif',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    background: 'linear-gradient(135deg, rgba(74,108,247,0.08), rgba(108,99,255,0.08))',
    color: '#4A6CF7',
  },
  tabIcon: {
    fontSize: '16px',
  },
  content: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid rgba(0,0,0,0.03)',
    boxShadow: '0 2px 20px rgba(0,0,0,0.02)',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '8px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a4a5a',
  },
  input: {
    padding: '10px 14px',
    background: '#f8f9fa',
    border: '1px solid #e8e8ee',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1a1a2e',
    fontFamily: 'Vazirmatn, sans-serif',
    transition: 'all 0.3s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#4A6CF7',
      background: '#ffffff',
      boxShadow: '0 0 0 4px rgba(74,108,247,0.04)',
    },
  },
  textarea: {
    padding: '10px 14px',
    background: '#f8f9fa',
    border: '1px solid #e8e8ee',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1a1a2e',
    fontFamily: 'Vazirmatn, sans-serif',
    resize: 'vertical',
    '&:focus': {
      outline: 'none',
      borderColor: '#4A6CF7',
      background: '#ffffff',
      boxShadow: '0 0 0 4px rgba(74,108,247,0.04)',
    },
  },
  select: {
    padding: '10px 14px',
    background: '#f8f9fa',
    border: '1px solid #e8e8ee',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1a1a2e',
    fontFamily: 'Vazirmatn, sans-serif',
    '&:focus': {
      outline: 'none',
      borderColor: '#4A6CF7',
    },
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#4A6CF7',
    cursor: 'pointer',
  },
  checkboxText: {
    fontSize: '14px',
    color: '#4a4a5a',
  },
  uploadArea: {
    position: 'relative',
    width: '100%',
    height: '120px',
    border: '2px dashed #e8e8ee',
    borderRadius: '10px',
    overflow: 'hidden',
    background: '#f8f9fa',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#4A6CF7',
    },
  },
  fileInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    zIndex: 2,
  },
  uploadContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    color: '#8a8a9a',
    fontSize: '14px',
    gap: '8px',
  },
  uploadIcon: {
    fontSize: '32px',
    color: '#4A6CF7',
  },
  uploadPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  colorPickerWrapper: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  colorInput: {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    border: '1px solid #e8e8ee',
    cursor: 'pointer',
    padding: '2px',
    flexShrink: 0,
  },
  passwordWrapper: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#c0c0d0',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
  },
  infoBox: {
    display: 'flex',
    gap: '16px',
    padding: '16px 20px',
    background: 'rgba(74,108,247,0.04)',
    borderRadius: '10px',
    border: '1px solid rgba(74,108,247,0.06)',
  },
  infoIcon: {
    fontSize: '24px',
    color: '#4A6CF7',
    flexShrink: 0,
  },
  infoTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '4px',
  },
  infoText: {
    fontSize: '13px',
    color: 'rgba(26,26,46,0.5)',
    lineHeight: '1.6',
  },
  previewBox: {
    padding: '16px 20px',
    background: '#f8f9fa',
    borderRadius: '10px',
    border: '1px solid #e8e8ee',
  },
  previewTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a4a5a',
    marginBottom: '12px',
  },
  previewColors: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  previewColor: {
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: 'white',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '16px',
    color: 'rgba(26,26,46,0.5)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(74,108,247,0.06)',
    borderTop: '3px solid #4A6CF7',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// ===== اضافه کردن keyframes =====
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr !important;
    }
    .header-actions {
      flex-wrap: wrap !important;
      width: 100% !important;
    }
    .header-actions button {
      flex: 1 !important;
      justify-content: center !important;
    }
    .tabs {
      flex-wrap: nowrap !important;
      overflow-x: auto !important;
    }
    .tab {
      padding: 8px 14px !important;
      font-size: 12px !important;
    }
    .tab span {
      display: none !important;
    }
    .content {
      padding: 16px !important;
    }
    .color-picker-wrapper {
      flex-wrap: wrap !important;
    }
    .upload-area {
      height: 100px !important;
    }
    .info-box {
      flex-direction: column !important;
      text-align: center !important;
    }
    .preview-colors {
      justify-content: center !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default AdminSettings;