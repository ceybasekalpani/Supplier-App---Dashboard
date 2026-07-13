import { useEffect } from 'react'
import { useAdminStore } from '../store/adminStore'

export function useCurrentAdmin() {
  const currentAdmin = useAdminStore(state => state.currentAdmin)
  const hydratePermissions = useAdminStore(state => state.hydratePermissions)

  useEffect(() => {
    hydratePermissions()
  }, [hydratePermissions])

  return currentAdmin
}
