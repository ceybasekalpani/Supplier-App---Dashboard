import { useEffect, useState, useRef } from 'react';
import { sanitizeText, validateUserForm } from '../../utils/validation';
import { useAuthenticatedImageSrc } from '../../utils/useAuthenticatedImageSrc';
import { dashboardUsersApi } from '../../services/dashboardUsersApi';
import { adminAuthStorage } from '../../services/adminApiClient';
import { hasAdminPermission } from '../../services/adminPermissions';
import { useCurrentAdmin } from '../../hooks/useCurrentAdmin';
import { useAdminStore } from '../../store/adminStore';
import UserTable from './components/UserTable';
import UserFormPanel from './components/UserFormPanel';
import DeleteUserModal from './components/DeleteUserModal';

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
  const currentAdmin = useCurrentAdmin();
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
    const controller = new AbortController();

    dashboardUsersApi
      .list({ search: searchTerm, status: statusFilter, signal: controller.signal })
      .then(result => {
        setUsers(result.users || []);
        setSummary(result.summary || { totalAdministrators: 0, activeUsers: 0, inactiveUsers: 0 });
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
    const storedAdmin = adminAuthStorage.getUser();
    if (!storedAdmin || String(storedAdmin.id || storedAdmin.adminId) !== String(user.id)) return;

    useAdminStore.getState().setCurrentAdmin({
      ...storedAdmin,
      fullName: user.fullName || user.name || storedAdmin.fullName,
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Create dashboard users. Access is assigned per user in Permission Management.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {[
            { label: 'Total Administrators', value: summary.totalAdministrators, textColor: 'text-slate-900 dark:text-white' },
            { label: 'Active Users', value: summary.activeUsers, textColor: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Inactive Users', value: summary.inactiveUsers, textColor: 'text-rose-600 dark:text-rose-400' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-6 flex-wrap lg:flex-nowrap">
          <UserTable
            users={filteredUsers}
            loading={loading}
            searchTerm={searchTerm}
            onSearchTermChange={(value) => { setLoading(true); setSearchTerm(value); }}
            statusFilter={statusFilter}
            onStatusFilterChange={(value) => { setLoading(true); setStatusFilter(value); }}
            currentAdmin={currentAdmin}
            visiblePasswordUserId={visiblePasswordUserId}
            onToggleVisiblePassword={(userId) => setVisiblePasswordUserId(current => current === userId ? null : userId)}
            canUpdateUser={canUpdateUser}
            canDeleteUser={canDeleteUser}
            canAssignPermissions={canAssignPermissions}
            onEdit={handleEdit}
            onRequestDelete={setShowDeleteConfirm}
          />

          <UserFormPanel
            editingUser={editingUser}
            formData={formData}
            onFieldChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
            errors={errors}
            resolvedImagePreview={resolvedImagePreview}
            imagePreview={imagePreview}
            fileInputRef={fileInputRef}
            onImageUpload={handleImageUpload}
            onClearImage={clearSelectedProfileImage}
            showFormPassword={showFormPassword}
            onToggleShowFormPassword={() => setShowFormPassword(current => !current)}
            saving={saving}
            canCreateUser={canCreateUser}
            canUpdateUser={canUpdateUser}
            onSave={handleSave}
            onDiscard={resetForm}
          />
        </div>

        <DeleteUserModal
          open={Boolean(showDeleteConfirm)}
          deleting={deleting}
          onCancel={() => setShowDeleteConfirm(null)}
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
};

export default UserManagement;
