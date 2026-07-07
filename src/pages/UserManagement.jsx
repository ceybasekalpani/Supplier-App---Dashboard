// UserManagement.jsx
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Camera, X, Search, RefreshCw, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Combobox from '../components/ui/Combobox';
import FormInput from '../components/ui/FormInput';
import StatusBadge from '../components/ui/StatusBadge';
import { sanitizeText, validateUserForm } from '../utils/validation';
import { useAuthenticatedImageSrc } from '../utils/useAuthenticatedImageSrc';
import { dashboardUsersApi } from '../services/dashboardUsersApi';
import { adminAuthStorage } from '../services/adminApiClient';
import { hasAdminPermission } from '../services/adminPermissions';
import { dashboardPermissionsApi } from '../services/dashboardPermissionsApi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ totalAdministrators: 0, activeUsers: 0, inactiveUsers: 0 });
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    fullName: '', email: '', username: '', password: '', phoneNo: '', role: 'Admin', status: 'active'
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedProfileFile, setSelectedProfileFile] = useState(null);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [visiblePasswordUserId, setVisiblePasswordUserId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(() => adminAuthStorage.getUser());
  const fileInputRef = useRef(null);

  const canCreateUser = hasAdminPermission(currentAdmin, ['userManagement.create']);
  const canUpdateUser = hasAdminPermission(currentAdmin, ['userManagement.update']);
  const canDeleteUser = hasAdminPermission(currentAdmin, ['userManagement.delete']);
  const canAssignPermissions = hasAdminPermission(currentAdmin, ['permissionManagement.assign']);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const admin = adminAuthStorage.getUser();
    if (!admin?.id || admin.isSuperAdmin) {
      return;
    }

    let mounted = true;
    dashboardPermissionsApi
      .getUserPermissions(admin.id)
      .then(permissions => {
        if (!mounted) return;
        const updatedAdmin = {
          ...admin,
          hasPermissionData: true,
          modulePermissions: permissions.modulePermissions || {},
          subPermissions: permissions.subPermissions || {},
        };
        adminAuthStorage.setUser(updatedAdmin);
        setCurrentAdmin(updatedAdmin);
      })
      .catch(() => {
        if (mounted) setCurrentAdmin(admin);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    dashboardUsersApi
      .list({ search: searchTerm, status: statusFilter, signal: controller.signal })
      .then(result => {
        setUsers(result.users);
        setSummary(result.summary);
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          showToast(error.message || 'Unable to load dashboard users', 'error');
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [searchTerm, statusFilter]);

  useEffect(() => () => {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const filteredUsers = users;
  const resolvedImagePreview = useAuthenticatedImageSrc(imagePreview);

  const validateForm = () => {
    const newErrors = validateUserForm(formData, { editing: Boolean(editingUser) });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const setPreviewUrl = (url) => {
    setImagePreview(previous => {
      if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
      return url;
    });
  };

  // `avatarAuthoritative` must only be set for responses that come from the
  // profile-image endpoints. The basic create/update endpoint doesn't return
  // avatar data, so blindly spreading it would null out an existing avatar.
  const mergeUser = (baseUser, nextUser, { avatarAuthoritative = false } = {}) => ({
    ...baseUser,
    ...nextUser,
    name: nextUser.name || nextUser.fullName || baseUser.name,
    fullName: nextUser.fullName || nextUser.name || baseUser.fullName,
    email: nextUser.email || baseUser.email,
    username: nextUser.username || baseUser.username,
    phoneNo: nextUser.phoneNo ?? baseUser.phoneNo,
    role: nextUser.role || baseUser.role,
    status: nextUser.status || baseUser.status,
    password: nextUser.password || baseUser.password,
    avatar: avatarAuthoritative ? nextUser.avatar : baseUser.avatar,
    profileImage: avatarAuthoritative ? nextUser.profileImage : baseUser.profileImage,
    avatarUrl: avatarAuthoritative ? nextUser.avatarUrl : baseUser.avatarUrl,
    avatarFallback: avatarAuthoritative ? nextUser.avatarFallback : baseUser.avatarFallback,
  });

  const syncCurrentAdminProfile = (user) => {
    const currentAdmin = adminAuthStorage.getUser();
    if (!currentAdmin || String(currentAdmin.id || currentAdmin.adminId) !== String(user.id)) return;

    adminAuthStorage.setUser({
      ...currentAdmin,
      fullName: user.fullName || user.name || currentAdmin.fullName,
      avatar: user.avatar ?? null,
      avatarUrl: user.avatarUrl ?? null,
      profileImage: user.profileImage ?? user.avatar ?? null,
    });
  };

  const toFormData = (user) => ({
    fullName: user.fullName || user.name || '',
    email: user.email || '',
    username: user.username || '',
    password: '',
    phoneNo: user.phoneNo || '',
    role: user.role || 'Admin',
    status: user.status || 'active',
  });

  const applyProfileImageChange = async (user) => {
    if (selectedProfileFile) {
      try {
        const updatedUser = mergeUser(user, await dashboardUsersApi.uploadProfileImage(user.id, selectedProfileFile), { avatarAuthoritative: true });
        showToast('User saved and profile image uploaded successfully.');
        return { user: updatedUser, imageError: null };
      } catch (error) {
        showToast(error.message || 'User saved, but profile image upload failed. Check Supabase storage configuration.', 'error');
        return { user, imageError: error };
      }
    }

    if (removeProfileImage) {
      try {
        const updatedUser = mergeUser(user, await dashboardUsersApi.clearProfileImage(user.id), { avatarAuthoritative: true });
        showToast('User saved and profile image removed.');
        return { user: updatedUser, imageError: null };
      } catch (error) {
        showToast(error.message || 'User saved, but profile image could not be removed.', 'error');
        return { user, imageError: error };
      }
    }

    return { user, imageError: null };
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Profile image must be smaller than 5 MB.', 'error');
        e.target.value = '';
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        showToast('Profile image must be JPG, PNG, or WebP.', 'error');
        e.target.value = '';
        return;
      }

      setSelectedProfileFile(file);
      setRemoveProfileImage(false);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearSelectedProfileImage = () => {
    setSelectedProfileFile(null);
    setRemoveProfileImage(Boolean(editingUser?.avatar || editingUser?.avatarUrl));
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setFormData({ fullName: '', email: '', username: '', password: '', phoneNo: '', role: 'Admin', status: 'active' });
    setPreviewUrl(null);
    setSelectedProfileFile(null);
    setRemoveProfileImage(false);
    setEditingUser(null); setErrors({}); setShowFormPassword(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (saving) return;
    if (editingUser ? !canUpdateUser : !canCreateUser) {
      showToast(`You do not have permission to ${editingUser ? 'update' : 'create'} dashboard users.`, 'error');
      return;
    }
    if (!validateForm()) return;

    setSaving(true);

    const payload = {
      ...formData,
      fullName: sanitizeText(formData.fullName),
      email: sanitizeText(formData.email),
      username: sanitizeText(formData.username),
      phoneNo: sanitizeText(formData.phoneNo),
    };

    try {
      if (editingUser) {
        const baseUpdated = await dashboardUsersApi.update(editingUser.id, payload);
        const { user: updated, imageError } = await applyProfileImageChange(mergeUser(editingUser, baseUpdated));

        const previousStatus = editingUser.status;

        setUsers(previous => previous.map(user => user.id === editingUser.id ? updated : user));
        syncCurrentAdminProfile(updated);
        if (previousStatus !== updated.status) {
          setSummary(previous => ({
            ...previous,
            activeUsers: previous.activeUsers + (updated.status === 'active' ? 1 : 0) - (previousStatus === 'active' ? 1 : 0),
            inactiveUsers: previous.inactiveUsers + (updated.status === 'inactive' ? 1 : 0) - (previousStatus === 'inactive' ? 1 : 0),
          }));
        }
        if (!selectedProfileFile && !removeProfileImage) showToast('User updated successfully.');
        if (imageError) {
          setEditingUser(updated);
          setFormData(toFormData(updated));
          setShowFormPassword(false);
          return;
        }
      } else {
        const baseCreated = await dashboardUsersApi.create(payload);
        const { user: created, imageError } = await applyProfileImageChange(baseCreated);

        setUsers(previous => [created, ...previous]);
        setSummary(previous => ({
          totalAdministrators: previous.totalAdministrators + 1,
          activeUsers: previous.activeUsers + (created.status === 'active' ? 1 : 0),
          inactiveUsers: previous.inactiveUsers + (created.status === 'inactive' ? 1 : 0),
        }));
        if (!selectedProfileFile) showToast('User created successfully.');
        if (imageError) {
          setEditingUser(created);
          setFormData(toFormData(created));
          setShowFormPassword(false);
          return;
        }
      }
      resetForm();
    } catch (error) {
      const conflictMessage = error.status === 409
        ? 'Username or email already exists. Use a unique username and email address.'
        : error.message || 'Unable to save dashboard user';
      showToast(conflictMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData(toFormData(user));
    setSelectedProfileFile(null);
    setRemoveProfileImage(false);
    setPreviewUrl(user.profileImage || user.avatar || null); setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm || deleting) return;
    if (!canDeleteUser) {
      showToast('You do not have permission to delete dashboard users.', 'error');
      setShowDeleteConfirm(null);
      return;
    }

    setDeleting(true);

    try {
      await dashboardUsersApi.delete(showDeleteConfirm);
      const deletedUser = users.find(user => user.id === showDeleteConfirm);
      setUsers(previous => previous.filter(user => user.id !== showDeleteConfirm));
      setSummary(previous => ({
        totalAdministrators: Math.max(previous.totalAdministrators - 1, 0),
        activeUsers: Math.max(previous.activeUsers - (deletedUser?.status === 'active' ? 1 : 0), 0),
        inactiveUsers: Math.max(previous.inactiveUsers - (deletedUser?.status === 'inactive' ? 1 : 0), 0),
      }));
      setShowDeleteConfirm(null);
      if (editingUser?.id === showDeleteConfirm) resetForm();
      showToast('User deleted successfully.');
    } catch (error) {
      showToast(error.message || 'Unable to delete dashboard user', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Create dashboard users. Access is assigned per user in Permission Management.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-5">
          {[
            { label: 'Total Administrators', value: summary.totalAdministrators, color: 'from-slate-500 to-slate-600', textColor: 'text-slate-900 dark:text-white' },
            { label: 'Active Users', value: summary.activeUsers, color: 'from-emerald-500 to-teal-600', textColor: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Inactive Users', value: summary.inactiveUsers, color: 'from-rose-500 to-red-600', textColor: 'text-rose-600 dark:text-rose-400' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content: Table + Form */}
        <div className="flex gap-6 flex-wrap lg:flex-nowrap">
          {/* Users Table Section */}
          <div className="flex-1 min-w-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-3 justify-between items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search by name, email or username..." value={searchTerm} onChange={(e) => { setLoading(true); setSearchTerm(e.target.value); }} className="pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-64 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
              <div className="flex gap-2">
                <Combobox
                  value={statusFilter}
                  onChange={(value) => { setLoading(true); setStatusFilter(value); }}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                  className="min-w-36"
                  buttonClassName="border-slate-300 bg-white py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              {loading && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-500">
                  <RefreshCw size={15} className="animate-spin" />
                  Loading dashboard users...
                </div>
              )}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Administrator</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} size="sm" src={user.profileImage || user.avatar} fallbackSrc={user.avatarFallback} />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                            <p className="text-xs text-slate-400 mt-0.5">@{user.username}</p>
                            {user.phoneNo && <p className="text-xs text-slate-400 mt-0.5">{user.phoneNo}</p>}
                            {user.password && (
                              <div className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                <KeyRound size={11} />
                                <span className="font-mono">{visiblePasswordUserId === user.id ? user.password : '********'}</span>
                                <button
                                  type="button"
                                  onClick={() => setVisiblePasswordUserId(current => current === user.id ? null : user.id)}
                                  className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                  title={visiblePasswordUserId === user.id ? 'Hide password' : 'Show password'}
                                >
                                  {visiblePasswordUserId === user.id ? <EyeOff size={12} /> : <Eye size={12} />}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={user.status} /></td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(user)} disabled={!canUpdateUser} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-40"><Pencil size={14} /></button>
                          {canAssignPermissions && (
                            <Link to={`/settings?userId=${user.id}`} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Manage permissions">
                              <ShieldCheck size={14} />
                            </Link>
                          )}
                          <button onClick={() => setShowDeleteConfirm(user.id)} disabled={!canDeleteUser} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && <tr><td colSpan="3" className="py-12 text-center text-slate-500 dark:text-slate-400">No users found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create/Edit Form Section */}
          <div className="w-96 flex-shrink-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">{editingUser ? 'Edit User' : 'Create New User'}</h3>
              {editingUser && <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>}
            </div>

            {/* Avatar Upload */}
            <div className="flex justify-center">
              <div className="relative">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-colors overflow-hidden bg-slate-50 dark:bg-slate-700/30">
                  {resolvedImagePreview ? <img src={resolvedImagePreview} alt="Profile" className="w-full h-full object-cover" /> : <Camera size={28} />}
                </button>
                {imagePreview && <button type="button" onClick={clearSelectedProfileImage} className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5"><X size={12} /></button>}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              {['fullName', 'email', 'username', 'phoneNo'].map((field) => {
                const label = { fullName: 'Full Name', email: 'Email Address', username: 'Username', phoneNo: 'Phone Number' }[field];
                const inputType = field === 'email' ? 'email' : field === 'phoneNo' ? 'tel' : 'text';
                return (
                  <FormInput
                    key={field}
                    label={label}
                    name={field}
                    type={inputType}
                    value={formData[field]}
                    required
                    error={errors[field]}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    inputMode={field === 'phoneNo' ? 'numeric' : undefined}
                    maxLength={field === 'phoneNo' ? 10 : undefined}
                    autoComplete={field === 'email' ? 'email' : field === 'username' ? 'username' : field === 'phoneNo' ? 'tel' : 'name'}
                    onChange={(e) => {
                      const value = field === 'phoneNo' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value;
                      setFormData(prev => ({ ...prev, [field]: value }));
                    }}
                  />
                );
              })}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {editingUser ? 'New Password' : 'Password'} {!editingUser && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showFormPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    autoComplete="new-password"
                    placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(current => !current)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
                    title={showFormPassword ? 'Hide password' : 'Show password'}
                  >
                    {showFormPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
                {editingUser && (
                  <p className="mt-1 text-xs text-slate-400">
                    Existing stored passwords cannot be viewed unless the API returns a plain or temporary password.
                  </p>
                )}
              </div>
              <div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <Combobox
                    value={formData.status}
                    onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                    ]}
                    buttonClassName="border-slate-300 bg-white py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  />
                  {errors.status && <p className="mt-1 text-xs text-rose-500">{errors.status}</p>}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button onClick={resetForm} className="flex-1 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">{editingUser ? 'Cancel' : 'Discard'}</button>
              <button onClick={handleSave} disabled={saving || (editingUser ? !canUpdateUser : !canCreateUser)} className="flex-1 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-70">
                <span className="inline-flex items-center justify-center gap-2">
                  {saving && <RefreshCw size={14} className="animate-spin" />}
                  {editingUser ? 'Update User' : 'Create User'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Confirm Deletion</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Are you sure you want to delete this user? This action cannot be undone.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70">
                  <span className="inline-flex items-center justify-center gap-2">
                    {deleting && <RefreshCw size={14} className="animate-spin" />}
                    Delete
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
