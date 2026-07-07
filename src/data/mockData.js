export const suppliers = [
  { id: 1, regNo: 'SUP001', name: 'Kamal Perera',     route: 'Route A', phone: '0771234567', address: 'Kandy',        bank: 'BOC',        branch: 'Kandy',        accountNo: '7012345678', payment: 'Bank Transfer', status: 'active',   land: { acres: 2, rood: 1, perch: 12 } },
  { id: 2, regNo: 'SUP002', name: 'Saman Silva',      route: 'Route B', phone: '0779876543', address: 'Galle',        bank: 'NSB',        branch: 'Galle',        accountNo: '2098765431', payment: 'Cash',          status: 'active',   land: { acres: 1, rood: 3, perch: 4 } },
  { id: 3, regNo: 'SUP003', name: 'Nimal Fernando',   route: 'Route A', phone: '0762345678', address: 'Matara',       bank: 'HNB',        branch: 'Matara',       accountNo: '5544332211', payment: 'Cheque',        status: 'inactive', land: { acres: 3, rood: 0, perch: 18 } },
  { id: 4, regNo: 'SUP004', name: 'Sunil Jayasinghe', route: 'Route C', phone: '0753456789', address: 'Ratnapura',    bank: "People's",   branch: 'Ratnapura',    accountNo: '8844221199', payment: 'Bank Transfer', status: 'active',   land: { acres: 2, rood: 2, perch: 9 } },
  { id: 5, regNo: 'SUP005', name: 'Priya Kumari',     route: 'Route B', phone: '0714567890', address: 'Nuwara Eliya', bank: 'Commercial', branch: 'Nuwara Eliya', accountNo: '3344556677', payment: 'Bank Transfer', status: 'active',   land: { acres: 1, rood: 2, perch: 30 } },
]

export const advanceRequests = [
  { id: 1, regNo: 'SUP001', name: 'Kamal Perera',     amount: 25000, paymentType: 'Bank Transfer', date: '2026-06-02', status: 'pending',  checkedBy: '-',     remarks: '' },
  { id: 2, regNo: 'SUP002', name: 'Saman Silva',      amount: 15000, paymentType: 'Cash',          date: '2026-05-10', status: 'approved', checkedBy: 'Admin', remarks: 'Verified' },
  { id: 3, regNo: 'SUP003', name: 'Nimal Fernando',   amount: 30000, paymentType: 'Cheque',        date: '2026-05-08', status: 'rejected', checkedBy: 'Admin', remarks: 'Insufficient leaf' },
  { id: 4, regNo: 'SUP004', name: 'Sunil Jayasinghe', amount: 20000, paymentType: 'Bank Transfer', date: '2026-06-01', status: 'pending',  checkedBy: '-',     remarks: '' },
  { id: 5, regNo: 'SUP005', name: 'Priya Kumari',     amount: 18000, paymentType: 'Bank Transfer', date: '2026-05-13', status: 'approved', checkedBy: 'Admin', remarks: 'OK' },
  { id: 6, regNo: 'SUP001', name: 'Kamal Perera',     amount: 12000, paymentType: 'Cheque',        date: '2026-05-20', status: 'approved', checkedBy: 'Admin', remarks: 'Previous month request' },
]

export const fertilizerRequests = [
  { id: 1, regNo: 'SUP001', name: 'Kamal Perera',     type: 'Urea', qty: 50, unit: 'kg', date: '2026-06-02', status: 'pending',  checkedBy: '-'     },
  { id: 2, regNo: 'SUP002', name: 'Saman Silva',      type: 'TSP',  qty: 25, unit: 'kg', date: '2026-05-10', status: 'approved', checkedBy: 'Admin' },
  { id: 3, regNo: 'SUP004', name: 'Sunil Jayasinghe', type: 'Urea', qty: 75, unit: 'kg', date: '2026-06-01', status: 'pending',  checkedBy: '-'     },
]

export const itemRequests = [
  { id: 1, regNo: 'SUP001', name: 'Kamal Perera',   type: 'Harvesting Bag', qty: 10, unit: 'pcs',   date: '2026-06-02', status: 'pending',  checkedBy: '-'     },
  { id: 2, regNo: 'SUP003', name: 'Nimal Fernando', type: 'Gloves',         qty: 5,  unit: 'pairs', date: '2026-05-09', status: 'approved', checkedBy: 'Admin' },
]

