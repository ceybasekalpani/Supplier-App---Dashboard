import {
  Banknote, Bell, CheckCircle, Flower2, LayoutDashboard, Lock,
  Newspaper, Package, Send, ShoppingBag, Sprout, UserCog, Users,
} from 'lucide-react'

export const moduleIconMap = {
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

export const emptyPermissions = { modulePermissions: {}, subPermissions: {} }
