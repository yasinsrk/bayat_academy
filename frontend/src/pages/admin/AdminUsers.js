// src/pages/admin/AdminUsers.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
  FaUserCheck, FaUserTimes, FaUserShield,
  FaEnvelope, FaPhone, FaEye, FaEdit, FaTrash,
  FaUserPlus, FaCheckCircle, FaTimesCircle, FaInfoCircle,
  FaUserCircle, FaCalendar, FaBookOpen, FaShoppingBag,
  FaArrowUp, FaArrowDown, FaUsers,
} from 'react-icons/fa';
import AdminLayout from './AdminLayout';
import SavedViewsBar from '../../components/SavedViewsBar';
import ExportMenu from '../../components/ExportMenu';
import BulkActionsBar from '../../components/BulkActionsBar';
import ColumnToggle, { useColumnPrefs } from '../../components/ColumnToggle';
import { toast } from 'react-toastify';
import axios from 'axios';
import theme from '../../styles/adminTheme';
import { formatJalali, formatJalaliDateTime } from '../../utils/jalali';

const API_URL = '/api';

const COLUMNS = [
  { key: 'user',     label: 'کاربر', always: true },
  { key: 'contact',  label: 'تماس' },
  { key: 'role',     label: 'نقش' },
  { key: 'status',   label: 'وضعیت' },
  { key: 'packages', label: 'دوره‌ها' },
  { key: 'joined',   label: 'تاریخ عضویت' },
  { key: 'actions',  label: 'عملیات', always: true },
];