export const leafRates = [
  { month: '2026-05', superRate: 240, normalRate: 190 },
  { month: '2026-06', superRate: 255, normalRate: 205 },
]

export const leafDeliveries = [
  { regNo: 'SUP001', date: '2026-05-10', superNet: 18, normalNet: 26 },
  { regNo: 'SUP001', date: '2026-05-18', superNet: 24, normalNet: 31 },
  { regNo: 'SUP001', date: '2026-05-28', superNet: 20, normalNet: 22 },
  { regNo: 'SUP001', date: '2026-06-01', superNet: 16, normalNet: 27 },
  { regNo: 'SUP001', date: '2026-06-10', superNet: 21, normalNet: 30 },
  { regNo: 'SUP002', date: '2026-05-12', superNet: 12, normalNet: 29 },
  { regNo: 'SUP002', date: '2026-06-03', superNet: 15, normalNet: 25 },
  { regNo: 'SUP003', date: '2026-05-14', superNet: 22, normalNet: 18 },
  { regNo: 'SUP003', date: '2026-06-02', superNet: 19, normalNet: 20 },
  { regNo: 'SUP004', date: '2026-05-16', superNet: 25, normalNet: 34 },
  { regNo: 'SUP004', date: '2026-06-04', superNet: 20, normalNet: 28 },
  { regNo: 'SUP005', date: '2026-05-20', superNet: 16, normalNet: 22 },
  { regNo: 'SUP005', date: '2026-06-03', superNet: 18, normalNet: 24 },
]

export const fertilizerTypes = [
  { id: 1, name: 'Urea',                     qty: 500,  status: 'active'   },
  { id: 2, name: 'TSP (Triple Superphosphate)', qty: 300, status: 'active'  },
  { id: 3, name: 'Potassium Chloride',        qty: 200,  status: 'inactive' },
  { id: 4, name: 'Organic Compost',           qty: 1000, status: 'active'   },
]

export const itemTypes = [
  { id: 1, name: 'Harvesting Bag', qty: 200, status: 'active'   },
  { id: 2, name: 'Pruning Gloves', qty: 150, status: 'active'   },
  { id: 3, name: 'Pruning Shear',  qty: 80,  status: 'inactive' },
  { id: 4, name: 'Rain Coat',      qty: 60,  status: 'active'   },
]

export const approvedAdvances = [
  { id: 1, regNo: 'REG001', supplierName: 'Kamal Perera', approvedAmount: 50000, approvedDate: '2026-06-01', status: 'pending_issue', route: 'route_a', issued: false },
  { id: 2, regNo: 'REG002', supplierName: 'Sunil Silva', approvedAmount: 75000, approvedDate: '2026-06-03', status: 'pending_issue', route: 'route_b', issued: false },
  { id: 3, regNo: 'REG003', supplierName: 'Nimal Jayawardena', approvedAmount: 30000, approvedDate: '2026-06-05', status: 'pending_issue', route: 'route_a', issued: false },
]

export const approvedFertilizers = [
  { id: 1, regNo: 'REG001', supplierName: 'Kamal Perera', fertilizerType: 'Urea', approvedQty: 50, unit: 'kg', approvedDate: '2026-06-02', status: 'pending_issue', route: 'route_a', issued: false },
  { id: 2, regNo: 'REG004', supplierName: 'Thusitha Bandara', fertilizerType: 'Potash', approvedQty: 30, unit: 'kg', approvedDate: '2026-06-04', status: 'pending_issue', route: 'route_c', issued: false },
  { id: 3, regNo: 'REG005', supplierName: 'Ruwan Wickrama', fertilizerType: 'Super Phosphate', approvedQty: 40, unit: 'kg', approvedDate: '2026-06-06', status: 'pending_issue', route: 'route_b', issued: false },
]

export const approvedItems = [
  { id: 1, regNo: 'REG002', supplierName: 'Sunil Silva', itemType: 'Harvesting Bag', approvedQty: 100, unit: 'pcs', approvedDate: '2026-06-02', status: 'pending_issue', route: 'route_b', issued: false },
  { id: 2, regNo: 'REG003', supplierName: 'Nimal Jayawardena', itemType: 'Pruning Shears', approvedQty: 25, unit: 'pcs', approvedDate: '2026-06-04', status: 'pending_issue', route: 'route_a', issued: false },
  { id: 3, regNo: 'REG006', supplierName: 'Chaminda Rajapaksa', itemType: 'Leaf Collection Basket', approvedQty: 15, unit: 'pcs', approvedDate: '2026-06-06', status: 'pending_issue', route: 'route_c', issued: false },
]

