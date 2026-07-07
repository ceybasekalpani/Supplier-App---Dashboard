export const PERMISSIONS = {
  dashboard: ['dashboard.view'],
  suppliers: ['suppliers.view'],
  requests: ['cashRequests.view', 'fertilizerRequests.view', 'itemRequests.view'],
  disbursements: ['disbursements.view'],
  disbursementTracking: ['disbursementTracking.view'],
  configurations: ['fertilizerConfiguration.view', 'itemConfiguration.view'],
  communication: ['news.view', 'notifications.view'],
  userManagement: ['userManagement.view'],
  permissions: ['permissionManagement.view', 'permissionManagement.assign'],
}

const toArray = value => Array.isArray(value) ? value : []
const normalizeKey = value => String(value || '').trim().toLowerCase()
const truthyPermission = value => value === true || String(value).toLowerCase() === 'true'

export function hasPermissionPayload(user) {
  if (!user) return false
  if (user.hasPermissionData) return true
  if (normalizePermissionList(user).length > 0) return true
  if (Object.keys(user.modulePermissions || user.ModulePermissions || {}).length > 0) return true
  if (Object.keys(user.subPermissions || user.SubPermissions || {}).length > 0) return true

  return false
}

export function normalizePermissionList(data = {}) {
  const rawPermissions = [
    ...toArray(data.permissions),
    ...toArray(data.Permissions),
    ...toArray(data.permissionKeys),
    ...toArray(data.PermissionKeys),
  ]

  return rawPermissions.map(permission => String(permission).trim()).filter(Boolean)
}

export function hasAdminPermission(user, permissionCandidates) {
  if (!user) return false
  if (user.isSuperAdmin) return true
  if (!hasPermissionPayload(user)) return true

  const candidates = toArray(permissionCandidates).map(permission => String(permission))
  const permissions = new Set(normalizePermissionList(user))

  if (candidates.some(permission => permissions.has(permission))) return true

  const modulePermissions = user.modulePermissions || user.ModulePermissions || {}
  if (candidates.some(permission => modulePermissions[permission])) return true

  const subPermissions = user.subPermissions || user.SubPermissions || {}
  return candidates.some(candidate => {
    const [moduleName, actionName] = candidate.split('.')
    const moduleSubs = toArray(subPermissions[moduleName])

    return moduleSubs.includes(candidate) || moduleSubs.includes(actionName)
  })
}

export function hasExplicitAdminPermission(user, permissionCandidates) {
  if (!user) return false
  if (user.isSuperAdmin) return true

  const candidates = new Set(toArray(permissionCandidates).map(normalizeKey).filter(Boolean))
  if (candidates.size === 0) return false

  const permissions = new Set(normalizePermissionList(user).map(normalizeKey))
  if ([...candidates].some(permission => permissions.has(permission))) return true

  const modulePermissions = user.modulePermissions || user.ModulePermissions || {}
  if (Object.entries(modulePermissions).some(([permission, allowed]) => (
    candidates.has(normalizeKey(permission)) && truthyPermission(allowed)
  ))) {
    return true
  }

  const subPermissions = user.subPermissions || user.SubPermissions || {}
  return Object.entries(subPermissions).some(([moduleName, values]) => (
    toArray(values).some(value => {
      const normalizedValue = normalizeKey(value)
      const fullyQualified = `${normalizeKey(moduleName)}.${normalizedValue}`

      return candidates.has(normalizedValue) || candidates.has(fullyQualified)
    })
  ))
}

export function canAccessRoute(user, routePermission) {
  if (!routePermission) return true
  return hasAdminPermission(user, routePermission)
}
