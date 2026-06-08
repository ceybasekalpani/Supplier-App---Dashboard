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
    { id: 'view_stats', label: 'View Statistics & Cards', description: 'View total suppliers and request counts' },
    { id: 'view_graphs', label: 'View Graphs', description: 'Access request status overview graphs' },
    { id: 'quick_actions', label: 'Quick Actions', description: 'Use quick approve buttons for requests' },
    { id: 'view_activity', label: 'View Activity Feed', description: 'See recent activity table' },
  ],
  suppliers: [
    { id: 'search', label: 'Search Suppliers', description: 'Search by RegNo/Name/Route' },
    { id: 'view_table', label: 'View Supplier Table', description: 'See all supplier details in table' },
    { id: 'view_history', label: 'View Request History', description: 'Access advance, fertilizer, item request history' },
    { id: 'export', label: 'Export Data', description: 'Export supplier list' },
  ],
  requests: [
    { id: 'view_advance', label: 'View Advance Requests', description: 'Access advance request management' },
    { id: 'view_fertilizer', label: 'View Fertilizer Requests', description: 'Access fertilizer request management' },
    { id: 'view_items', label: 'View Item Requests', description: 'Access item request management' },
    { id: 'approve_reject', label: 'Approve/Reject Requests', description: 'Ability to approve or reject requests' },
    { id: 'view_supply_profile', label: 'View Supply Profile', description: 'See supplier personal/bank/land info' },
    { id: 'view_supply_history', label: 'View Supply History', description: 'See leaf weight delivery logs' },
    { id: 'add_remarks', label: 'Add Remarks/Notes', description: 'Add notes to requests' },
    { id: 'filter_requests', label: 'Filter Requests', description: 'Filter by status, search, route' },
  ],
  configurations: [
    { id: 'view_fertilizer', label: 'View Fertilizer Types', description: 'See fertilizer management table' },
    { id: 'view_items', label: 'View Item Types', description: 'See item management table' },
    { id: 'add_fertilizer', label: 'Add Fertilizer Type', description: 'Create new fertilizer types' },
    { id: 'add_items', label: 'Add Item Type', description: 'Create new item types' },
    { id: 'edit_types', label: 'Edit Types', description: 'Edit fertilizer/item types' },
  ],
  communication: [
    { id: 'view_news', label: 'View News', description: 'See news management table' },
    { id: 'view_notifications', label: 'View Notifications', description: 'See notification management table' },
    { id: 'create_news', label: 'Create News', description: 'Add new news articles' },
    { id: 'create_notifications', label: 'Create Notifications', description: 'Add new notifications' },
    { id: 'edit_news', label: 'Edit News', description: 'Edit existing news' },
    { id: 'edit_notifications', label: 'Edit Notifications', description: 'Edit existing notifications' },
    { id: 'delete_news', label: 'Delete News', description: 'Remove news articles' },
    { id: 'delete_notifications', label: 'Delete Notifications', description: 'Remove notifications' },
    { id: 'schedule', label: 'Schedule Notifications', description: 'Set schedule for notifications' },
  ],
  userManagement: [
    { id: 'view_users', label: 'View Users', description: 'See all system users' },
    { id: 'add_users', label: 'Add Users', description: 'Create new users' },
    { id: 'edit_users', label: 'Edit Users', description: 'Modify user details' },
    { id: 'delete_users', label: 'Delete Users', description: 'Remove users from system' },
    { id: 'assign_roles', label: 'Assign Roles', description: 'Change user roles' },
    { id: 'reset_passwords', label: 'Reset Passwords', description: 'Force password reset' },
  ],
  settings: [
    { id: 'view_settings', label: 'View Settings', description: 'See system configuration' },
    { id: 'edit_settings', label: 'Edit Settings', description: 'Modify system settings' },
    { id: 'view_audit', label: 'View Audit Trail', description: 'Access audit logs' },
    { id: 'backup_restore', label: 'Backup/Restore', description: 'System backup operations' },
  ],
}

export const roleModulePermissionDefaults = {
  'Super Admin': { dashboard: true, suppliers: true, requests: true, configurations: true, communication: true, userManagement: true, settings: true },
  Admin: { dashboard: true, suppliers: true, requests: true, configurations: true, communication: true, userManagement: true, settings: false },
  Support: { dashboard: true, suppliers: false, requests: true, configurations: false, communication: true, userManagement: false, settings: false },
  Viewer: { dashboard: true, suppliers: true, requests: true, configurations: false, communication: false, userManagement: false, settings: false },
}

export const roleSubPermissionDefaults = {
  'Super Admin': {
    dashboard: ['view_stats', 'view_graphs', 'quick_actions', 'view_activity'],
    suppliers: ['search', 'view_table', 'view_history', 'export'],
    requests: ['view_advance', 'view_fertilizer', 'view_items', 'approve_reject', 'view_supply_profile', 'view_supply_history', 'add_remarks', 'filter_requests'],
    configurations: ['view_fertilizer', 'view_items', 'add_fertilizer', 'add_items', 'edit_types'],
    communication: ['view_news', 'view_notifications', 'create_news', 'create_notifications', 'edit_news', 'edit_notifications', 'delete_news', 'delete_notifications', 'schedule'],
    userManagement: ['view_users', 'add_users', 'edit_users', 'delete_users', 'assign_roles', 'reset_passwords'],
    settings: ['view_settings', 'edit_settings', 'view_audit', 'backup_restore'],
  },
  Admin: {
    dashboard: ['view_stats', 'view_graphs', 'quick_actions', 'view_activity'],
    suppliers: ['search', 'view_table', 'view_history', 'export'],
    requests: ['view_advance', 'view_fertilizer', 'view_items', 'approve_reject', 'view_supply_profile', 'view_supply_history', 'add_remarks', 'filter_requests'],
    configurations: ['view_fertilizer', 'view_items', 'add_fertilizer', 'add_items', 'edit_types'],
    communication: ['view_news', 'view_notifications', 'create_news', 'create_notifications', 'edit_news', 'edit_notifications', 'delete_news', 'delete_notifications', 'schedule'],
    userManagement: ['view_users', 'add_users', 'edit_users', 'delete_users', 'assign_roles', 'reset_passwords'],
    settings: [],
  },
  Support: {
    dashboard: ['view_stats', 'view_graphs', 'view_activity'],
    suppliers: [],
    requests: ['view_advance', 'view_fertilizer', 'view_items', 'approve_reject', 'view_supply_profile', 'view_supply_history', 'add_remarks', 'filter_requests'],
    configurations: [],
    communication: ['view_news', 'view_notifications', 'create_news', 'create_notifications', 'edit_news', 'edit_notifications'],
    userManagement: [],
    settings: [],
  },
  Viewer: {
    dashboard: ['view_stats', 'view_graphs', 'view_activity'],
    suppliers: ['search', 'view_table', 'view_history'],
    requests: ['view_advance', 'view_fertilizer', 'view_items', 'view_supply_profile', 'view_supply_history', 'filter_requests'],
    configurations: [],
    communication: [],
    userManagement: [],
    settings: [],
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