export const routeOptions = [
  { id: 'all', name: 'All Routes' },
  { id: 'route_a', name: 'Route A - Kandy' },
  { id: 'route_b', name: 'Route B - Gampola' },
  { id: 'route_c', name: 'Route C - Nawalapitiya' },
]

export const disbursementTrackingRows = [
  { id: 1, regNo: 'REG001', supplierName: 'Kamal Perera', issuedType: 'advance', issuedDetails: 'Rs. 50,000', amount: 50000, requestDate: '2026-05-29', approvedDate: '2026-06-01', issueDate: '2026-06-01', currentStatus: 'awaiting', method: 'Bank Transfer', route: 'Route A' },
  { id: 2, regNo: 'REG002', supplierName: 'Sunil Silva', issuedType: 'fertilizer', issuedDetails: 'Urea - 50 kg', itemName: 'Urea', qty: 50, unit: 'kg', requestDate: '2026-05-30', approvedDate: '2026-06-02', issueDate: '2026-06-02', currentStatus: 'awaiting', method: 'Physical Delivery', route: 'Route B' },
  { id: 3, regNo: 'REG003', supplierName: 'Nimal Jayawardena', issuedType: 'items', issuedDetails: 'Harvesting Bag - 100 pcs', itemName: 'Harvesting Bag', qty: 100, unit: 'pcs', requestDate: '2026-05-31', approvedDate: '2026-06-03', issueDate: '2026-06-03', completedDate: '2026-06-03', completedBy: 'Admin', completedDevice: 'Factory Office Desktop', currentStatus: 'completed', method: 'Physical Delivery', route: 'Route A' },
  { id: 4, regNo: 'REG004', supplierName: 'Thusitha Bandara', issuedType: 'fertilizer', issuedDetails: 'Potash - 30 kg', itemName: 'Potash', qty: 30, unit: 'kg', requestDate: '2026-06-01', approvedDate: '2026-06-04', issueDate: '2026-06-04', currentStatus: 'awaiting', method: 'Physical Delivery', route: 'Route C' },
  { id: 5, regNo: 'REG005', supplierName: 'Ruwan Wickrama', issuedType: 'advance', issuedDetails: 'Rs. 75,000', amount: 75000, requestDate: '2026-06-02', approvedDate: '2026-06-05', issueDate: '2026-06-05', completedDate: '2026-06-05', completedBy: 'Admin', completedDevice: 'Factory Office Desktop', currentStatus: 'completed', method: 'Cheque', route: 'Route B' },
]

export const userRoles = [
  { id: 1, name: 'Super Admin' },
  { id: 2, name: 'Admin' },
  { id: 3, name: 'Support' },
  { id: 4, name: 'Viewer' },
]

export const systemUsers = [
  { id: 1, name: 'Dr. Chamara Silva', email: 'chamara@agri.lk', username: 'chamara.s', password: '123456', phoneNo: '+94 77 123 4567', role: 'Super Admin', status: 'active', avatar: null, createdAt: '2024-01-15' },
  { id: 2, name: 'Kumari Wickramasinghe', email: 'kumari@agri.lk', username: 'kumari.w', password: '123456', phoneNo: '+94 71 234 5678', role: 'Admin', status: 'active', avatar: null, createdAt: '2024-02-10' },
  { id: 3, name: 'Nuwan Perera', email: 'nuwan@agri.lk', username: 'nuwan.p', password: '123456', phoneNo: '+94 70 345 6789', role: 'Support', status: 'inactive', avatar: null, createdAt: '2024-02-20' },
  { id: 4, name: 'Amal Rathnayake', email: 'amal@agri.lk', username: 'amal.r', password: '123456', phoneNo: '+94 76 456 7890', role: 'Viewer', status: 'active', avatar: null, createdAt: '2024-03-05' },
]

