import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, RefreshCw } from 'lucide-react';
import { dashboardPermissionsApi } from '../../services/dashboardPermissionsApi';
import UserList from './components/UserList';
import PermissionsMatrix from './components/PermissionsMatrix';
import { emptyPermissions } from './utils/settingsConstants';

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

    if (!newState) {
      setSubPermissions(prev => ({ ...prev, [moduleId]: [] }));
    } else {
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

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
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
          <UserList
            users={users}
            selectedUser={selectedUser}
            onUserSelect={handleUserSelect}
            loading={loading}
          />

          <PermissionsMatrix
            selectedUser={selectedUser}
            modules={modules}
            modulePermissions={modulePermissions}
            subPermissions={subPermissions}
            expandedModules={expandedModules}
            hasChanges={hasChanges}
            saving={saving}
            onToggleModulePermission={toggleModulePermission}
            onToggleSubPermission={toggleSubPermission}
            onSelectAllSubPermissions={selectAllSubPermissions}
            onDeselectAllSubPermissions={deselectAllSubPermissions}
            onToggleExpandModule={toggleExpandModule}
            onReset={handleReset}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
