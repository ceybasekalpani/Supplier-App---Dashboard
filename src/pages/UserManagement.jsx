// UserManagement.jsx
import { useState, useRef } from 'react';
import { Pencil, Trash2, Camera, X, Search } from 'lucide-react';
import { systemUsers, userRoles } from '../data/mockData';
import Avatar from '../components/ui/Avatar';
import FormInput from '../components/ui/FormInput';
import StatusBadge from '../components/ui/StatusBadge';
import { sanitizeText, validateUserForm } from '../utils/validation';

const UserManagement = () => {
  const [users, setUsers] = useState(systemUsers);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    fullName: '', email: '', username: '', password: '', phoneNo: '', role: 'Admin', status: 'active'
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = users.filter(u => u.status === 'active').length;
  const inactiveCount = users.filter(u => u.status === 'inactive').length;

  const validateForm = () => {
    const newErrors = validateUserForm(formData, { editing: Boolean(editingUser) });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert('Image size must be less than 2MB');
      if (!file.type.startsWith('image/')) return alert('Only image files are allowed');
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ fullName: '', email: '', username: '', password: '', phoneNo: '', role: 'Admin', status: 'active' });
    setImagePreview(null); setEditingUser(null); setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    if (!validateForm()) return;
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? {
        ...editingUser, name: sanitizeText(formData.fullName), email: sanitizeText(formData.email), username: sanitizeText(formData.username),
        phoneNo: sanitizeText(formData.phoneNo), role: formData.role, status: formData.status,
        avatar: imagePreview || editingUser.avatar
      } : u));
      alert('User updated successfully!');
    } else {
      setUsers([...users, { id: Date.now(), name: sanitizeText(formData.fullName), email: sanitizeText(formData.email), username: sanitizeText(formData.username), password: formData.password, phoneNo: sanitizeText(formData.phoneNo), role: formData.role, status: formData.status, avatar: imagePreview || null, createdAt: new Date().toISOString() }]);
      alert('User created successfully!');
    }
    resetForm();
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ fullName: user.name, email: user.email, username: user.username, password: '', phoneNo: user.phoneNo || '', role: user.role, status: user.status });
    setImagePreview(user.avatar || null); setErrors({});
  };

  const handleDelete = () => {
    setUsers(users.filter(u => u.id !== showDeleteConfirm));
    setShowDeleteConfirm(null);
    if (editingUser?.id === showDeleteConfirm) resetForm();
    alert('User deleted successfully!');
  };

  const getRoleColor = (role) => ({
    'Super Admin': 'text-amber-600 dark:text-amber-400',
    'Admin': 'text-blue-600 dark:text-blue-400',
    'Support': 'text-emerald-600 dark:text-emerald-400',
    'Viewer': 'text-slate-600 dark:text-slate-400'
  }[role] || 'text-slate-600');

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage system administrators and their access roles</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-5">
          {[
            { label: 'Total Administrators', value: users.length, color: 'from-slate-500 to-slate-600', textColor: 'text-slate-900 dark:text-white' },
            { label: 'Active Users', value: activeCount, color: 'from-emerald-500 to-teal-600', textColor: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Inactive Users', value: inactiveCount, color: 'from-rose-500 to-red-600', textColor: 'text-rose-600 dark:text-rose-400' },
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
                <input type="text" placeholder="Search by name, email or username..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-64 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
              <div className="flex gap-2">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Administrator</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} size="sm" src={user.avatar} />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                            {user.phoneNo && <p className="text-xs text-slate-400 mt-0.5">{user.phoneNo}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4"><span className={`text-xs font-bold ${getRoleColor(user.role)}`}>{user.role}</span></td>
                      <td className="py-3 px-4"><StatusBadge status={user.status} /></td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(user)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => setShowDeleteConfirm(user.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && <tr><td colSpan="4" className="py-12 text-center text-slate-500 dark:text-slate-400">No users found</td></tr>}
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
                <button onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-colors overflow-hidden bg-slate-50 dark:bg-slate-700/30">
                  {imagePreview ? <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" /> : <Camera size={28} />}
                </button>
                {imagePreview && <button onClick={() => { setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5"><X size={12} /></button>}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              {['fullName', 'email', 'username', 'password', 'phoneNo'].map((field) => {
                const isPassword = field === 'password';
                const label = { fullName: 'Full Name', email: 'Email Address', username: 'Username', password: 'Password', phoneNo: 'Phone Number' }[field];
                const required = field !== 'phoneNo';
                const showField = !(isPassword && editingUser);
                if (!showField) return null;
                return (
                  <FormInput
                    key={field}
                    label={label}
                    name={field}
                    type={isPassword ? 'password' : 'text'}
                    value={formData[field]}
                    required={required}
                    error={errors[field]}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                  />
                );
              })}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Role</label>
                  <select value={formData.role} onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20">
                    {userRoles.map(role => <option key={role.id} value={role.name}>{role.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button onClick={resetForm} className="flex-1 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">{editingUser ? 'Cancel' : 'Discard'}</button>
              <button onClick={handleSave} className="flex-1 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm">{editingUser ? 'Update User' : 'Create User'}</button>
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
                <button onClick={handleDelete} className="flex-1 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