export const permissionCatalog = {
  dashboard: [
    { id: 'dashboard.view', label: 'View Dashboard', description: 'View analytics, KPI cards, and graphs' },
    { id: 'dashboard.quickActions', label: 'Access Quick Actions', description: 'Use the quick-navigation panel to jump to pending approval queues' },
  ],
  suppliers: [
    { id: 'suppliers.view', label: 'View Suppliers', description: 'View supplier profiles, search, and history' },
  ],
  cashRequests: [
    { id: 'cashRequests.view', label: 'View Cash Requests', description: 'View advance and loan cash requests' },
    { id: 'cashRequests.approve', label: 'Approve Cash Requests', description: 'Approve, reject, or override the status of cash requests' },
  ],
  fertilizerRequests: [
    { id: 'fertilizerRequests.view', label: 'View Fertilizer Requests', description: 'View fertilizer requests' },
    { id: 'fertilizerRequests.approve', label: 'Approve Fertilizer Requests', description: 'Approve, reject, or override the status of fertilizer requests' },
  ],
  itemRequests: [
    { id: 'itemRequests.view', label: 'View Item Requests', description: 'View item requests' },
    { id: 'itemRequests.approve', label: 'Approve Item Requests', description: 'Approve, reject, or override the status of item requests' },
  ],
  disbursements: [
    { id: 'disbursements.view', label: 'View Disbursements', description: 'View disbursement records' },
    { id: 'disbursements.create', label: 'Create Disbursements', description: 'Issue new disbursement records' },
    { id: 'disbursements.update', label: 'Update Disbursements', description: 'Edit disbursement records' },
    { id: 'disbursements.export', label: 'Export Disbursements', description: 'Export disbursement data to file' },
  ],
  disbursementTracking: [
    { id: 'disbursementTracking.view', label: 'View Disbursement Tracking', description: 'Track disbursement and delivery note progress' },
    { id: 'disbursementTracking.update', label: 'Update Disbursement Tracking', description: 'Mark disbursements as received' },
    { id: 'disbursementTracking.export', label: 'Export Disbursement Tracking', description: 'Export disbursement tracking data to file' },
  ],
  fertilizerConfiguration: [
    { id: 'fertilizerConfiguration.view', label: 'View Fertilizer Configuration', description: 'View fertilizer types' },
    { id: 'fertilizerConfiguration.create', label: 'Create Fertilizer Configuration', description: 'Add new fertilizer types' },
    { id: 'fertilizerConfiguration.update', label: 'Update Fertilizer Configuration', description: 'Edit or activate/deactivate fertilizer types' },
  ],
  itemConfiguration: [
    { id: 'itemConfiguration.view', label: 'View Item Configuration', description: 'View item types' },
    { id: 'itemConfiguration.create', label: 'Create Item Configuration', description: 'Add new item types' },
    { id: 'itemConfiguration.update', label: 'Update Item Configuration', description: 'Edit or activate/deactivate item types' },
  ],
  news: [
    { id: 'news.view', label: 'View News', description: 'View news announcements' },
    { id: 'news.create', label: 'Create News', description: 'Publish new news announcements' },
    { id: 'news.update', label: 'Update News', description: 'Edit news announcements' },
    { id: 'news.delete', label: 'Delete News', description: 'Remove news announcements' },
  ],
  notifications: [
    { id: 'notifications.view', label: 'View Notifications', description: 'View notification history' },
    { id: 'notifications.create', label: 'Create Notifications', description: 'Draft and send new notifications' },
    { id: 'notifications.update', label: 'Update Notifications', description: 'Edit draft or scheduled notifications' },
    { id: 'notifications.delete', label: 'Delete Notifications', description: 'Remove notifications' },
  ],
  userManagement: [
    { id: 'userManagement.view', label: 'View Dashboard Users', description: 'View dashboard admin accounts' },
    { id: 'userManagement.create', label: 'Create Dashboard Users', description: 'Create new dashboard admin accounts' },
    { id: 'userManagement.update', label: 'Update Dashboard Users', description: 'Edit dashboard admin accounts, including status and password' },
    { id: 'userManagement.delete', label: 'Delete Dashboard Users', description: 'Remove dashboard admin accounts' },
  ],
  permissionManagement: [
    { id: 'permissionManagement.view', label: 'View Permissions', description: 'View dashboard user permission assignments' },
    { id: 'permissionManagement.assign', label: 'Assign Permissions', description: 'Grant or revoke module and action permissions for dashboard users' },
  ],
}

