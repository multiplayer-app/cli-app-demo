export const revenueData = [
  { month: 'Jan', revenue: 4200, expenses: 2800, profit: 1400 },
  { month: 'Feb', revenue: 4800, expenses: 3100, profit: 1700 },
  { month: 'Mar', revenue: 5100, expenses: 2900, profit: 2200 },
  { month: 'Apr', revenue: 4600, expenses: 3200, profit: 1400 },
  { month: 'May', revenue: 5800, expenses: 3000, profit: 2800 },
  { month: 'Jun', revenue: 6200, expenses: 3400, profit: 2800 },
  { month: 'Jul', revenue: 5900, expenses: 3100, profit: 2800 },
  { month: 'Aug', revenue: 6800, expenses: 3500, profit: 3300 },
  { month: 'Sep', revenue: 7200, expenses: 3800, profit: 3400 },
  { month: 'Oct', revenue: 6900, expenses: 3600, profit: 3300 },
  { month: 'Nov', revenue: 7500, expenses: 3900, profit: 3600 },
  { month: 'Dec', revenue: 8100, expenses: 4100, profit: 4000 },
]

export const trafficData = [
  { name: 'Direct', value: 4200, color: '#6366f1' },
  { name: 'Organic', value: 3100, color: '#22c55e' },
  { name: 'Referral', value: 2100, color: '#eab308' },
  { name: 'Social', value: 1800, color: '#ef4444' },
]

export const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'active', joined: '2024-01-15', avatar: 'AJ' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'active', joined: '2024-02-20', avatar: 'BS' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Viewer', status: 'inactive', joined: '2024-03-10', avatar: 'CW' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'Editor', status: 'active', joined: '2024-04-05', avatar: 'DB' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Admin', status: 'active', joined: '2024-05-12', avatar: 'ED' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'Viewer', status: 'pending', joined: '2024-06-18', avatar: 'FM' },
  { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'Editor', status: 'active', joined: '2024-07-22', avatar: 'GL' },
  { id: 8, name: 'Henry Wilson', email: 'henry@example.com', role: 'Viewer', status: 'inactive', joined: '2024-08-30', avatar: 'HW' },
  { id: 9, name: 'Iris Taylor', email: 'iris@example.com', role: 'Admin', status: 'active', joined: '2024-09-14', avatar: 'IT' },
  { id: 10, name: 'Jack Anderson', email: 'jack@example.com', role: 'Editor', status: 'pending', joined: '2024-10-01', avatar: 'JA' },
  { id: 11, name: 'Karen Thomas', email: 'karen@example.com', role: 'Viewer', status: 'active', joined: '2024-10-15', avatar: 'KT' },
  { id: 12, name: 'Leo Martinez', email: 'leo@example.com', role: 'Editor', status: 'active', joined: '2024-11-02', avatar: 'LM' },
]

