import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Save, RotateCcw, Users, ShieldCheck, Key, LayoutDashboard,
  Banknote, Sprout, Package, Send, CheckCircle, Flower2, ShoppingBag,
  Newspaper, Bell, UserCog, Lock, Check, ChevronRight, ChevronDown,
  CheckSquare, Square, RefreshCw
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import StatusBadge from '../components/ui/StatusBadge';
import { dashboardPermissionsApi } from '../services/dashboardPermissionsApi';

const moduleIconMap = {
  dashboard: LayoutDashboard,
  suppliers: Users,
  cashRequests: Banknote,
  fertilizerRequests: Sprout,
  itemRequests: Package,
  disbursements: Send,
  disbursementTracking: CheckCircle,
  fertilizerConfiguration: Flower2,
  itemConfiguration: ShoppingBag,
  news: Newspaper,
  notifications: Bell,
  userManagement: UserCog,
  permissionManagement: Lock,
}

const emptyPermissions = { modulePermissions: {}, subPermissions: {} }

const Settings = () => {
  const [searchParams] = useSearchParams();
  const requestedUserId = Number(searchParams.get('userId') || 0);
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [userPermissions, setUserPermissions] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [modulePermissions, setModulePermissions] = useState({});
  const [subPermissions, setSubPermissions] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    dashboardPermissionsApi
      .getSettings({ signal: controller.signal })
      .then(result => {
        const users = result.users || [];
        const modules = result.modules || [];
        const userPermissions = result.userPermissions || {};

        setUsers(users);
        setModules(modules);
        setUserPermissions(userPermissions);

        const firstUser = users.find(user => user.id === requestedUserId) || users[0] || null;
        setSelectedUser(firstUser);

        const firstPermissions = firstUser ? userPermissions[firstUser.id] || emptyPermissions : emptyPermissions;
        setModulePermissions({ ...firstPermissions.modulePermissions });
        setSubPermissions({ ...firstPermissions.subPermissions });
        setExpandedModules({});
        setHasChanges(false);
        setError('');
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setError(error.message || 'Unable to load dashboard permissions');
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [refreshKey, requestedUserId]);

  const subPermissionsByModule = useMemo(() => (
    modules.reduce((acc, module) => {
      acc[module.id] = module.subPermissions || [];
      return acc;
    }, {})
  ), [modules]);

  const applyUserPermissions = (user, permissionsMap = userPermissions) => {
    const permissions = permissionsMap[user.id] || emptyPermissions;

    setModulePermissions({ ...permissions.modulePermissions });
    setSubPermissions({ ...permissions.subPermissions });
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    applyUserPermissions(user);
    setExpandedModules({});
    setHasChanges(false);
  };

  const toggleModulePermission = (moduleId) => {
    const newState = !modulePermissions[moduleId];
    setModulePermissions(prev => ({ ...prev, [moduleId]: newState }));
    
    // If disabling module, also clear all sub-permissions for that module
    if (!newState) {
      setSubPermissions(prev => ({ ...prev, [moduleId]: [] }));
    } else {
      // If enabling module, enable default sub-permissions (view only for basic access)
      const defaultSubs = (subPermissionsByModule[moduleId] || [])
        .filter(sub => sub.id.endsWith('.view'))
        .map(sub => sub.id);
      setSubPermissions(prev => ({ ...prev, [moduleId]: defaultSubs }));
    }
    setHasChanges(true);
  };

  const toggleSubPermission = (moduleId, subId) => {
    setSubPermissions(prev => {
      const current = prev[moduleId] || [];
      const newSubs = current.includes(subId)
        ? current.filter(id => id !== subId)
        : [...current, subId];
      
      // If we're adding the first sub-permission and module is disabled, enable it
      if (newSubs.length > 0 && !modulePermissions[moduleId]) {
        setModulePermissions(prevMod => ({ ...prevMod, [moduleId]: true }));
      }
      
      return { ...prev, [moduleId]: newSubs };
    });
    setHasChanges(true);
  };

  const selectAllSubPermissions = (moduleId) => {
    const allSubIds = (subPermissionsByModule[moduleId] || []).map(sub => sub.id);
    setSubPermissions(prev => ({ ...prev, [moduleId]: allSubIds }));
    if (!modulePermissions[moduleId]) {
      setModulePermissions(prevMod => ({ ...prevMod, [moduleId]: true }));
    }
    setHasChanges(true);
  };

  const deselectAllSubPermissions = (moduleId) => {
    setSubPermissions(prev => ({ ...prev, [moduleId]: [] }));
    setHasChanges(true);
  };

  const toggleExpandModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleReset = () => {
    if (!selectedUser) return;
    applyUserPermissions(selectedUser);
    setHasChanges(false);
  };

  const handleSave = async () => {
    if (!selectedUser || saving) return;

    setSaving(true);

    try {
      const saved = await dashboardPermissionsApi.saveUserPermissions(selectedUser.id, {
        modulePermissions,
        subPermissions,
      });

      setUserPermissions(prev => ({ ...prev, [selectedUser.id]: saved }));
      setModulePermissions({ ...saved.modulePermissions });
      setSubPermissions({ ...saved.subPermissions });
      setHasChanges(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      setError(error.message || 'Unable to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const enabledModulesCount = Object.values(modulePermissions).filter(Boolean).length;
  const totalModules = modules.length;

  // Calculate total sub-permissions enabled
  const totalSubPermissionsEnabled = Object.values(subPermissions).reduce((acc, curr) => acc + curr.length, 0);
  const totalSubPermissionsAvailable = modules.reduce((acc, module) => acc + (module.subPermissions?.length || 0), 0);

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Permission Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure dashboard access and granular actions for each user.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setRefreshKey(current => current + 1);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <RefreshCw size="14" className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Success Toast */}
        {showSaveSuccess && (
          <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right-5 z-50">
            <Check size={16} /> Permissions updated successfully
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/15 dark:text-rose-300">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <span className="inline-flex items-center gap-2">
              <RefreshCw size={15} className="animate-spin" />
              Loading permission settings...
            </span>
          </div>
        )}

        <div className="flex gap-6 flex-wrap lg:flex-nowrap">
          {/* Left Column: Users List */}
          <div className="w-80 flex-shrink-0 space-y-5">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <ShieldCheck size="16" className="text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">System Users</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select a user to manage permissions</p>
              </div>
              <div className="p-2">
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`w-full text-left p-3 rounded-lg transition-all mb-1 ${selectedUser?.id === user.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500' : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-center gap-2">
                          <span className={`font-medium text-sm truncate ${selectedUser?.id === user.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>{user.name}</span>
                          {selectedUser?.id === user.id && <Check size="14" className="text-emerald-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </button>
                ))}
                {users.length === 0 && !loading && (
                  <div className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No dashboard users found
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <Users size="16" className="text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Selected User</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Permissions below apply only to this user</p>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                  <Avatar name={selectedUser?.name || ''} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{selectedUser?.name || 'No user selected'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{selectedUser?.email || '-'}</p>
                  </div>
                  {selectedUser && <StatusBadge status={selectedUser.status} />}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Permissions Matrix with Expandable Sections */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Key size="16" className="text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">Granular Permissions</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Configure access for <span className="font-medium text-emerald-600 dark:text-emerald-400">{selectedUser?.name || 'a selected user'}</span>
                  </p>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{enabledModulesCount}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">/{totalModules} modules</span>
                  </div>
                  <div className="pl-4 border-l border-slate-300 dark:border-slate-600">
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalSubPermissionsEnabled}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">/{totalSubPermissionsAvailable} actions</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {modules.map(module => {
                const isModuleEnabled = modulePermissions[module.id];
                const Icon = moduleIconMap[module.id] || ShieldCheck;
                const isExpanded = expandedModules[module.id];
                const subPerms = module.subPermissions || [];
                const enabledSubs = subPermissions[module.id] || [];
                const enabledCount = enabledSubs.length;
                const totalCount = subPerms.length;
                
                return (
                  <div key={module.id} className="transition-colors">
                    {/* Module Row */}
                    <div className={`p-5 ${isModuleEnabled ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <button
                            onClick={() => toggleExpandModule(module.id)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                          >
                            {isExpanded ? <ChevronDown size="18" className="text-slate-500" /> : <ChevronRight size="18" className="text-slate-500" />}
                          </button>
                          <div className={`p-2 rounded-lg ${isModuleEnabled ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                            <Icon size="18" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium ${isModuleEnabled ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{module.label}</h4>
                              {totalCount > 0 && isModuleEnabled && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                                  {enabledCount}/{totalCount}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{module.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleModulePermission(module.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${isModuleEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isModuleEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Sub-Permissions Row (Expandable) */}
                    {isExpanded && subPerms.length > 0 && (
                      <div className="pl-12 pr-5 pb-5 pt-0 bg-slate-50/30 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-700/30">
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Granular Actions</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => selectAllSubPermissions(module.id)}
                                disabled={!isModuleEnabled}
                                className={`text-xs px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                                  isModuleEnabled 
                                    ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' 
                                    : 'text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                <CheckSquare size="12" /> Select All
                              </button>
                              <button
                                onClick={() => deselectAllSubPermissions(module.id)}
                                disabled={!isModuleEnabled}
                                className={`text-xs px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                                  isModuleEnabled 
                                    ? 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700' 
                                    : 'text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                <Square size="12" /> Deselect All
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {subPerms.map(sub => {
                              const isEnabled = enabledSubs.includes(sub.id);
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => toggleSubPermission(module.id, sub.id)}
                                  className={`flex items-start gap-3 p-2 rounded-lg text-left transition-all ${
                                    isEnabled 
                                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/40 border border-transparent'
                                  } ${!isModuleEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                  disabled={!isModuleEnabled}
                                >
                                  {isEnabled ? (
                                    <CheckSquare size="16" className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                                  ) : (
                                    <Square size="16" className="text-slate-400 mt-0.5 flex-shrink-0" />
                                  )}
                                  <div>
                                    <p className={`text-sm font-medium ${isEnabled ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                      {sub.label}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{sub.description}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary Footer with Reset and Save buttons */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center flex-wrap gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium">{selectedUser?.name || 'Selected user'}</span> has access to {enabledModulesCount} modules with {totalSubPermissionsEnabled} granular actions
                {hasChanges && <span className="ml-2 font-semibold text-amber-600 dark:text-amber-400">Unsaved changes</span>}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleReset} 
                  disabled={!selectedUser || saving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RotateCcw size="14" /> Reset
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={!selectedUser || saving || !hasChanges}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? <RefreshCw size="14" className="animate-spin" /> : <Save size="14" />} Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