export const roleModulePermissionDefaults = {
  'Super Admin': { dashboard: true, suppliers: true, cashRequests: true, fertilizerRequests: true, itemRequests: true, disbursements: true, disbursementTracking: true, fertilizerConfiguration: true, itemConfiguration: true, news: true, notifications: true, userManagement: true, permissionManagement: true },
  Admin: { dashboard: true, suppliers: true, cashRequests: true, fertilizerRequests: true, itemRequests: true, disbursements: true, disbursementTracking: true, fertilizerConfiguration: true, itemConfiguration: true, news: true, notifications: true, userManagement: true, permissionManagement: false },
  Support: { dashboard: true, suppliers: false, cashRequests: true, fertilizerRequests: true, itemRequests: true, disbursements: false, disbursementTracking: false, fertilizerConfiguration: false, itemConfiguration: false, news: true, notifications: true, userManagement: false, permissionManagement: false },
  Viewer: { dashboard: true, suppliers: true, cashRequests: true, fertilizerRequests: true, itemRequests: true, disbursements: false, disbursementTracking: false, fertilizerConfiguration: false, itemConfiguration: false, news: false, notifications: false, userManagement: false, permissionManagement: false },
}

export const roleSubPermissionDefaults = {
  'Super Admin': {
    dashboard: ['dashboard.view', 'dashboard.quickActions'],
    suppliers: ['suppliers.view'],
    cashRequests: ['cashRequests.view', 'cashRequests.approve'],
    fertilizerRequests: ['fertilizerRequests.view', 'fertilizerRequests.approve'],
    itemRequests: ['itemRequests.view', 'itemRequests.approve'],
    disbursements: ['disbursements.view', 'disbursements.create', 'disbursements.update', 'disbursements.export'],
    disbursementTracking: ['disbursementTracking.view', 'disbursementTracking.update', 'disbursementTracking.export'],
    fertilizerConfiguration: ['fertilizerConfiguration.view', 'fertilizerConfiguration.create', 'fertilizerConfiguration.update'],
    itemConfiguration: ['itemConfiguration.view', 'itemConfiguration.create', 'itemConfiguration.update'],
    news: ['news.view', 'news.create', 'news.update', 'news.delete'],
    notifications: ['notifications.view', 'notifications.create', 'notifications.update', 'notifications.delete'],
    userManagement: ['userManagement.view', 'userManagement.create', 'userManagement.update', 'userManagement.delete'],
    permissionManagement: ['permissionManagement.view', 'permissionManagement.assign'],
  },
  Admin: {
    dashboard: ['dashboard.view', 'dashboard.quickActions'],
    suppliers: ['suppliers.view'],
    cashRequests: ['cashRequests.view', 'cashRequests.approve'],
    fertilizerRequests: ['fertilizerRequests.view', 'fertilizerRequests.approve'],
    itemRequests: ['itemRequests.view', 'itemRequests.approve'],
    disbursements: ['disbursements.view', 'disbursements.create', 'disbursements.update', 'disbursements.export'],
    disbursementTracking: ['disbursementTracking.view', 'disbursementTracking.update', 'disbursementTracking.export'],
    fertilizerConfiguration: ['fertilizerConfiguration.view', 'fertilizerConfiguration.create', 'fertilizerConfiguration.update'],
    itemConfiguration: ['itemConfiguration.view', 'itemConfiguration.create', 'itemConfiguration.update'],
    news: ['news.view', 'news.create', 'news.update', 'news.delete'],
    notifications: ['notifications.view', 'notifications.create', 'notifications.update', 'notifications.delete'],
    userManagement: ['userManagement.view', 'userManagement.create', 'userManagement.update', 'userManagement.delete'],
    permissionManagement: [],
  },
  Support: {
    dashboard: ['dashboard.view'],
    suppliers: [],
    cashRequests: ['cashRequests.view', 'cashRequests.approve'],
    fertilizerRequests: ['fertilizerRequests.view', 'fertilizerRequests.approve'],
    itemRequests: ['itemRequests.view', 'itemRequests.approve'],
    disbursements: [],
    disbursementTracking: [],
    fertilizerConfiguration: [],
    itemConfiguration: [],
    news: ['news.view', 'news.create', 'news.update'],
    notifications: ['notifications.view', 'notifications.create', 'notifications.update'],
    userManagement: [],
    permissionManagement: [],
  },
  Viewer: {
    dashboard: ['dashboard.view'],
    suppliers: ['suppliers.view'],
    cashRequests: ['cashRequests.view'],
    fertilizerRequests: ['fertilizerRequests.view'],
    itemRequests: ['itemRequests.view'],
    disbursements: [],
    disbursementTracking: [],
    fertilizerConfiguration: [],
    itemConfiguration: [],
    news: [],
    notifications: [],
    userManagement: [],
    permissionManagement: [],
  },
}