function AdminUsers() {
  const { user: currentUser } = useSelector((s) => s.auth);

  // ── Data ──
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Filters ──
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  // ── Table ──
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', bio: '',
  });
  const itemsPerPage = 10;

  // ── Bulk ──
  const [selectedIds, setSelectedIds] = useState([]);

  // ── Column toggle ──
  const [visibleCols, setVisibleCols] = useColumnPrefs('users.columns', {
    user: true,
    contact: true,
    role: true,
    status: true,
    packages: true,
    joined: true,
    actions: true,
  });

  // ── Fetch ──
  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { if (users.length > 0) applyFilters(); },
    // eslint-disable-next-line
    [users, searchTerm, filterStatus, filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/accounts/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = [];
      if (res.data?.results) data = res.data.results;
      else if (Array.isArray(res.data)) data = res.data;
      setUsers(data);
      setFilteredUsers(data);
    } catch (e) {
      console.error(e);
      toast.error('خطا در دریافت لیست کاربران');
      setUsers([]); setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let data = Array.isArray(users) ? [...users] : [];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter((u) =>
        (u.full_name || '').toLowerCase().includes(term) ||
        (u.username || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term) ||
        (u.phone || '').includes(term)
      );
    }

    if (filterStatus !== 'all') {
      data = data.filter((u) =>
        filterStatus === 'active' ? u.is_active : !u.is_active
      );
    }

      if (filterRole !== 'all') {
      data = data.filter((u) => {
        if (filterRole === 'admin') return u.is_superuser === true;
        if (filterRole === 'user') return !u.is_superuser;
        return true;
      });
    }
    setFilteredUsers(data);
    setCurrentPage(1);
  };

  // ── Stats ──
    const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    inactive: users.filter((u) => !u.is_active).length,
    admins: users.filter((u) => u.is_superuser).length,
    totalPurchases: users.reduce((sum, u) => sum + (u.packages_count || 0), 0),
  }), [users]);

  // ── Pagination ──
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentItems = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ── Bulk helpers ──
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allIds = currentItems.map((u) => u.id);
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const bulkActivate = async (ids) => {
    const token = localStorage.getItem('access_token');
    await axios.post(`${API_URL}/accounts/bulk/activate/`, { ids },
      { headers: { Authorization: `Bearer ${token}` } });
  };
  const bulkDeactivate = async (ids) => {
    const token = localStorage.getItem('access_token');
    await axios.post(`${API_URL}/accounts/bulk/deactivate/`, { ids },
      { headers: { Authorization: `Bearer ${token}` } });
  };
  const bulkDelete = async (ids) => {
    const token = localStorage.getItem('access_token');
    await axios.post(`${API_URL}/accounts/bulk/delete/`, { ids },
      { headers: { Authorization: `Bearer ${token}` } });
  };

  // ── Single actions ──
  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      const u = users.find((x) => x.id === id);
      await axios.patch(`${API_URL}/accounts/users/${id}/toggle_status/`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`کاربر ${!u.is_active ? 'فعال' : 'غیرفعال'} شد`);
      fetchUsers();
    } catch {
      toast.error('خطا در تغییر وضعیت');
    }
  };

  const handleDeleteUser = async (id) => {
    const u = users.find((x) => x.id === id);
    if (!window.confirm(`حذف «${u?.full_name || u?.username}»؟ این عمل قابل بازگشت نیست.`)) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_URL}/accounts/users/${id}/`,
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('کاربر حذف شد');
      fetchUsers();
    } catch {
      toast.error('خطا در حذف کاربر');
    }
  };

  const handleEditUser = (u) => {
    setSelectedUser(u);
    setEditFormData({
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      email: u.email || '',
      phone: u.phone || '',
      bio: u.bio || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(`${API_URL}/accounts/users/${selectedUser.id}/`, editFormData,
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('اطلاعات کاربر به‌روز شد');
      setShowEditModal(false);
      fetchUsers();
    } catch {
      toast.error('خطا در به‌روزرسانی');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Badges ──
  const getStatusBadge = (u) => u.is_active
    ? { label: 'فعال', color: theme.colors.success, bg: theme.colors.successSoft, icon: FaUserCheck }
    : { label: 'غیرفعال', color: theme.colors.danger, bg: theme.colors.dangerSoft, icon: FaUserTimes };

  const getRoleBadge = (u) => {
    if (u.is_superuser) return { label: 'ادمین', color: theme.colors.accent, bg: theme.colors.accentSoft, icon: FaUserShield };
    return { label: 'کاربر', color: theme.colors.tintEmerald, bg: theme.colors.tintEmeraldSoft, icon: FaUsers };
  };

  // ── Export ──
  const exportData = useMemo(() => filteredUsers.map((u) => ({
    'نام': u.full_name || u.username,
    'یوزرنیم': u.username,
    'ایمیل': u.email || '—',
    'شماره': u.phone || '—',
    'نقش': getRoleBadge(u).label,
    'وضعیت': getStatusBadge(u).label,
    'دوره‌ها': u.packages_count || 0,
    'تاریخ عضویت': u.date_joined,
  })), [filteredUsers]);

  if (loading) {
    return (
      <AdminLayout>
        <UserSkeleton />
      </AdminLayout>
    );
  }

  const allOnPageSelected =
    currentItems.length > 0 && currentItems.every((u) => selectedIds.includes(u.id));

  return (
    <AdminLayout>
      <div style={S.container}>

        {/* HEADER */}
        <div style={S.pageHeader} className="users-page-header">
          <div>
            <h1 style={S.pageTitle}>مدیریت کاربران</h1>
            <p style={S.pageSubtitle}>مدیریت و مشاهده کاربران سیستم</p>
          </div>
          <div style={S.headerActions}>
            <ColumnToggle
              storageKey="users.columns"
              columns={COLUMNS}
              visible={visibleCols}
              onChange={setVisibleCols}
            />
            <ExportMenu
              data={exportData}
              filename="users"
              title="گزارش کاربران"
            />
          </div>
        </div>

        {/* STATS */}
        <div style={S.statsGrid} className="users-stats-grid">
          <StatCard icon={FaUsers} label="کل کاربران" value={stats.total}
            color={theme.colors.tintIndigo} soft={theme.colors.tintIndigoSoft} />
          <StatCard icon={FaUserCheck} label="فعال" value={stats.active}
            color={theme.colors.tintEmerald} soft={theme.colors.tintEmeraldSoft} />
          <StatCard icon={FaUserTimes} label="غیرفعال" value={stats.inactive}
            color={theme.colors.danger} soft={theme.colors.dangerSoft} />
        </div>

        {/* SAVED VIEWS */}
        <SavedViewsBar
          page="users"
          currentFilters={{
            status: filterStatus,
            role: filterRole,
            search: searchTerm,
          }}
          onApply={(f) => {
            if (f.status !== undefined) setFilterStatus(f.status);
            if (f.role !== undefined) setFilterRole(f.role);
            if (f.search !== undefined) setSearchTerm(f.search);
          }}
        />

        {/* FILTERS */}
        <div style={S.filtersCard} className="users-filters-card">
          <div style={S.filtersRow} className="users-filters-row">
            <div style={S.searchWrapper}>
              <FaSearch size={11} style={S.searchIcon} />
              <input
                type="text"
                placeholder="جستجوی نام، یوزرنیم، ایمیل، شماره..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={S.searchInput}
              />
            </div>

            <div style={S.filterWrapper}>
              <FaFilter size={10} style={S.filterIcon} />
              <select value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={S.filterSelect}>
                <option value="all">همه وضعیت‌ها</option>
                <option value="active">فعال</option>
                <option value="inactive">غیرفعال</option>
              </select>
            </div>

            <div style={S.filterWrapper}>
              <FaUserShield size={10} style={S.filterIcon} />
              <select value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      style={S.filterSelect}>
                <option value="all">همه نقش‌ها</option>
                <option value="admin">ادمین</option>
                <option value="user">کاربر</option>
              </select>
            </div>
          </div>

          <div style={S.filtersMeta}>
            <span style={S.filtersCount}>
              {filteredUsers.length.toLocaleString('fa-IR')} کاربر
            </span>
            {(filterStatus !== 'all' || filterRole !== 'all' || searchTerm) && (
                <button
                    onClick={() => {
                  setSearchTerm(''); setFilterStatus('all'); setFilterRole('all');
                }}
                style={S.clearBtn}
                className="users-clear-btn"
              >
                پاک کردن فیلترها
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div style={S.tableCard} className="users-table-card">
          {currentItems.length === 0 ? (
            <div style={S.empty}>
              <div style={S.emptyIconWrap}>
                <FaUsers size={22} color={theme.colors.textFaint} />
              </div>
              <h4 style={S.emptyTitle}>هیچ کاربری یافت نشد</h4>
              <p style={S.emptyDesc}>فیلترها را تغییر دهید یا کاربر جدیدی ثبت‌نام کند.</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div style={S.tableWrap} className="users-desktop-table">
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={{ ...S.th, width: 42 }}>
                        <input type="checkbox" checked={allOnPageSelected}
                          onChange={toggleSelectAll} style={S.checkbox} />
                      </th>
                      {visibleCols.user && <th style={S.th}>کاربر</th>}
                      {visibleCols.contact && <th style={S.th}>تماس</th>}
                      {visibleCols.role && <th style={S.th}>نقش</th>}
                      {visibleCols.status && <th style={S.th}>وضعیت</th>}
                      {visibleCols.packages && <th style={S.th}>دوره‌ها</th>}
                      {visibleCols.joined && <th style={S.th}>تاریخ عضویت</th>}
                      {visibleCols.actions && <th style={S.th}></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((u) => {
                      const status = getStatusBadge(u);
                      const role = getRoleBadge(u);
                      const StatusIcon = status.icon;
                      const RoleIcon = role.icon;
                      const isSelected = selectedIds.includes(u.id);
                      return (
                        <tr key={u.id}
                          style={{ ...S.tr, ...(isSelected ? S.trSelected : {}) }}
                          className="users-row">
                          <td style={{ ...S.td, width: 42 }}>
                            <input type="checkbox" checked={isSelected}
                              onChange={() => toggleSelect(u.id)} style={S.checkbox} />
                          </td>
                          {visibleCols.user && (
                            <td style={S.td}>
                              <div style={S.userCell}>
                                <div style={S.userAvatar}>
                                  {u.full_name?.charAt(0) || u.username?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <div style={S.userName}>{u.full_name || u.username}</div>
                                  <div style={S.userUsername}>@{u.username}</div>
                                </div>
                              </div>
                            </td>
                          )}
                          {visibleCols.contact && (
                            <td style={S.td}>
                              <div style={S.contactCell}>
                                {u.email && (
                                  <div style={S.contactRow}>
                                    <FaEnvelope size={9} color={theme.colors.textFaint} />
                                    <span>{u.email}</span>
                                  </div>
                                )}
                                {u.phone && (
                                  <div style={S.contactRow}>
                                    <FaPhone size={9} color={theme.colors.textFaint} />
                                    <span>{u.phone}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          )}
                          {visibleCols.role && (
                            <td style={S.td}>
                              <span style={{ ...S.pill, background: role.bg, color: role.color }}>
                                <RoleIcon size={10} />
                                {role.label}
                              </span>
                            </td>
                          )}
                          {visibleCols.status && (
                            <td style={S.td}>
                              <button onClick={() => handleToggleStatus(u.id)}
                                style={{ ...S.pill, background: status.bg, color: status.color,
                                  border: 'none', cursor: 'pointer' }}>
                                <StatusIcon size={10} />
                                {status.label}
                              </button>
                            </td>
                          )}
                          {visibleCols.packages && (
                            <td style={S.td}>
                              <span style={S.pkgCount}>{u.packages_count || 0}</span>
                            </td>
                          )}
                          {visibleCols.joined && (
                            <td style={{ ...S.td, color: theme.colors.textSubtle }}>
                              {formatJalali(u.date_joined)}
                            </td>
                          )}
                          {visibleCols.actions && (
                            <td style={S.td}>
                              <div style={S.actionsGroup}>
                                <button onClick={() => { setSelectedUser(u); setShowDetailModal(true); }}
                                  style={S.rowAction} className="users-row-action" title="جزییات">
                                  <FaEye size={11} />
                                </button>
                                <button onClick={() => handleEditUser(u)}
                                  style={S.rowAction} className="users-row-action" title="ویرایش">
                                  <FaEdit size={11} />
                                </button>
                                <button onClick={() => handleDeleteUser(u.id)}
                                  style={{ ...S.rowAction, color: theme.colors.danger }}
                                  className="users-row-action-danger" title="حذف">
                                  <FaTrash size={11} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="users-mobile-cards">
                {currentItems.map((u) => {
                  const status = getStatusBadge(u);
                  const role = getRoleBadge(u);
                  const isSelected = selectedIds.includes(u.id);
                  return (
                    <div key={u.id} style={{
                      ...S.mobileCard,
                      ...(isSelected ? S.mobileCardSelected : {}),
                    }}>
                      <div style={S.mobileCheckRow}>
                        <input type="checkbox" checked={isSelected}
                          onChange={() => toggleSelect(u.id)} style={S.checkbox} />
                        <span style={S.mobileSelectedLabel}>انتخاب</span>
                      </div>
                      <div style={S.mobileTop}>
                        <div style={S.userCell}>
                          <div style={S.userAvatar}>
                            {u.full_name?.charAt(0) || u.username?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div style={S.userName}>{u.full_name || u.username}</div>
                            <div style={S.userUsername}>@{u.username}</div>
                          </div>
                        </div>
                        <span style={{ ...S.pill, background: role.bg, color: role.color }}>
                          {role.label}
                        </span>
                      </div>
                      <div style={S.mobileRow}>
                        <span style={S.mobileLabel}>وضعیت</span>
                        <span style={{ ...S.pill, background: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </div>
                      {u.email && (
                        <div style={S.mobileRow}>
                          <span style={S.mobileLabel}>ایمیل</span>
                          <span style={S.mobileValue}>{u.email}</span>
                        </div>
                      )}
                      <div style={S.mobileActions}>
                        <button onClick={() => { setSelectedUser(u); setShowDetailModal(true); }}
                          style={S.mobileActionBtn}>
                          <FaEye size={10} /> مشاهده
                        </button>
                        <button onClick={() => handleEditUser(u)}
                          style={S.mobileActionBtn}>
                          <FaEdit size={10} /> ویرایش
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={S.pagination}>
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={S.pageBtn} className="users-page-btn">
                    <FaChevronRight size={10} />
                  </button>
                  <span style={S.pageInfo}>
                    صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
                  </span>
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={S.pageBtn} className="users-page-btn">
                    <FaChevronLeft size={10} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* DETAIL MODAL */}
      {showDetailModal && selectedUser && (
        <div style={S.modalBackdrop} onClick={() => setShowDetailModal(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>جزییات کاربر</h3>
              <button onClick={() => setShowDetailModal(false)} style={S.modalClose}>×</button>
            </div>

            <div style={S.modalBody}>
              <div style={S.modalProfile}>
                <div style={S.modalAvatar}>
                  {selectedUser.full_name?.charAt(0) || selectedUser.username?.charAt(0) || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={S.modalName}>{selectedUser.full_name || selectedUser.username}</div>
                  <div style={S.modalUsername}>@{selectedUser.username}</div>
                  <div style={S.modalBadges}>
                    <span style={{ ...S.pill, background: getStatusBadge(selectedUser).bg,
                      color: getStatusBadge(selectedUser).color }}>
                      {getStatusBadge(selectedUser).label}
                    </span>
                    <span style={{ ...S.pill, background: getRoleBadge(selectedUser).bg,
                      color: getRoleBadge(selectedUser).color }}>
                      {getRoleBadge(selectedUser).label}
                    </span>
                  </div>
                </div>
              </div>

              <DetailRow icon={FaEnvelope} label="ایمیل" value={selectedUser.email || '—'} />
              <DetailRow icon={FaPhone} label="شماره موبایل" value={selectedUser.phone || '—'} />
              <DetailRow icon={FaCalendar} label="تاریخ عضویت"
                value={formatJalaliDateTime(selectedUser.date_joined)} />
              {selectedUser.last_login && (
                <DetailRow icon={FaCalendar} label="آخرین ورود"
                  value={formatJalaliDateTime(selectedUser.last_login)} />
              )}
              <DetailRow icon={FaBookOpen} label="تعداد دوره‌ها"
                value={selectedUser.packages_count || 0} />
              <DetailRow icon={FaShoppingBag} label="مجموع خرید"
                value={`${(selectedUser.total_spent || 0).toLocaleString('fa-IR')} تومان`} />

              {selectedUser.bio && (
                <div style={S.bioBox}>
                  <div style={S.bioLabel}>بیوگرافی</div>
                  <p style={S.bioText}>{selectedUser.bio}</p>
                </div>
              )}
            </div>

            <div style={S.modalFooter}>
              <button onClick={() => {
                setShowDetailModal(false);
                handleEditUser(selectedUser);
              }} style={S.modalEditBtn}>
                <FaEdit size={11} /> ویرایش
              </button>
              <button onClick={() => setShowDetailModal(false)} style={S.modalCloseBtn}>
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedUser && (
        <div style={S.modalBackdrop} onClick={() => setShowEditModal(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>ویرایش کاربر</h3>
              <button onClick={() => setShowEditModal(false)} style={S.modalClose}>×</button>
            </div>

            <div style={S.modalBody}>
              <div style={S.formRow}>
                <div style={S.formGroup}>
                  <label style={S.label}>نام</label>
                  <input type="text" value={editFormData.first_name}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                    style={S.input} placeholder="نام" />
                </div>
                <div style={S.formGroup}>
                  <label style={S.label}>نام خانوادگی</label>
                  <input type="text" value={editFormData.last_name}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                    style={S.input} placeholder="نام خانوادگی" />
                </div>
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>ایمیل</label>
                <input type="email" value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  style={S.input} placeholder="ایمیل" />
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>شماره موبایل</label>
                <input type="tel" value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  style={S.input} placeholder="۰۹۱۲۳۴۵۶۷۸۹" />
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>بیوگرافی</label>
                <textarea value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  style={S.textarea} placeholder="درباره کاربر..." rows="3" />
              </div>
            </div>

            <div style={S.modalFooter}>
              <button onClick={() => setShowEditModal(false)} style={S.modalCloseBtn}>
                انصراف
              </button>
              <button onClick={handleSaveEdit} style={S.modalSaveBtn} disabled={isSubmitting}>
                <FaCheckCircle size={11} />
                {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK ACTIONS */}
      <BulkActionsBar
        selectedIds={selectedIds}
        onClear={clearSelection}
        resourceName="کاربر"
        onRefresh={fetchUsers}
        actions={[
          { key: 'activate', label: 'فعال‌سازی', icon: FaUserCheck,
            color: theme.colors.success, bg: theme.colors.successSoft,
            onClick: bulkActivate },
          { key: 'deactivate', label: 'غیرفعال‌سازی', icon: FaUserTimes,
            color: theme.colors.warning, bg: theme.colors.warningSoft,
            onClick: bulkDeactivate },
          { key: 'delete', label: 'حذف', icon: FaTrash,
            color: '#FFFFFF', bg: theme.colors.danger,
            danger: true, onClick: bulkDelete },
        ]}
      />

    </AdminLayout>
  );
}

// ═══════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, color, soft }) {
  return (
    <div style={S.statCard} className="users-card-static">
      <div style={{ ...S.statIconBox, background: soft }}>
        <Icon size={14} color={color} />
      </div>
      <div style={S.statLabel}>{label}</div>
      <div style={S.statValue}>{value.toLocaleString('fa-IR')}</div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div style={S.detailRow}>
      <span style={S.detailLabel}>
        <Icon size={11} /> {label}
      </span>
      <span style={S.detailValue}>{value}</span>
    </div>
  );
}

function UserSkeleton() {
  return (
    <div style={S.container}>
      <div style={S.pageHeader}>
        <div>
          <div style={{ ...S.skelBar, width: 180, height: 26 }} />
          <div style={{ ...S.skelBar, width: 220, height: 14, marginTop: 10 }} />
        </div>
        <div style={{ ...S.skelBar, width: 200, height: 38, borderRadius: 10 }} />
      </div>
      <div style={S.statsGrid} className="users-stats-grid">
        {[0,1,2,3].map((i) => (
          <div key={i} style={S.statCard}>
            <div style={{ ...S.skelBar, width: 36, height: 36, borderRadius: 10 }} />
            <div style={{ ...S.skelBar, width: 70, height: 12, marginTop: 12 }} />
            <div style={{ ...S.skelBar, width: 100, height: 22, marginTop: 6 }} />
          </div>
        ))}
      </div>
      <div style={{ ...S.skelBar, width: '100%', height: 300, borderRadius: 14 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════

const S = {
  container: { maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 },

  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' },
  pageTitle: { fontSize: 24, fontWeight: 800, color: theme.colors.text, margin: 0, letterSpacing: '-0.4px' },
  pageSubtitle: { fontSize: 13, color: theme.colors.textSubtle, margin: '6px 0 0' },
  headerActions: { display: 'flex', gap: 8, flexWrap: 'wrap' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 },
  statCard: {
    background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
    borderRadius: 14, padding: 18, boxShadow: theme.shadow.sm,
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  statIconBox: { width: 36, height: 36, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 12, fontWeight: 500, color: theme.colors.textSubtle },
  statValue: { fontSize: 24, fontWeight: 800, color: theme.colors.text,
    letterSpacing: '-0.6px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 },

  filtersCard: { background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
    borderRadius: 14, boxShadow: theme.shadow.sm, padding: 16,
    display: 'flex', flexDirection: 'column', gap: 12 },
  filtersRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  searchWrapper: { position: 'relative', flex: 1, minWidth: 220 },
  searchIcon: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: theme.colors.textFaint },
  searchInput: {
    width: '100%', padding: '10px 40px 10px 14px',
    background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`,
    borderRadius: 10, fontSize: 13, color: theme.colors.text,
    fontFamily: theme.font.family, outline: 'none', boxSizing: 'border-box',
  },
  filterWrapper: { display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`, borderRadius: 10 },
  filterIcon: { color: theme.colors.textFaint },
  filterSelect: { background: 'transparent', border: 'none', fontSize: 12.5,
    color: theme.colors.text, fontFamily: theme.font.family, cursor: 'pointer', outline: 'none' },

  filtersMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 12, borderTop: `1px solid ${theme.colors.borderSoft}`, gap: 8 },
  filtersCount: { fontSize: 12, color: theme.colors.textSubtle, fontWeight: 500 },
  clearBtn: { padding: '6px 14px', background: theme.colors.dangerSoft,
    border: 'none', borderRadius: 8, fontSize: 11.5, fontWeight: 600,
    color: theme.colors.danger, fontFamily: theme.font.family, cursor: 'pointer' },

  tableCard: { background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
    borderRadius: 14, boxShadow: theme.shadow.sm, overflow: 'hidden' },
  tableWrap: { overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'right', padding: '12px 16px', fontSize: 10.5,
    fontWeight: 700, color: theme.colors.textFaint, textTransform: 'uppercase',
    letterSpacing: '0.5px', background: theme.colors.surfaceAlt,
    borderBottom: `1px solid ${theme.colors.border}`, whiteSpace: 'nowrap' },
  tr: { borderBottom: `1px solid ${theme.colors.borderSoft}`, transition: 'background 0.15s' },
  trSelected: { background: theme.colors.accentSoft },
  td: { padding: '12px 16px', fontSize: 13, color: theme.colors.text,
    fontFamily: theme.font.family, verticalAlign: 'middle', whiteSpace: 'nowrap' },
  checkbox: { width: 16, height: 16, accentColor: theme.colors.accent, cursor: 'pointer' },

  userCell: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
  userAvatar: { width: 32, height: 32, borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, flexShrink: 0 },
  userName: { fontSize: 12.5, fontWeight: 600, color: theme.colors.text,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userUsername: { fontSize: 11, color: theme.colors.textFaint, marginTop: 1 },

  contactCell: { display: 'flex', flexDirection: 'column', gap: 3 },
  contactRow: { display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11.5, color: theme.colors.textMuted },

  pill: { display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '4px 10px', borderRadius: 999, fontSize: 11,
    fontWeight: 700, whiteSpace: 'nowrap' },

  pkgCount: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '2px 10px', background: theme.colors.accentSoft,
    borderRadius: 999, fontSize: 11.5, fontWeight: 700, color: theme.colors.accent },

  actionsGroup: { display: 'flex', gap: 4 },
  rowAction: { width: 28, height: 28, display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center',
    background: theme.colors.surfaceAlt, border: 'none', borderRadius: 8,
    color: theme.colors.textMuted, cursor: 'pointer', transition: 'all 0.15s' },

  // Mobile
  mobileCard: { display: 'block', width: '100%', textAlign: 'right',
    padding: 14, background: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.borderSoft}`, fontFamily: theme.font.family },
  mobileCardSelected: { background: theme.colors.accentSoft },
  mobileCheckRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  mobileSelectedLabel: { fontSize: 11.5, color: theme.colors.textSubtle, fontWeight: 500 },
  mobileTop: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 8, marginBottom: 10 },
  mobileRow: { display: 'flex', justifyContent: 'space-between',
    gap: 8, padding: '4px 0' },
  mobileLabel: { fontSize: 12, color: theme.colors.textSubtle, fontWeight: 500 },
  mobileValue: { fontSize: 12.5, color: theme.colors.text, fontWeight: 500,
    textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis',
    whiteSpace: 'nowrap', maxWidth: '65%' },
  mobileActions: { display: 'flex', gap: 6, marginTop: 10 },
  mobileActionBtn: { display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '6px 12px', background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`, borderRadius: 8,
    fontSize: 11.5, fontWeight: 600, color: theme.colors.textMuted,
    fontFamily: theme.font.family, cursor: 'pointer' },

  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: 12, padding: 16, borderTop: `1px solid ${theme.colors.borderSoft}` },
  pageBtn: { width: 34, height: 34, borderRadius: 9, background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`, color: theme.colors.textMuted,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  pageInfo: { fontSize: 12.5, color: theme.colors.textSubtle, fontWeight: 500 },

  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 8, padding: '56px 20px', textAlign: 'center' },
  emptyIconWrap: { width: 56, height: 56, borderRadius: 16,
    background: theme.colors.surfaceAlt, display: 'flex',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 14, fontWeight: 700, color: theme.colors.text, margin: 0 },
  emptyDesc: { fontSize: 12.5, color: theme.colors.textSubtle, margin: 0,
    maxWidth: 320, lineHeight: 1.6 },

  // Modal
  modalBackdrop: { position: 'fixed', inset: 0, background: 'rgba(11,15,26,0.5)',
    backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
    zIndex: 1000, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: 20 },
  modal: { width: '100%', maxWidth: 520, maxHeight: '85vh',
    background: theme.colors.surface, borderRadius: 16,
    boxShadow: theme.shadow.xl, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  modalHeader: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '16px 20px',
    borderBottom: `1px solid ${theme.colors.border}` },
  modalTitle: { fontSize: 14.5, fontWeight: 700, color: theme.colors.text, margin: 0 },
  modalClose: { width: 28, height: 28, background: 'none', border: 'none',
    fontSize: 22, color: theme.colors.textFaint, cursor: 'pointer', lineHeight: 1 },
  modalBody: { padding: 20, overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 10 },
  modalProfile: { display: 'flex', gap: 14, alignItems: 'center',
    padding: 14, background: theme.colors.surfaceAlt,
    borderRadius: 12, marginBottom: 6 },
  modalAvatar: { width: 52, height: 52, borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    color: '#FFFFFF', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0 },
  modalName: { fontSize: 15, fontWeight: 700, color: theme.colors.text },
  modalUsername: { fontSize: 12, color: theme.colors.textSubtle, marginTop: 2 },
  modalBadges: { display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  modalFooter: { padding: '12px 20px', borderTop: `1px solid ${theme.colors.border}`,
    display: 'flex', justifyContent: 'flex-end', gap: 8 },
  modalCloseBtn: { padding: '8px 20px', background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`, borderRadius: 10,
    fontSize: 12.5, fontWeight: 600, color: theme.colors.textMuted,
    fontFamily: theme.font.family, cursor: 'pointer' },
  modalEditBtn: { display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', background: theme.colors.accentSoft,
    border: 'none', borderRadius: 10, fontSize: 12.5, fontWeight: 600,
    color: theme.colors.accent, fontFamily: theme.font.family, cursor: 'pointer' },
  modalSaveBtn: { display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 18px', background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    border: 'none', borderRadius: 10, fontSize: 12.5, fontWeight: 600,
    color: '#FFFFFF', fontFamily: theme.font.family, cursor: 'pointer' },

  detailRow: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 12, padding: '10px 0',
    borderBottom: `1px solid ${theme.colors.borderSoft}` },
  detailLabel: { display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 12, color: theme.colors.textSubtle, fontWeight: 500 },
  detailValue: { fontSize: 12.5, fontWeight: 600, color: theme.colors.text,
    textAlign: 'left', maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis' },

  bioBox: { marginTop: 10, padding: 12, background: theme.colors.surfaceAlt,
    borderRadius: 10, border: `1px solid ${theme.colors.border}` },
  bioLabel: { fontSize: 11, fontWeight: 700, color: theme.colors.textFaint,
    textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 },
  bioText: { fontSize: 12.5, color: theme.colors.textMuted,
    lineHeight: 1.7, margin: 0 },

  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: theme.colors.textMuted },
  input: { padding: '10px 14px', background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`, borderRadius: 10,
    fontSize: 13, color: theme.colors.text, fontFamily: theme.font.family, outline: 'none' },
  textarea: { padding: '10px 14px', background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`, borderRadius: 10,
    fontSize: 13, color: theme.colors.text, fontFamily: theme.font.family,
    outline: 'none', resize: 'vertical' },

  skelBar: { background: 'linear-gradient(90deg, #EEF0F4 0%, #F7F8FA 50%, #EEF0F4 100%)',
    backgroundSize: '200% 100%', borderRadius: 6,
    animation: 'users-skel 1.4s ease-in-out infinite' },
};

if (typeof document !== 'undefined' && !document.getElementById('admin-users-styles')) {
  const style = document.createElement('style');
  style.id = 'admin-users-styles';
  style.textContent = `
    @keyframes users-skel {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .users-card-static { transition: box-shadow 0.18s ease !important; }
    .users-card-static:hover {
      box-shadow: 0 8px 24px -6px rgba(15,23,42,0.08), 0 2px 6px -2px rgba(15,23,42,0.04) !important;
    }
    .users-row:hover { background: ${theme.colors.surfaceAlt}; }
    .users-row:last-child { border-bottom: none; }
    .users-row-action:hover {
      background: ${theme.colors.accentSoft} !important;
      color: ${theme.colors.accent} !important;
    }
    .users-row-action-danger:hover {
      background: ${theme.colors.dangerSoft} !important;
      color: ${theme.colors.danger} !important;
    }
    .users-clear-btn:hover {
      background: ${theme.colors.danger} !important;
      color: #FFFFFF !important;
    }
    .users-page-btn:hover { background: ${theme.colors.surfaceAlt} !important; }
    .users-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

    .users-mobile-cards { display: none; }

    @media (max-width: 1023px) {
      .users-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
    @media (max-width: 768px) {
      .users-page-header {
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .users-filters-row { flex-direction: column !important; }
      .users-filters-row > * { width: 100% !important; }
      .users-stats-grid { grid-template-columns: 1fr !important; }
      .users-desktop-table { display: none !important; }
      .users-mobile-cards { display: block !important; }
    }
  `;
  document.head.appendChild(style);
}

export default AdminUsers;