export const orders = [
  { id: 'ORD-7821', customer: 'Alice Johnson', email: 'alice@example.com', items: 3, amount: 124.00, status: 'completed', date: '2024-12-01', payment: 'credit_card', shipping: 'express' },
  { id: 'ORD-7820', customer: 'Bob Smith', email: 'bob@example.com', items: 1, amount: 89.50, status: 'processing', date: '2024-12-01', payment: 'paypal', shipping: 'standard' },
  { id: 'ORD-7819', customer: 'Carol White', email: 'carol@example.com', items: 5, amount: 210.00, status: 'completed', date: '2024-11-30', payment: 'credit_card', shipping: 'express' },
  { id: 'ORD-7818', customer: 'David Brown', email: 'david@example.com', items: 2, amount: 55.00, status: 'pending', date: '2024-11-30', payment: 'bank_transfer', shipping: 'standard' },
  { id: 'ORD-7817', customer: 'Eve Davis', email: 'eve@example.com', items: 4, amount: 340.00, status: 'completed', date: '2024-11-29', payment: 'credit_card', shipping: 'overnight' },
  { id: 'ORD-7816', customer: 'Frank Miller', email: 'frank@example.com', items: 1, amount: 28.00, status: 'cancelled', date: '2024-11-29', payment: 'paypal', shipping: 'standard' },
  { id: 'ORD-7815', customer: 'Grace Lee', email: 'grace@example.com', items: 2, amount: 156.00, status: 'shipped', date: '2024-11-28', payment: 'credit_card', shipping: 'express' },
  { id: 'ORD-7814', customer: 'Henry Wilson', email: 'henry@example.com', items: 6, amount: 420.00, status: 'completed', date: '2024-11-28', payment: 'credit_card', shipping: 'express' },
  { id: 'ORD-7813', customer: 'Iris Taylor', email: 'iris@example.com', items: 1, amount: 75.00, status: 'refunded', date: '2024-11-27', payment: 'paypal', shipping: 'standard' },
  { id: 'ORD-7812', customer: 'Jack Anderson', email: 'jack@example.com', items: 3, amount: 198.00, status: 'shipped', date: '2024-11-27', payment: 'bank_transfer', shipping: 'standard' },
  { id: 'ORD-7811', customer: 'Karen Thomas', email: 'karen@example.com', items: 2, amount: 112.50, status: 'processing', date: '2024-11-26', payment: 'credit_card', shipping: 'express' },
  { id: 'ORD-7810', customer: 'Leo Martinez', email: 'leo@example.com', items: 1, amount: 64.00, status: 'completed', date: '2024-11-26', payment: 'paypal', shipping: 'standard' },
  { id: 'ORD-7809', customer: 'Alice Johnson', email: 'alice@example.com', items: 2, amount: 230.00, status: 'completed', date: '2024-11-25', payment: 'credit_card', shipping: 'overnight' },
  { id: 'ORD-7808', customer: 'Bob Smith', email: 'bob@example.com', items: 4, amount: 175.00, status: 'shipped', date: '2024-11-25', payment: 'credit_card', shipping: 'express' },
  { id: 'ORD-7807', customer: 'Carol White', email: 'carol@example.com', items: 1, amount: 42.00, status: 'pending', date: '2024-11-24', payment: 'bank_transfer', shipping: 'standard' },
]

export const activityData = [
  { day: 'Mon', visits: 1200, signups: 45, orders: 89 },
  { day: 'Tue', visits: 1400, signups: 52, orders: 95 },
  { day: 'Wed', visits: 1100, signups: 38, orders: 72 },
  { day: 'Thu', visits: 1600, signups: 61, orders: 110 },
  { day: 'Fri', visits: 1800, signups: 70, orders: 125 },
  { day: 'Sat', visits: 900, signups: 28, orders: 55 },
  { day: 'Sun', visits: 750, signups: 22, orders: 42 },
]

export const conversionData = [
  { month: 'Jan', rate: 2.4 },
  { month: 'Feb', rate: 2.8 },
  { month: 'Mar', rate: 3.1 },
  { month: 'Apr', rate: 2.9 },
  { month: 'May', rate: 3.5 },
  { month: 'Jun', rate: 3.8 },
  { month: 'Jul', rate: 3.6 },
  { month: 'Aug', rate: 4.1 },
  { month: 'Sep', rate: 4.3 },
  { month: 'Oct', rate: 4.0 },
  { month: 'Nov', rate: 4.5 },
  { month: 'Dec', rate: 4.8 },
]

export const notifications = [
  { id: 1, text: 'New user registered: Frank Miller', time: '2 min ago', read: false },
  { id: 2, text: 'Server CPU usage above 90%', time: '15 min ago', read: false },
  { id: 3, text: 'Monthly report generated', time: '1 hour ago', read: true },
  { id: 4, text: 'Payment received: $1,250.00', time: '3 hours ago', read: true },
  { id: 5, text: 'New feature deployed to production', time: '5 hours ago', read: true },
]
