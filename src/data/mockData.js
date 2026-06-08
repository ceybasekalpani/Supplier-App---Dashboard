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

export const adminUsers = [
  { id: 1, name: 'Rajitha Bandara',    role: 'Super Admin', status: 'active',   email: 'rajitha@factory.lk'  },
  { id: 2, name: 'Chaminda Wickrama',  role: 'Manager',     status: 'active',   email: 'chaminda@factory.lk' },
  { id: 3, name: 'Nadeeka Perera',     role: 'Viewer',      status: 'inactive', email: 'nadeeka@factory.lk'  },
]

export const roles = [
  {
    id: 1, name: 'Super Admin',
    permissions: { dashboard: true, suppliers: true, requests: true, configurations: true, communication: true, userManagement: true, settings: true },
  },
  {
    id: 2, name: 'Manager',
    permissions: { dashboard: true, suppliers: true, requests: true, configurations: false, communication: true, userManagement: false, settings: false },
  },
  {
    id: 3, name: 'Viewer',
    permissions: { dashboard: true, suppliers: true, requests: false, configurations: false, communication: false, userManagement: false, settings: false },
  },
]

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
