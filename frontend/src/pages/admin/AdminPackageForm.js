// src/pages/admin/AdminPackageForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSave, FaTimes, FaPlus, FaTrash, FaImage,
  FaCheckCircle, FaArrowLeft, FaEye, FaEyeSlash,
  FaStar, FaGift, FaClock, FaUserGraduate, FaVideo,
  FaArrowRight, FaLink, FaUpload, FaSpinner,
  FaList, FaBookOpen, FaDollarSign, FaTag, FaYoutube,
  FaPlusCircle, FaTrashAlt, FaFileVideo, FaInfoCircle,
} from 'react-icons/fa';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';
import axios from 'axios';
import { fetchCategories } from '../../features/categories/categorySlice';
import { fetchPackageDetail } from '../../features/packages/packageSlice';
import PackageCover from '../../components/PackageCover';
import theme from '../../styles/adminTheme';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function AdminPackageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = !!id;

  const { categories } = useSelector((state) => state.categories);
  const { currentPackage, loading } = useSelector((state) => state.packages);

  // ═══════════════════════════════════════════════════════
  // FORM STATE — unchanged
  // ═══════════════════════════════════════════════════════
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    discounted_price: null,
    is_free: false,
    image: '',
    image_url: '',
    introduction_video_url: '',
    introduction_video: null,
    duration: '',
    topics: [],
    features: [],
    is_top: false,
    is_published: false,
    categories: [],
    spot_player_course_id: '',
  });

  const [newFeature, setNewFeature] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File states
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  const [showVideoUrlInput, setShowVideoUrlInput] = useState(false);

  // Flag states for deletion
  const [videoRemoved, setVideoRemoved] = useState(false);
  const [imageRemoved, setImageRemoved] = useState(false);

  // ═══════════════════════════════════════════════════════
  // LOAD DATA — unchanged
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    dispatch(fetchCategories());
    if (isEditMode) {
      dispatch(fetchPackageDetail(id));
    }
  }, [dispatch, id, isEditMode]);

  // ═══════════════════════════════════════════════════════
  // POPULATE FORM FOR EDIT — unchanged
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    if (isEditMode && currentPackage) {
      setFormData({
        title: currentPackage.title || '',
        description: currentPackage.description || '',
        price: currentPackage.price || 0,
        discounted_price: currentPackage.discounted_price || null,
        is_free: currentPackage.is_free || false,
        image: currentPackage.image || '',
        image_url: currentPackage.image_url || '',
        introduction_video_url: currentPackage.introduction_video_url || '',
        introduction_video: null,
        duration: currentPackage.duration || '',
        topics: currentPackage.topics || [],
        features: currentPackage.features || [],
        is_top: currentPackage.is_top || false,
        is_published: currentPackage.is_published || false,
        categories: currentPackage.categories || [],
        spot_player_course_id: currentPackage.spot_player_course_id || '',
      });

      if (currentPackage.image) setImagePreview(currentPackage.image);
      if (currentPackage.introduction_video) setVideoPreview(currentPackage.introduction_video);

      setVideoRemoved(false);
      setImageRemoved(false);

      const existingCategoryIds = currentPackage.categories?.map((c) => c.id) || [];
      setSelectedCategoryIds(existingCategoryIds);
    }
  }, [isEditMode, currentPackage]);

  // ═══════════════════════════════════════════════════════
  // HANDLERS — unchanged
  // ═══════════════════════════════════════════════════════

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً یک فایل تصویر انتخاب کنید');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم تصویر نباید بیشتر از ۵ مگابایت باشد');
      return;
    }

    setImageFile(file);
    setFormData((prev) => ({ ...prev, image: file, image_url: '' }));
    setImageRemoved(false);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    toast.success('تصویر انتخاب شد');
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('لطفاً یک فایل ویدیو انتخاب کنید');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error('حجم ویدیو نباید بیشتر از ۱۰۰ مگابایت باشد');
      return;
    }

    setVideoFile(file);
    setFormData((prev) => ({ ...prev, introduction_video: file, introduction_video_url: '' }));
    setVideoRemoved(false);

    const reader = new FileReader();
    reader.onloadend = () => setVideoPreview(reader.result);
    reader.readAsDataURL(file);
    toast.success('ویدیو انتخاب شد');
  };

  const handleRemoveImage = () => {
    if (!window.confirm('آیا از حذف تصویر مطمئن هستید؟')) return;
    setImageFile(null);
    setImagePreview('');
    setImageRemoved(true);
    setFormData((prev) => ({ ...prev, image: '', image_url: '' }));
    toast.info('تصویر حذف خواهد شد. برای اعمال، ذخیره کنید.');
  };

  const handleRemoveVideo = () => {
    if (!window.confirm('آیا از حذف ویدیو مطمئن هستید؟')) return;
    setVideoFile(null);
    setVideoPreview('');
    setVideoRemoved(true);
    setFormData((prev) => ({
      ...prev,
      introduction_video: null,
      introduction_video_url: '',
    }));
    toast.info('ویدیو حذف خواهد شد. برای اعمال، ذخیره کنید.');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? null : Number(value),
    }));
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, newFeature.trim()],
    }));
    setNewFeature('');
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleFeatureKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  const handleAddTopic = () => {
    if (!newTopic.trim()) return;
    setFormData((prev) => ({
      ...prev,
      topics: [...prev.topics, newTopic.trim()],
    }));
    setNewTopic('');
  };

  const handleRemoveTopic = (index) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index),
    }));
  };

  const handleTopicKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTopic();
    }
  };

  // ═══════════════════════════════════════════════════════
  // SUBMIT — unchanged
  // ═══════════════════════════════════════════════════════
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('title', formData.title || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('price', formData.price || 0);
      formDataToSend.append('is_free', formData.is_free);
      formDataToSend.append('duration', formData.duration || '');
      formDataToSend.append('is_top', formData.is_top);
      formDataToSend.append('is_published', formData.is_published);

      if (formData.image_url) {
        formDataToSend.append('image_url', formData.image_url);
      }
      if (formData.introduction_video_url) {
        formDataToSend.append('introduction_video_url', formData.introduction_video_url);
      }

      formDataToSend.append('spot_player_course_id', formData.spot_player_course_id || '');

      if (formData.discounted_price !== null && formData.discounted_price !== '') {
        formDataToSend.append('discounted_price', formData.discounted_price);
      }

      formDataToSend.append('topics', JSON.stringify(formData.topics || []));
      formDataToSend.append('features', JSON.stringify(formData.features || []));

      const categoryIds = selectedCategoryIds
        .map((id) => Number(id))
        .filter((id) => !isNaN(id) && id > 0);
      formDataToSend.append('category_ids', JSON.stringify(categoryIds));

      if (videoRemoved) formDataToSend.append('remove_introduction_video', 'true');
      if (imageRemoved) formDataToSend.append('remove_image', 'true');

      if (imageFile) formDataToSend.append('image', imageFile);
      if (videoFile) formDataToSend.append('introduction_video', videoFile);

      const token = localStorage.getItem('access_token');

      let result;
      if (isEditMode) {
        const response = await axios.put(
          `${API_URL}/packages/packages/${id}/`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        result = response.data;
        toast.success('دوره به‌روز شد');
      } else {
        const response = await axios.post(
          `${API_URL}/packages/packages/`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        result = response.data;
        toast.success('دوره ایجاد شد');
      }

      navigate('/adminpanel/m1/admin/packages');
    } catch (error) {
      console.error('Error saving package:', error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const firstError = Object.keys(errorData)[0];
          if (firstError) {
            const message = Array.isArray(errorData[firstError])
              ? errorData[firstError][0]
              : errorData[firstError];
            toast.error(`${firstError}: ${message}`);
          } else {
            toast.error('خطا در ذخیره دوره');
          }
        } else {
          toast.error(errorData || 'خطا در ذخیره دوره');
        }
      } else {
        toast.error('خطا در ذخیره دوره');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════
  // PREVIEW DATA — unchanged
  // ═══════════════════════════════════════════════════════
  const previewData = {
    ...formData,
    categories: categories
      ? categories.filter((c) => selectedCategoryIds.includes(c.id))
      : [],
    students_count: currentPackage?.students_count || 0,
    feature_list: formData.features,
    topics_list: formData.topics,
    topics_count: formData.topics.length,
    is_free: formData.is_free,
    has_discount:
      formData.discounted_price && formData.discounted_price < formData.price,
    display_price_str: formData.is_free
      ? '🎁 رایگان'
      : formData.discounted_price
      ? `${formData.discounted_price.toLocaleString()} تومان`
      : `${formData.price.toLocaleString()} تومان`,
    original_price_str: formData.discounted_price
      ? `${formData.price.toLocaleString()} تومان`
      : null,
  };

  // ═══════════════════════════════════════════════════════
  // LOADING STATE — unchanged
  // ═══════════════════════════════════════════════════════
  if (loading && isEditMode) {
    return (
      <AdminLayout>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
        </div>
      </AdminLayout>
    );
  }

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <AdminLayout>
      <div style={styles.container}>

        {/* ═══ HEADER ═══ */}
        <div style={styles.header} className="apf-header">
          <div>
            <h1 style={styles.pageTitle}>
              {isEditMode ? 'ویرایش دوره' : 'ساخت دوره جدید'}
            </h1>
            <p style={styles.pageSubtitle}>
              {isEditMode
                ? 'اطلاعات دوره را ویرایش کنید'
                : 'دوره آموزشی جدید ایجاد کنید'}
            </p>
          </div>
          <div style={styles.headerActions}>
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={styles.previewToggle}
              className="apf-preview-toggle"
            >
              {showPreview ? <FaEyeSlash size={11} /> : <FaEye size={11} />}
              {showPreview ? 'بستن پیش‌نمایش' : 'پیش‌نمایش'}
            </button>
            <button
              onClick={() => navigate('/adminpanel/m1/admin/packages')}
              style={styles.backBtn}
              className="apf-back-btn"
            >
              <FaArrowLeft size={11} /> بازگشت
            </button>
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <div style={styles.tabs} className="apf-tabs">
          {[
            { key: 'basic', label: 'اطلاعات پایه', icon: FaInfoCircle },
            { key: 'topics', label: `سرفصل‌ها (${formData.topics.length})`, icon: FaList },
            { key: 'categories', label: 'دسته‌بندی', icon: FaTag },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  ...styles.tab,
                  ...(isActive ? styles.tabActive : {}),
                }}
                className="apf-tab"
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ═══ FORM + PREVIEW ═══ */}
        <div style={styles.formContainer} className="apf-form-container">
          <form onSubmit={handleSubmit} style={styles.form}>

            {/* ═══════════ TAB: BASIC ═══════════ */}
            {activeTab === 'basic' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.tabContent}
              >
                {/* Title */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    عنوان دوره <span style={{ color: theme.colors.danger }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    style={styles.input}
                    className="apf-input"
                    placeholder="عنوان دوره را وارد کنید"
                    required
                  />
                </div>

                {/* Description */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>توضیحات دوره</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    style={styles.textarea}
                    className="apf-input"
                    placeholder="توضیحات کامل دوره..."
                    rows="4"
                  />
                </div>

                {/* ═══ IMAGE SECTION ═══ */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FaImage size={11} style={styles.fieldIcon} />
                    تصویر کاور
                  </label>

                  <div style={styles.uploadToggle}>
                    <button
                      type="button"
                      onClick={() => setShowImageUrlInput(!showImageUrlInput)}
                      style={styles.toggleBtn}
                      className="apf-toggle-btn"
                    >
                      {showImageUrlInput ? <FaImage size={11} /> : <FaUpload size={11} />}
                      {showImageUrlInput ? 'آپلود فایل' : 'لینک تصویر'}
                    </button>
                  </div>

                  {!showImageUrlInput && (
                    <div style={styles.imageUploadArea} className="apf-upload-area">
                      {!imagePreview || imageRemoved ? (
                        <div style={styles.uploadBtnWrapper}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={styles.imageInput}
                            id="imageUpload"
                          />
                          <label htmlFor="imageUpload" style={styles.imageUploadLabel}>
                            <FaUpload style={styles.uploadIcon} />
                            <span>انتخاب تصویر از دستگاه</span>
                            <span style={styles.uploadHint}>
                              JPG, PNG, WebP (حداکثر ۵ مگابایت)
                            </span>
                          </label>
                        </div>
                      ) : (
                        <div style={styles.imagePreviewContainer}>
                          <img src={imagePreview} alt="کاور" style={styles.imagePreviewImg} />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            style={styles.removeImageBtn}
                            className="apf-remove-img"
                            title="حذف تصویر"
                          >
                            <FaTimes size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {showImageUrlInput && (
                    <div style={styles.urlInputWrapper}>
                      <input
                        type="url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleChange}
                        style={styles.input}
                        className="apf-input"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  )}
                </div>

                {/* ═══ VIDEO SECTION ═══ */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FaVideo size={11} style={styles.fieldIcon} />
                    ویدیو معرفی
                  </label>

                  <div style={styles.uploadToggle}>
                    <button
                      type="button"
                      onClick={() => setShowVideoUrlInput(!showVideoUrlInput)}
                      style={styles.toggleBtn}
                      className="apf-toggle-btn"
                    >
                      {showVideoUrlInput ? <FaFileVideo size={11} /> : <FaYoutube size={11} />}
                      {showVideoUrlInput ? 'آپلود فایل' : 'لینک ویدیو'}
                    </button>
                  </div>

                  {!showVideoUrlInput && (
                    <div style={styles.videoUploadArea} className="apf-upload-area">
                      {(!videoFile && !videoPreview) || videoRemoved ? (
                        <div style={styles.uploadBtnWrapper}>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoUpload}
                            style={styles.videoInput}
                            id="videoUpload"
                          />
                          <label htmlFor="videoUpload" style={styles.videoUploadLabel}>
                            <FaUpload style={styles.uploadIcon} />
                            <span>انتخاب ویدیو از دستگاه</span>
                            <span style={styles.uploadHint}>
                              MP4, WebM (حداکثر ۱۰۰ مگابایت)
                            </span>
                          </label>
                        </div>
                      ) : null}

                      {videoFile && (
                        <div style={styles.videoPreviewContainer}>
                          <span style={styles.videoFileName}>
                            <FaFileVideo size={11} /> {videoFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={handleRemoveVideo}
                            style={styles.removeVideoBtn}
                            className="apf-remove-video"
                          >
                            <FaTimes size={10} /> حذف ویدیو
                          </button>
                        </div>
                      )}

                      {videoPreview && !videoFile && !videoRemoved && (
                        <div style={styles.videoPreviewContainer}>
                          <video controls style={styles.videoPreviewPlayer}>
                            <source src={videoPreview} type="video/mp4" />
                            مرورگر شما ویدیو را پشتیبانی نمی‌کند
                          </video>
                          <button
                            type="button"
                            onClick={handleRemoveVideo}
                            style={styles.removeVideoBtn}
                            className="apf-remove-video"
                          >
                            <FaTimes size={10} /> حذف ویدیو
                          </button>
                        </div>
                      )}

                      {videoRemoved && (
                        <div style={styles.removedMessage}>
                          <FaTrashAlt style={styles.removedIcon} size={12} />
                          <span>ویدیو برای حذف علامت‌گذاری شد. برای اعمال، ذخیره کنید.</span>
                          <button
                            type="button"
                            onClick={() => {
                              setVideoRemoved(false);
                              if (currentPackage?.introduction_video) {
                                setVideoPreview(currentPackage.introduction_video);
                              }
                            }}
                            style={styles.undoBtn}
                            className="apf-undo-btn"
                          >
                            انصراف
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {showVideoUrlInput && (
                    <div style={styles.urlInputWrapper}>
                      <input
                        type="url"
                        name="introduction_video_url"
                        value={formData.introduction_video_url}
                        onChange={handleChange}
                        style={styles.input}
                        className="apf-input"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  )}
                </div>

                {/* Duration */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FaClock size={11} style={styles.fieldIcon} />
                    مدت زمان کل دوره
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    style={styles.input}
                    className="apf-input"
                    placeholder="مثال: ۱۰ ساعت و ۳۰ دقیقه"
                  />
                </div>

                {/* Features */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>ویژگی‌های دوره</label>
                  <div style={styles.tagsWrapper}>
                    <div style={styles.tagsInputWrapper}>
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={handleFeatureKeyPress}
                        style={styles.tagsInput}
                        className="apf-input"
                        placeholder="مثال: آموزش پروژه‌محور"
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        style={styles.addTagBtn}
                        className="apf-add-tag"
                      >
                        <FaPlus size={11} />
                      </button>
                    </div>
                    <div style={styles.tagsList}>
                      {formData.features.map((feature, index) => (
                        <span key={index} style={styles.tag}>
                          <FaCheckCircle style={styles.tagCheck} size={10} />
                          {feature}
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(index)}
                            style={styles.removeTagBtn}
                            className="apf-remove-tag"
                          >
                            <FaTimes size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ═══ PRICING ═══ */}
                <div style={styles.pricingSection}>
                  <h3 style={styles.sectionTitle}>
                    <FaDollarSign size={12} style={styles.fieldIcon} />
                    قیمت‌گذاری
                  </h3>

                  <div style={styles.formRow} className="apf-form-row">
                    <div style={styles.formGroup}>
                      <label style={styles.label}>قیمت اصلی (تومان)</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleNumberChange}
                        style={styles.input}
                        className="apf-input"
                        placeholder="۰"
                        disabled={formData.is_free}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>قیمت تخفیف‌خورده (تومان)</label>
                      <input
                        type="number"
                        name="discounted_price"
                        value={formData.discounted_price || ''}
                        onChange={handleNumberChange}
                        style={styles.input}
                        className="apf-input"
                        placeholder="بدون تخفیف"
                        disabled={formData.is_free}
                      />
                    </div>
                  </div>

                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="is_free"
                        checked={formData.is_free}
                        onChange={handleChange}
                        style={styles.checkbox}
                      />
                      <FaGift style={styles.checkboxIcon} size={13} />
                      دوره رایگان
                    </label>
                  </div>
                </div>

                {/* ═══ SPOTPLAYER ═══ */}
                <div style={styles.spotPlayerSection}>
                  <h3 style={styles.sectionTitle}>
                    <FaVideo size={12} style={styles.fieldIcon} />
                    تنظیمات اسپات پلیر
                  </h3>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      شناسه دوره در اسپات پلیر
                    </label>
                    <input
                      type="text"
                      name="spot_player_course_id"
                      value={formData.spot_player_course_id}
                      onChange={handleChange}
                      style={styles.input}
                      className="apf-input"
                      placeholder="مثال: 5f3a2b1c9d8e7f6a5b4c3d2e"
                      dir="ltr"
                    />
                    <span style={styles.helperText}>
                      این شناسه را از داشبورد اسپات پلیر بعد از ساخت دوره کپی کنید
                    </span>
                  </div>
                </div>

                {/* ═══ STATUS ═══ */}
                <div style={styles.statusSection}>
                  <div style={styles.formRow} className="apf-form-row">
                    <div style={styles.checkboxGroup}>
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          name="is_published"
                          checked={formData.is_published}
                          onChange={handleChange}
                          style={styles.checkbox}
                        />
                        <FaCheckCircle size={13} style={{ color: theme.colors.tintEmerald }} />
                        منتشر شده
                      </label>
                    </div>
                    <div style={styles.checkboxGroup}>
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          name="is_top"
                          checked={formData.is_top}
                          onChange={handleChange}
                          style={styles.checkbox}
                        />
                        <FaStar size={13} style={{ color: theme.colors.tintAmber }} />
                        دوره برتر
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══════════ TAB: TOPICS ═══════════ */}
            {activeTab === 'topics' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.tabContent}
              >
                <div style={styles.tagsHeader}>
                  <span style={styles.tagsCount}>
                    <FaBookOpen style={styles.tagsCountIcon} size={14} />
                    {formData.topics.length} سرفصل
                  </span>
                  <div style={styles.tagsInputWrapper}>
                    <input
                      type="text"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyPress={handleTopicKeyPress}
                      style={styles.tagsInput}
                      className="apf-input"
                      placeholder="عنوان سرفصل را وارد کنید..."
                    />
                    <button
                      type="button"
                      onClick={handleAddTopic}
                      style={styles.addTagBtn}
                      className="apf-add-tag"
                    >
                      <FaPlus size={11} />
                    </button>
                  </div>
                </div>

                <div style={styles.topicsList}>
                  {formData.topics.map((topic, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={styles.topicItem}
                      className="apf-topic-item"
                    >
                      <span style={styles.topicNumber}>#{index + 1}</span>
                      <span style={styles.topicTitle}>{topic}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(index)}
                        style={styles.removeTopicBtn}
                        className="apf-remove-topic"
                      >
                        <FaTrash size={11} />
                      </button>
                    </motion.div>
                  ))}
                </div>

                {formData.topics.length === 0 && (
                  <div style={styles.emptyTopics}>
                    <FaList style={styles.emptyTopicsIcon} />
                    <p>هنوز سرفصلی اضافه نشده است</p>
                    <p style={styles.emptyTopicsSub}>
                      با نوشتن عنوان و زدن دکمه + سرفصل جدید اضافه کنید
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══════════ TAB: CATEGORIES ═══════════ */}
            {activeTab === 'categories' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.tabContent}
              >
                <div style={styles.categoriesHeader}>
                  <span style={styles.categoriesTitle}>انتخاب دسته‌بندی‌ها</span>
                  <Link to="/adminpanel/m1/admin/categories" style={styles.manageCategoriesBtn} className="apf-manage-cats">
                    <FaTag size={10} /> مدیریت دسته‌بندی‌ها
                  </Link>
                </div>

                <div style={styles.categoriesGrid}>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => {
                      const isSelected = selectedCategoryIds.includes(category.id);
                      return (
                        <div
                          key={category.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCategoryIds((prev) =>
                                prev.filter((id) => id !== category.id)
                              );
                            } else {
                              setSelectedCategoryIds((prev) => [...prev, category.id]);
                            }
                          }}
                          style={{
                            ...styles.categoryCard,
                            ...(isSelected ? styles.categoryCardSelected : {}),
                          }}
                          className="apf-cat-card"
                        >
                          <span style={styles.categoryCardIcon}>📁</span>
                          <span style={styles.categoryCardName}>{category.name}</span>
                          {isSelected && (
                            <FaCheckCircle
                              style={styles.categoryCardCheck}
                              size={14}
                            />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div style={styles.emptyCategories}>
                      <p>هیچ دسته‌بندی وجود ندارد</p>
                      <Link to="/admin/categories" style={styles.emptyAddBtn}>
                        مدیریت دسته‌بندی‌ها
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══ SUBMIT ═══ */}
            <div style={styles.submitSection}>
              <button
                type="submit"
                style={styles.submitBtn}
                className="apf-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner style={styles.spinnerIcon} size={12} />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <FaSave size={12} />
                    {isEditMode ? 'به‌روزرسانی دوره' : 'ایجاد دوره'}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ═══ PREVIEW PANEL ═══ */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={styles.previewPanel}
                className="apf-preview"
              >
                <div style={styles.previewHeader}>
                  <h3 style={styles.previewTitle}>پیش‌نمایش زنده</h3>
                  <span style={styles.previewBadge}>زنده</span>
                </div>

                <div style={styles.previewContent}>
                  <div style={styles.previewCard}>
                    <div style={styles.previewImageWrapper}>
                      <PackageCover
                        src={
                          imagePreview && !imageRemoved
                            ? imagePreview
                            : formData.image && !imageRemoved
                            ? formData.image
                            : null
                        }
                        alt={previewData.title}
                        size="medium"
                        rounded="lg"
                      >
                        <div style={styles.previewBadges}>
                          {previewData.is_free && (
                            <span style={styles.previewFreeBadge}>رایگان</span>
                          )}
                          {previewData.has_discount && (
                            <span style={styles.previewDiscountBadge}>تخفیف</span>
                          )}
                          {previewData.is_top && (
                            <span style={styles.previewTopBadge}>برترین</span>
                          )}
                        </div>
                        <div style={styles.previewPrice}>
                          {previewData.original_price_str && (
                            <span style={styles.previewOriginalPrice}>
                              {previewData.original_price_str}
                            </span>
                          )}
                          <span style={styles.previewDisplayPrice}>
                            {previewData.display_price_str}
                          </span>
                        </div>
                      </PackageCover>
                    </div>

                    <div style={styles.previewBody}>
                      <h4 style={styles.previewTitleText}>
                        {previewData.title || 'عنوان دوره'}
                      </h4>
                      <p style={styles.previewDescription}>
                        {previewData.description || 'توضیحات دوره...'}
                      </p>

                      <div style={styles.previewMeta}>
                        {previewData.duration && (
                          <span style={styles.previewMetaItem}>
                            <FaClock size={9} /> {previewData.duration}
                          </span>
                        )}
                        <span style={styles.previewMetaItem}>
                          <FaUserGraduate size={9} />{' '}
                          {previewData.students_count || 0} دانشجو
                        </span>
                        <span style={styles.previewMetaItem}>
                          <FaBookOpen size={9} /> {previewData.topics_count || 0}{' '}
                          سرفصل
                        </span>
                      </div>

                      <div style={styles.previewFeatures}>
                        {previewData.feature_list.slice(0, 3).map((f, i) => (
                          <span key={i} style={styles.previewFeature}>
                            <FaCheckCircle
                              style={styles.previewFeatureCheck}
                              size={9}
                            />
                            {f}
                          </span>
                        ))}
                        {previewData.feature_list.length > 3 && (
                          <span style={styles.previewFeatureMore}>
                            +{previewData.feature_list.length - 3} بیشتر
                          </span>
                        )}
                      </div>

                      {previewData.introduction_video_url && (
                        <div style={styles.previewVideo}>
                          <FaYoutube
                            style={styles.previewVideoIcon}
                            size={11}
                          />
                          <span style={styles.previewVideoText}>
                            {previewData.introduction_video_url}
                          </span>
                        </div>
                      )}

                      <div style={styles.previewCategories}>
                        {previewData.categories.map((cat) => (
                          <span key={cat.id} style={styles.previewCategory}>
                            {cat.name}
                          </span>
                        ))}
                      </div>

                      <button style={styles.previewBtn} type="button">
                        مشاهده دوره <FaArrowRight size={9} />
                      </button>
                    </div>
                  </div>

                  <div style={styles.previewTopics}>
                    <h4 style={styles.previewTopicsTitle}>سرفصل‌ها</h4>
                    {previewData.topics_list.slice(0, 5).map((topic, i) => (
                      <div key={i} style={styles.previewTopicItem}>
                        <span style={styles.previewTopicNumber}>{i + 1}</span>
                        <span style={styles.previewTopicTitle}>{topic}</span>
                      </div>
                    ))}
                    {previewData.topics_list.length === 0 && (
                      <p style={styles.previewNoTopics}>
                        هنوز سرفصلی اضافه نشده
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
}

// ═══════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════

const styles = {
  container: {
    maxWidth: 1400,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    minWidth: 0,
  },

  // ═══ HEADER ═══
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: theme.colors.text,
    margin: 0,
    marginBottom: 4,
    letterSpacing: '-0.4px',
  },
  pageSubtitle: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  previewToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 15px',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    color: theme.colors.textMuted,
    cursor: 'pointer',
    fontSize: 12.5,
    fontWeight: 600,
    fontFamily: theme.font.family,
    transition: 'all 0.15s',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 15px',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    color: theme.colors.textMuted,
    cursor: 'pointer',
    fontSize: 12.5,
    fontWeight: 600,
    fontFamily: theme.font.family,
    textDecoration: 'none',
    transition: 'all 0.15s',
  },

  // ═══ TABS ═══
  tabs: {
    display: 'flex',
    gap: 4,
    background: theme.colors.surface,
    borderRadius: 12,
    padding: 5,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.xs,
    overflowX: 'auto',
  },
  tab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    borderRadius: 9,
    color: theme.colors.textSubtle,
    fontSize: 12.5,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: theme.font.family,
    whiteSpace: 'nowrap',
  },
  tabActive: {
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    color: '#FFFFFF',
    boxShadow: `0 4px 14px ${theme.colors.accentGlow}`,
  },

  // ═══ LAYOUT ═══
  formContainer: {
    display: 'flex',
    gap: 20,
    alignItems: 'flex-start',
  },
  form: {
    flex: 1,
    background: theme.colors.surface,
    borderRadius: 14,
    padding: 24,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.sm,
    minWidth: 0,
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },

  // ═══ FORM ELEMENTS ═══
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontSize: 12.5,
    fontWeight: 700,
    color: theme.colors.textMuted,
  },
  fieldIcon: {
    fontSize: 13,
    color: theme.colors.accent,
  },
  input: {
    padding: '10px 14px',
    background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: theme.font.family,
    transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  textarea: {
    padding: '10px 14px',
    background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: theme.font.family,
    resize: 'vertical',
    transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    lineHeight: 1.7,
  },

  // ═══ UPLOAD ═══
  uploadToggle: {
    display: 'flex',
    gap: 8,
    marginBottom: 8,
  },
  toggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 14px',
    background: theme.colors.accentSoft,
    border: `1px solid ${theme.colors.accentBorder}`,
    borderRadius: 8,
    color: theme.colors.accent,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
    fontFamily: theme.font.family,
    transition: 'all 0.15s',
  },
  imageUploadArea: {
    padding: 20,
    border: `2px dashed ${theme.colors.border}`,
    borderRadius: 12,
    background: theme.colors.surfaceAlt,
    minHeight: 140,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 0.15s, background 0.15s',
  },
  imageInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    top: 0,
    left: 0,
  },
  imageUploadLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    color: theme.colors.textSubtle,
    fontSize: 13,
    fontWeight: 600,
    padding: 20,
  },
  uploadBtnWrapper: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    cursor: 'pointer',
    zIndex: 1,
  },
  uploadIcon: {
    fontSize: 32,
    color: theme.colors.accent,
  },
  uploadHint: {
    fontSize: 11.5,
    color: theme.colors.textFaint,
    fontWeight: 500,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: 320,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 12,
    zIndex: 5,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.sm,
  },
  imagePreviewImg: {
    width: '100%',
    height: 180,
    objectFit: 'cover',
    display: 'block',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'rgba(220, 38, 38, 0.9)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transition: 'all 0.15s',
  },
  urlInputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },

  // ═══ VIDEO ═══
  videoUploadArea: {
    padding: 20,
    border: `2px dashed ${theme.colors.border}`,
    borderRadius: 12,
    background: theme.colors.surfaceAlt,
    minHeight: 100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 0.15s, background 0.15s',
  },
  videoInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    top: 0,
    left: 0,
  },
  videoUploadLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    color: theme.colors.textSubtle,
    fontSize: 13,
    fontWeight: 600,
    padding: 20,
  },
  videoPreviewContainer: {
    position: 'relative',
    width: '100%',
    marginTop: 12,
    padding: 12,
    background: theme.colors.surface,
    borderRadius: 10,
    border: `1px solid ${theme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    zIndex: 5,
  },
  videoPreviewPlayer: {
    width: '100%',
    maxHeight: 220,
    borderRadius: 8,
    background: '#0a0a0a',
  },
  videoFileName: {
    fontSize: 12.5,
    color: theme.colors.accent,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  removeVideoBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '8px 14px',
    background: theme.colors.dangerSoft,
    border: `1px solid ${theme.colors.danger}30`,
    borderRadius: 8,
    color: theme.colors.danger,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
    fontFamily: theme.font.family,
    transition: 'all 0.15s',
    alignSelf: 'flex-start',
    position: 'relative',
    zIndex: 10,
  },

  // ═══ REMOVED MESSAGE ═══
  removedMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    background: theme.colors.dangerSoft,
    border: `1px solid ${theme.colors.danger}30`,
    borderRadius: 10,
    marginTop: 12,
    flexWrap: 'wrap',
    position: 'relative',
    zIndex: 10,
    fontSize: 12.5,
    color: theme.colors.text,
  },
  removedIcon: {
    color: theme.colors.danger,
    fontSize: 12,
  },
  undoBtn: {
    marginRight: 'auto',
    padding: '5px 12px',
    background: 'transparent',
    border: `1px solid ${theme.colors.danger}50`,
    borderRadius: 6,
    color: theme.colors.danger,
    cursor: 'pointer',
    fontSize: 11.5,
    fontWeight: 700,
    fontFamily: theme.font.family,
    transition: 'all 0.15s',
  },

  // ═══ TAGS ═══
  tagsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  tagsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  tagsCount: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 700,
    color: theme.colors.text,
  },
  tagsCountIcon: {
    color: theme.colors.accent,
    fontSize: 14,
  },
  tagsInputWrapper: {
    display: 'flex',
    gap: 8,
    flex: 1,
    minWidth: 220,
  },
  tagsInput: {
    flex: 1,
    padding: '10px 14px',
    background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: theme.font.family,
    transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  addTagBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    border: 'none',
    borderRadius: 10,
    color: '#FFFFFF',
    cursor: 'pointer',
    fontSize: 13,
    transition: 'all 0.15s',
    boxShadow: `0 4px 14px ${theme.colors.accentGlow}`,
    flexShrink: 0,
  },
  tagsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: theme.colors.accentSoft,
    border: `1px solid ${theme.colors.accentBorder}`,
    borderRadius: 8,
    fontSize: 12.5,
    fontWeight: 600,
    color: theme.colors.text,
  },
  tagCheck: {
    color: theme.colors.accent,
    fontSize: 10,
  },
  removeTagBtn: {
    background: 'none',
    border: 'none',
    color: theme.colors.textFaint,
    cursor: 'pointer',
    padding: '0 4px',
    fontSize: 10,
    transition: 'color 0.15s',
  },

  // ═══ TOPICS ═══
  topicsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxHeight: 420,
    overflowY: 'auto',
    paddingLeft: 4,
  },
  topicItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: theme.colors.surfaceAlt,
    borderRadius: 10,
    border: `1px solid ${theme.colors.border}`,
    transition: 'all 0.15s',
  },
  topicNumber: {
    fontSize: 12.5,
    fontWeight: 800,
    color: theme.colors.accent,
    minWidth: 40,
    fontVariantNumeric: 'tabular-nums',
  },
  topicTitle: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: 500,
  },
  removeTopicBtn: {
    background: 'none',
    border: 'none',
    color: theme.colors.textFaint,
    cursor: 'pointer',
    fontSize: 12,
    padding: 4,
    transition: 'color 0.15s',
  },
  emptyTopics: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px 20px',
    color: theme.colors.textFaint,
    textAlign: 'center',
  },
  emptyTopicsIcon: {
    fontSize: 44,
    color: theme.colors.border,
    marginBottom: 12,
  },
  emptyTopicsSub: {
    fontSize: 12,
    color: theme.colors.textFaint,
    marginTop: 6,
  },

  // ═══ PRICING ═══
  pricingSection: {
    padding: 20,
    background: `${theme.colors.accentSoft}50`,
    borderRadius: 12,
    border: `1px solid ${theme.colors.accentBorder}50`,
  },
  sectionTitle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 700,
    color: theme.colors.text,
    marginTop: 0,
    marginBottom: 16,
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 10,
  },
  checkboxLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    color: theme.colors.textMuted,
  },
  checkbox: {
    width: 18,
    height: 18,
    accentColor: theme.colors.accent,
    cursor: 'pointer',
  },
  checkboxIcon: {
    fontSize: 13,
    color: theme.colors.success,
  },

  // ═══ SPOTPLAYER ═══
  spotPlayerSection: {
    padding: 20,
    background: `${theme.colors.tintVioletSoft}50`,
    borderRadius: 12,
    border: `1px solid ${theme.colors.tintViolet}30`,
  },
  helperText: {
    fontSize: 11.5,
    color: theme.colors.textSubtle,
    marginTop: 6,
    lineHeight: 1.6,
  },

  // ═══ STATUS ═══
  statusSection: {
    paddingTop: 16,
    borderTop: `1px solid ${theme.colors.border}`,
    marginTop: 8,
  },

  // ═══ CATEGORIES ═══
  categoriesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.colors.text,
  },
  manageCategoriesBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    background: theme.colors.accentSoft,
    border: `1px solid ${theme.colors.accentBorder}`,
    borderRadius: 8,
    color: theme.colors.accent,
    textDecoration: 'none',
    fontSize: 12.5,
    fontWeight: 600,
    fontFamily: theme.font.family,
    transition: 'all 0.15s',
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 10,
  },
  categoryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    background: theme.colors.surfaceAlt,
    borderRadius: 10,
    border: `1px solid ${theme.colors.border}`,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  categoryCardSelected: {
    background: theme.colors.accentSoft,
    borderColor: theme.colors.accent,
  },
  categoryCardIcon: {
    fontSize: 18,
  },
  categoryCardName: {
    flex: 1,
    fontSize: 13,
    fontWeight: 600,
    color: theme.colors.text,
  },
  categoryCardCheck: {
    color: theme.colors.accent,
    fontSize: 14,
  },
  emptyCategories: {
    textAlign: 'center',
    padding: '40px 20px',
    color: theme.colors.textSubtle,
  },
  emptyAddBtn: {
    display: 'inline-block',
    marginTop: 12,
    padding: '8px 18px',
    background: theme.colors.accentSoft,
    border: `1px solid ${theme.colors.accentBorder}`,
    borderRadius: 8,
    color: theme.colors.accent,
    textDecoration: 'none',
    fontSize: 12.5,
    fontWeight: 600,
    fontFamily: theme.font.family,
  },

  // ═══ SUBMIT ═══
  submitSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTop: `1px solid ${theme.colors.border}`,
  },
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '14px',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s',
    boxShadow: `0 4px 14px ${theme.colors.accentGlow}`,
    fontFamily: theme.font.family,
  },
  spinnerIcon: {
    animation: 'spin 1s linear infinite',
  },

  // ═══ PREVIEW ═══
  previewPanel: {
    width: 400,
    flexShrink: 0,
    background: theme.colors.surface,
    borderRadius: 14,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.sm,
    maxHeight: 'calc(100vh - 200px)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.colors.text,
    margin: 0,
  },
  previewBadge: {
    fontSize: 10.5,
    fontWeight: 700,
    color: theme.colors.success,
    background: theme.colors.successSoft,
    padding: '3px 10px',
    borderRadius: 999,
  },
  previewContent: {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  previewCard: {
    background: theme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.xs,
  },
  previewImageWrapper: {
    position: 'relative',
    width: '100%',
    marginBottom: 4,
  },
  previewBadges: {
    position: 'absolute',
    top: 10,
    right: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  previewFreeBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 10px',
    background: theme.colors.success,
    color: 'white',
    borderRadius: 999,
  },
  previewDiscountBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 10px',
    background: theme.colors.danger,
    color: 'white',
    borderRadius: 999,
  },
  previewTopBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 10px',
    background: theme.colors.tintAmber,
    color: 'white',
    borderRadius: 999,
  },
  previewPrice: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
  },
  previewOriginalPrice: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'line-through',
  },
  previewDisplayPrice: {
    fontSize: 13,
    fontWeight: 800,
    color: 'white',
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    padding: '3px 10px',
    borderRadius: 6,
  },
  previewBody: {
    padding: 14,
  },
  previewTitleText: {
    fontSize: 15,
    fontWeight: 700,
    color: theme.colors.text,
    marginTop: 0,
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    lineHeight: 1.6,
    marginBottom: 10,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  previewMeta: {
    display: 'flex',
    gap: 12,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  previewMetaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    color: theme.colors.textFaint,
    fontWeight: 500,
  },
  previewFeatures: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  previewFeature: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 10.5,
    color: theme.colors.textMuted,
    padding: '3px 8px',
    background: theme.colors.accentSoft,
    borderRadius: 4,
    fontWeight: 500,
  },
  previewFeatureCheck: {
    fontSize: 9,
    color: theme.colors.accent,
  },
  previewFeatureMore: {
    fontSize: 10.5,
    color: theme.colors.textFaint,
    padding: '3px 8px',
  },
  previewVideo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    background: theme.colors.dangerSoft,
    borderRadius: 6,
    border: `1px solid ${theme.colors.danger}20`,
    marginBottom: 10,
  },
  previewVideoIcon: {
    color: theme.colors.danger,
    fontSize: 11,
    flexShrink: 0,
  },
  previewVideoText: {
    fontSize: 10.5,
    color: theme.colors.textMuted,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  previewCategories: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  previewCategory: {
    fontSize: 10,
    padding: '3px 8px',
    background: theme.colors.surfaceAlt,
    borderRadius: 4,
    color: theme.colors.textMuted,
    fontWeight: 600,
  },
  previewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '8px',
    background: theme.colors.accentSoft,
    border: `1px solid ${theme.colors.accentBorder}`,
    borderRadius: 8,
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'default',
    fontFamily: theme.font.family,
  },
  previewTopics: {
    background: theme.colors.surfaceAlt,
    borderRadius: 10,
    padding: 12,
  },
  previewTopicsTitle: {
    fontSize: 12.5,
    fontWeight: 700,
    color: theme.colors.text,
    marginTop: 0,
    marginBottom: 8,
  },
  previewTopicItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '5px 0',
    borderBottom: `1px solid ${theme.colors.border}`,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  previewTopicNumber: {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.colors.accentSoft,
    borderRadius: '50%',
    fontSize: 10,
    fontWeight: 700,
    color: theme.colors.accent,
    flexShrink: 0,
  },
  previewTopicTitle: {
    flex: 1,
  },
  previewNoTopics: {
    fontSize: 12,
    color: theme.colors.textFaint,
    textAlign: 'center',
    padding: '10px 0',
    margin: 0,
  },

  // ═══ LOADING ═══
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  spinner: {
    width: 36,
    height: 36,
    border: `3px solid ${theme.colors.border}`,
    borderTop: `3px solid ${theme.colors.accent}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// ═══════════════════════════════════════════════════════
// STYLES INJECTION
// ═══════════════════════════════════════════════════════

if (typeof document !== 'undefined' && !document.getElementById('admin-package-form-styles')) {
  const style = document.createElement('style');
  style.id = 'admin-package-form-styles';
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Input focus states */
    .apf-input:focus {
      border-color: ${theme.colors.accent} !important;
      background: ${theme.colors.surface} !important;
      box-shadow: 0 0 0 3px ${theme.colors.accent}15;
    }

    /* Hover states */
    .apf-header .apf-preview-toggle:hover,
    .apf-back-btn:hover {
      background: ${theme.colors.surfaceAlt} !important;
      color: ${theme.colors.text} !important;
      border-color: ${theme.colors.borderStrong} !important;
    }

    .apf-toggle-btn:hover {
      background: ${theme.colors.accent} !important;
      color: #FFFFFF !important;
      transform: translateY(-1px);
    }

    .apf-upload-area:hover {
      border-color: ${theme.colors.accentBorder} !important;
      background: ${theme.colors.accentSoft}30 !important;
    }

    .apf-add-tag:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 22px ${theme.colors.accentGlow} !important;
    }

    .apf-remove-img:hover {
      background: rgba(220, 38, 38, 1) !important;
      transform: scale(1.05);
    }

    .apf-remove-video:hover,
    .apf-undo-btn:hover {
      filter: brightness(0.95);
    }

    .apf-remove-tag:hover,
    .apf-remove-topic:hover {
      color: ${theme.colors.danger} !important;
    }

    .apf-topic-item:hover {
      background: ${theme.colors.surface} !important;
      border-color: ${theme.colors.accentBorder} !important;
    }

    .apf-cat-card:hover {
      border-color: ${theme.colors.accentBorder} !important;
      background: ${theme.colors.accentSoft}40 !important;
    }

    .apf-manage-cats:hover {
      background: ${theme.colors.accent} !important;
      color: #FFFFFF !important;
    }

    .apf-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px ${theme.colors.accentGlow} !important;
    }
    .apf-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    /* ══════════ RESPONSIVE ══════════ */
    @media (max-width: 1200px) {
      .apf-preview {
        width: 340px !important;
      }
    }

    @media (max-width: 1024px) {
      .apf-form-container {
        flex-direction: column !important;
      }
      .apf-preview {
        width: 100% !important;
        max-height: 500px !important;
      }
    }

    @media (max-width: 768px) {
      .apf-form-row {
        grid-template-columns: 1fr !important;
      }
      .apf-header {
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .apf-header > div:last-child {
        width: 100% !important;
      }
      .apf-preview-toggle,
      .apf-back-btn {
        flex: 1 !important;
        justify-content: center !important;
      }
      .apf-tabs {
        flex-wrap: nowrap !important;
        overflow-x: auto !important;
      }
    }

    @media (max-width: 480px) {
      .apf-tab span {
        display: none !important;
      }
      .apf-tab {
        padding: 10px 14px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default AdminPackageForm;