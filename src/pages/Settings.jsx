import { useState } from 'react';
import { 
  Save, RotateCcw, Users, ShieldCheck, Key, LayoutDashboard, 
  Truck, FileText, Settings as SettingsIcon, MessageSquare, 
  UserCog, Sliders, Check, ChevronRight, ChevronDown,
  CheckSquare, Square
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import StatusBadge from '../components/ui/StatusBadge';
import {
  permissionCatalog as SUB_PERMISSIONS,
  roleModulePermissionDefaults as INITIAL_MODULE_PERMISSIONS,
  roleSubPermissionDefaults as INITIAL_SUB_PERMISSIONS,
  systemUsers as USERS,
} from '../data/mockData';

// Module definitions with icons and labels
const MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'View analytics, cards, graphs, and quick actions' },
  { id: 'suppliers', label: 'Suppliers', icon: Truck, description: 'Manage supplier information, search, and history' },
  { id: 'requests', label: 'Requests', icon: FileText, description: 'Handle advance, fertilizer & item requests with approvals' },
  { id: 'configurations', label: 'Configurations', icon: SettingsIcon, description: 'Manage fertilizer and item types' },
  { id: 'communication', label: 'Communication', icon: MessageSquare, description: 'News and notifications management' },
  { id: 'userManagement', label: 'User Management', icon: UserCog, description: 'Admin user and role management' },
  { id: 'settings', label: 'Settings', icon: Sliders, description: 'System configuration and permissions' },
];

const createUserModulePermissions = () => USERS.reduce((acc, user) => {
  acc[user.id] = { ...(INITIAL_MODULE_PERMISSIONS[user.role] || INITIAL_MODULE_PERMISSIONS.Viewer) };
  return acc;
}, {});

const createUserSubPermissions = () => USERS.reduce((acc, user) => {
  acc[user.id] = { ...(INITIAL_SUB_PERMISSIONS[user.role] || INITIAL_SUB_PERMISSIONS.Viewer) };
  return acc;
}, {});

const Settings = () => {
  const [selectedUser, setSelectedUser] = useState(USERS[0]);
  const [userModulePermissions, setUserModulePermissions] = useState(createUserModulePermissions);
  const [userSubPermissions, setUserSubPermissions] = useState(createUserSubPermissions);
  const [modulePermissions, setModulePermissions] = useState({ ...userModulePermissions[USERS[0].id] });
  const [subPermissions, setSubPermissions] = useState({ ...userSubPermissions[USERS[0].id] });
  const [expandedModules, setExpandedModules] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setModulePermissions({ ...(userModulePermissions[user.id] || INITIAL_MODULE_PERMISSIONS[user.role] || INITIAL_MODULE_PERMISSIONS.Viewer) });
    setSubPermissions({ ...(userSubPermissions[user.id] || INITIAL_SUB_PERMISSIONS[user.role] || INITIAL_SUB_PERMISSIONS.Viewer) });
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
      const defaultSubs = SUB_PERMISSIONS[moduleId]
        .filter(sub => sub.id.startsWith('view_'))
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
    const allSubIds = SUB_PERMISSIONS[moduleId].map(sub => sub.id);
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
    setModulePermissions({ ...(INITIAL_MODULE_PERMISSIONS[selectedUser.role] || INITIAL_MODULE_PERMISSIONS.Viewer) });
    setSubPermissions({ ...(INITIAL_SUB_PERMISSIONS[selectedUser.role] || INITIAL_SUB_PERMISSIONS.Viewer) });
    setHasChanges(false);
  };

  const handleSave = () => {
    setUserModulePermissions(prev => ({ ...prev, [selectedUser.id]: { ...modulePermissions } }));
    setUserSubPermissions(prev => ({ ...prev, [selectedUser.id]: { ...subPermissions } }));
    setHasChanges(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const enabledModulesCount = Object.values(modulePermissions).filter(Boolean).length;
  const totalModules = MODULES.length;

  // Calculate total sub-permissions enabled
  const totalSubPermissionsEnabled = Object.values(subPermissions).reduce((acc, curr) => acc + curr.length, 0);
  const totalSubPermissionsAvailable = Object.values(SUB_PERMISSIONS).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Permission Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure module access and granular action permissions for each created user</p>
          </div>
        </div>

        {/* Success Toast */}
        {showSaveSuccess && (
          <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right-5 z-50">
            <Check size={16} /> Permissions updated successfully
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
                {USERS.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`w-full text-left p-3 rounded-lg transition-all mb-1 ${selectedUser.id === user.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500' : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-center gap-2">
                          <span className={`font-medium text-sm truncate ${selectedUser.id === user.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>{user.name}</span>
                          {selectedUser.id === user.id && <Check size="14" className="text-emerald-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        <p className="text-[11px] font-semibold text-slate-400">{user.role}</p>
                      </div>
                    </div>
                  </button>
                ))}
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
                  <Avatar name={selectedUser.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{selectedUser.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{selectedUser.email}</p>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{selectedUser.role}</p>
                  </div>
                  <StatusBadge status={selectedUser.status} />
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
                    Configure access for <span className="font-medium text-emerald-600 dark:text-emerald-400">{selectedUser.name}</span>
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
              {MODULES.map(module => {
                const isModuleEnabled = modulePermissions[module.id];
                const Icon = module.icon;
                const isExpanded = expandedModules[module.id];
                const subPerms = SUB_PERMISSIONS[module.id] || [];
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
                <span className="font-medium">{selectedUser.name}</span> has access to {enabledModulesCount} modules with {totalSubPermissionsEnabled} granular actions
                {hasChanges && <span className="ml-2 font-semibold text-amber-600 dark:text-amber-400">Unsaved changes</span>}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleReset} 
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw size="14" /> Reset
                </button>
                <button 
                  onClick={handleSave} 
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Save size="14" /> Save Changes
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
