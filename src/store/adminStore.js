import { create } from 'zustand'
import { adminAuthStorage } from '../services/adminApiClient'
import { dashboardPermissionsApi } from '../services/dashboardPermissionsApi'

export const useAdminStore = create((set) => ({
  currentAdmin: adminAuthStorage.getUser(),

  setCurrentAdmin(admin) {
    adminAuthStorage.setUser(admin)
    set({ currentAdmin: admin })
  },

  async hydratePermissions() {
    const admin = adminAuthStorage.getUser()
    if (!admin?.id || admin.isSuperAdmin) return

    try {
      const permissions = await dashboardPermissionsApi.getUserPermissions(admin.id)
      const updatedAdmin = {
        ...admin,
        hasPermissionData: true,
        modulePermissions: permissions.modulePermissions || {},
        subPermissions: permissions.subPermissions || {},
      }
      adminAuthStorage.setUser(updatedAdmin)
      set({ currentAdmin: updatedAdmin })
    } catch {
      set({ currentAdmin: admin })
    }
  },
}))
