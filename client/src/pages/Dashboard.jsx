import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  DollarSign,
  Users,
  TrendingUp,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  ArrowRight,
  Eye,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import TimedActionTooltip from '../components/TimedActionTooltip'
import './Dashboard.css'

const stats = [
  { label: 'Total Revenue', value: '$73,100', change: '+12.5%', positive: true, icon: DollarSign },
  { label: 'Active Users', value: '2,847', change: '+8.2%', positive: true, icon: Users },
  { label: 'Conversion Rate', value: '3.6%', change: '-0.4%', positive: false, icon: TrendingUp },
  { label: 'Avg. Order Value', value: '$84.30', change: '+2.1%', positive: true, icon: ShoppingCart }
]

const quickActions = [
  { label: 'Generate Report', icon: Download },
  { label: 'View Analytics', icon: Eye },
  { label: 'Sync Data', icon: RefreshCw }
]

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const fallbackRevenueData = []
const fallbackTrafficData = []
const fallbackOrders = []

export default function Dashboard() {
  const { showToast } = useToast()
  const [timeRange, setTimeRange] = useState('year')
  const [recentOrders, setRecentOrders] = useState(fallbackOrders)
  const [revenueData, setRevenueData] = useState(fallbackRevenueData)
  const [trafficData, setTrafficData] = useState(fallbackTrafficData)
  const [refreshing, setRefreshing] = useState(false)
  const [actionMenuId, setActionMenuId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        setLoadError('')

        const [usersRes, postsRes, commentsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/posts'),
          fetch('/api/comments')
        ])

        if (!usersRes.ok || !postsRes.ok || !commentsRes.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const [users, posts, comments] = await Promise.all([usersRes.json(), postsRes.json(), commentsRes.json()])

        const monthlyRevenue = monthNames.map((month, index) => {
          const revenue = 4200 + index * 340 + (posts[index]?.title.length || 0) * 3
          const expenses = 2600 + index * 170 + (comments[index]?.name.length || 0) * 2
          return {
            month,
            revenue,
            expenses,
            profit: Math.max(0, revenue - expenses)
          }
        })

        const sourceBuckets = [
          { name: 'Direct', color: '#6366f1', seed: comments.slice(0, 40).length },
          { name: 'Organic', color: '#22c55e', seed: comments.slice(40, 80).length },
          { name: 'Referral', color: '#eab308', seed: comments.slice(80, 120).length },
          { name: 'Social', color: '#ef4444', seed: comments.slice(120, 160).length }
        ].map((source, index) => ({ ...source, value: source.seed * (index + 8) }))

        const mappedOrders = posts.slice(0, 5).map((post, index) => {
          const user = users.find((u) => u.id === post.userId) || users[index % users.length]
          const statuses = ['pending', 'processing', 'completed']
          return {
            id: `#ORD-${7820 - index}`,
            customer: user?.name || `Customer ${index + 1}`,
            amount: `$${(((post.title.length + post.body.length) % 260) + 55).toFixed(2)}`,
            status: statuses[index % statuses.length]
          }
        })

        if (!isMounted) return
        setRevenueData(monthlyRevenue)
        setTrafficData(sourceBuckets)
        setRecentOrders(mappedOrders)
      } catch (error) {
        if (!isMounted) return
        setRevenueData(fallbackRevenueData)
        setTrafficData(fallbackTrafficData)
        setRecentOrders(fallbackOrders)
        setLoadError(error.message || 'Failed to load dashboard data')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadDashboardData()
    return () => {
      isMounted = false
    }
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      showToast('Dashboard data refreshed')
    }, 800)
  }

  const handleExportSafe = () => {
    const data = JSON.stringify({ stats, revenueData, trafficData }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dashboard-report.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Report downloaded')
  }

  const handleExportDemo = () => {
    try {
      const data = JSON.stringify({ stats, revenueData, trafficData }, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dashboard-report.json'
      a.click()
      URL.revokeURL(url)
      showToast('Report downloaded')
    } catch (error) {
      showToast('Report export cleanup failed', 'error')
      throw error
    }
  }

  const removeOrder = (id) => {
    setRecentOrders((prev) => prev.filter((o) => o.id !== id))
    setActionMenuId(null)
    showToast('Order dismissed')
  }

  const changeOrderStatus = (id, status) => {
    setRecentOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    setActionMenuId(null)
    showToast(`Order marked ${status}`)
  }

  return (
    <div className='dashboard'>
      {loadError && <div className='toast toast-error'>{loadError}</div>}

      <div className='page-header'>
        <h1>Dashboard</h1>
        <div className='header-actions'>
          <button className={`btn icon-rotate ${refreshing ? 'spinning' : ''}`} onClick={handleRefresh}>
            <RefreshCw size={14} /> Refresh
          </button>
          <TimedActionTooltip>
            <button type='button' className='btn demo-issue-trigger' onClick={handleExportDemo}>
              <Download size={14} /> Export
            </button>
          </TimedActionTooltip>
          <div className='time-filter'>
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                className={`filter-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='stats-grid'>
        {stats.map((stat) => (
          <div key={stat.label} className='stat-card'>
            <div className='stat-top'>
              <div className='stat-label'>{stat.label}</div>
              <div className='stat-icon-wrap'>
                <stat.icon size={18} />
              </div>
            </div>
            <div className='stat-value'>{stat.value}</div>
            <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
              {stat.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className='quick-actions'>
        {quickActions.map((action) => (
          <button
            key={action.label}
            className='quick-action-btn'
            onClick={() => {
              if (action.label === 'Generate Report') handleExportSafe()
              else if (action.label === 'View Analytics') navigate('/analytics')
              else if (action.label === 'Sync Data') handleRefresh()
            }}
          >
            <action.icon size={18} />
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      <div className='charts-row'>
        <div className='chart-card revenue-chart'>
          <h2>Revenue Overview</h2>
          {isLoading && <div className='empty-state'>Loading chart data...</div>}
          <ResponsiveContainer width='100%' height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#6366f1' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='#6366f1' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='colorProfit' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#22c55e' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='#22c55e' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='#2e303a' />
              <XAxis dataKey='month' stroke='#6b7280' fontSize={12} />
              <YAxis stroke='#6b7280' fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#1a1b23', border: '1px solid #2e303a', borderRadius: 8 }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Area type='monotone' dataKey='revenue' stroke='#6366f1' fill='url(#colorRevenue)' strokeWidth={2} />
              <Area type='monotone' dataKey='profit' stroke='#22c55e' fill='url(#colorProfit)' strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className='chart-card traffic-chart'>
          <h2>Traffic Sources</h2>
          <ResponsiveContainer width='100%' height={280}>
            <PieChart>
              <Pie
                data={trafficData}
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey='value'
              >
                {trafficData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1b23', border: '1px solid #2e303a', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className='traffic-legend'>
            {trafficData.map((item) => (
              <div key={item.name} className='legend-item'>
                <span className='legend-dot' style={{ background: item.color }} />
                <span>{item.name}</span>
                <span className='legend-value'>{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='chart-card'>
        <div className='card-header-row'>
          <h2>Recent Orders</h2>
          <button className='link-btn' onClick={() => navigate('/orders')}>
            View All <ArrowRight size={14} />
          </button>
        </div>
        <table className='orders-table'>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id}>
                <td className='order-id'>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.amount}</td>
                <td>
                  <span className={`status-badge ${order.status}`}>{order.status}</span>
                </td>
                <td>
                  <div className='row-actions'>
                    <button className='icon-action' onClick={() => navigate('/orders')}>
                      <ExternalLink size={14} />
                    </button>
                    <div className='more-menu-wrapper'>
                      <button
                        className='icon-action'
                        onClick={() => setActionMenuId(actionMenuId === order.id ? null : order.id)}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      {actionMenuId === order.id && (
                        <div className='action-dropdown'>
                          {order.status === 'pending' && (
                            <button onClick={() => changeOrderStatus(order.id, 'processing')}>Mark Processing</button>
                          )}
                          {order.status === 'processing' && (
                            <button onClick={() => changeOrderStatus(order.id, 'completed')}>Mark Completed</button>
                          )}
                          <button className='danger' onClick={() => removeOrder(order.id)}>
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