export const newsItems = [
  { id: 1, title: 'Tea Price Increase Notice',      description: 'Prices revised upward for May 2026',           created: '2026-05-01', expiry: '2026-06-01', status: 'active'  },
  { id: 2, title: 'Fertilizer Distribution Schedule', description: 'New schedule for June fertilizer distribution', created: '2026-04-25', expiry: '2026-06-15', status: 'active'  },
  { id: 3, title: 'Public Holiday Notice',          description: 'Factory closed on May 22nd',                   created: '2026-04-20', expiry: '2026-05-23', status: 'expired' },
  { id: 4, title: 'New Advance Policy',             description: 'Updated advance request limits',               created: '2026-05-10', expiry: '2026-12-31', status: 'draft'   },
]

export const notifications = [
  { id: 1, title: 'Advance Request Approved',  message: 'Your advance of Rs.15,000 has been approved',  status: 'delivered' },
  { id: 2, title: 'Fertilizer Dispatch Ready', message: 'Your 50kg Urea is ready for collection',        status: 'delivered' },
  { id: 3, title: 'System Maintenance',        message: 'Scheduled maintenance on June 5th',             status: 'failed'    },
]

export const adminUsers = systemUsers

export const roles = userRoles.map(role => ({
  ...role,
  permissions: roleModulePermissionDefaults[role.name] || roleModulePermissionDefaults.Viewer,
}))

export const chartData = [
  { name: 'Jan', advance: 12, fertilizer: 6,  items: 4 },
  { name: 'Feb', advance: 8,  fertilizer: 9,  items: 6 },
  { name: 'Mar', advance: 15, fertilizer: 5,  items: 8 },
  { name: 'Apr', advance: 10, fertilizer: 11, items: 5 },
  { name: 'May', advance: 18, fertilizer: 7,  items: 9 },
  { name: 'Jun', advance: 14, fertilizer: 12, items: 7 },
]

export const leafHistory = [
  { month: 'Jan', kg: 420 },
  { month: 'Feb', kg: 390 },
  { month: 'Mar', kg: 460 },
  { month: 'Apr', kg: 410 },
  { month: 'May', kg: 480 },
  { month: 'Jun', kg: 440 },
]

export const activities = [
  { user: 'Kamal Perera',     action: 'Requested Rs.25,000 advance',           category: 'advance',    time: '5 mins ago',  status: 'pending'  },
  { user: 'Admin',            action: 'Approved Rs.15,000 for Saman Silva',    category: 'advance',    time: '1 hr ago',    status: 'approved' },
  { user: 'Priya Kumari',     action: 'Requested 50kg Urea fertilizer',        category: 'fertilizer', time: '2 hrs ago',   status: 'pending'  },
  { user: 'Admin',            action: 'Approved Saman Silva fertilizer',       category: 'fertilizer', time: '3 hrs ago',   status: 'approved' },
  { user: 'Nimal Fernando',   action: 'Rejected — Insufficient leaf history',  category: 'advance',    time: '5 hrs ago',   status: 'rejected' },
  { user: 'Sunil Jayasinghe', action: 'Requested 10 Harvesting Bags',         category: 'items',      time: '6 hrs ago',   status: 'pending'  },
  { user: 'Admin',            action: 'Approved gloves for Nimal Fernando',    category: 'items',      time: '1 day ago',   status: 'approved' },
  { user: 'Kamal Perera',     action: 'Requested 50kg Urea fertilizer',        category: 'fertilizer', time: '2 days ago',  status: 'pending'  },
  { user: 'Admin',            action: 'Approved Rs.18,000 for Priya Kumari',   category: 'advance',    time: '2 days ago',  status: 'approved' },
  { user: 'Saman Silva',      action: 'Requested Rs.15,000 advance',           category: 'advance',    time: '3 days ago',  status: 'approved' },
]
