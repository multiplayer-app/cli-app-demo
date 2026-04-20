import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  Eye,
  UserCheck,
  BarChart2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Calendar,
  Maximize2,
  Minimize2,
  Share2
} from 'lucide-react'
import './Analytics.css'

const metrics = [
  { label: 'Page Views', value: '48,290', change: '+14.2%', positive: true, icon: Eye },
  { label: 'Unique Visitors', value: '12,847', change: '+6.8%', positive: true, icon: UserCheck },
  { label: 'Bounce Rate', value: '32.4%', change: '+2.1%', positive: false, icon: BarChart2 },
  { label: 'Session Duration', value: '4m 32s', change: '+0.8%', positive: true, icon: Clock }
]

const dateRanges = ['Today', '7 days', '30 days', '90 days', 'Year']
const fallbackActivityData = []
const fallbackConversionData = []
const fallbackTopPages = []

export default function Analytics() {
  const [metric, setMetric] = useState('visits')
  const [dateRange, setDateRange] = useState('30 days')
  const [compareMode, setCompareMode] = useState(false)
  const [expandedChart, setExpandedChart] = useState(null)
  const [toast, setToast] = useState(null)
  const [activityData, setActivityData] = useState(fallbackActivityData)
  const [conversionData, setConversionData] = useState(fallbackConversionData)
  const [topPages, setTopPages] = useState(fallbackTopPages)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const handleExport = (type) => {
    const dataMap = {
      activity: activityData,
      conversion: conversionData,
      pages: topPages
    }
    const data = dataMap[type] || []
    if (data.length === 0) {
      showToast(`No ${type} data to export`)
      return
    }
    const csv = Object.keys(data[0]).join(',') + '\n' + data.map((r) => Object.values(r).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}-data.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast(`${type} data exported`)
  }

  const handleShare = async () => {
    try {
      if (!navigator?.clipboard) {
        showToast('Clipboard not available')
        return
      }
      await navigator.clipboard.writeText(window.location.href)
      showToast('Link copied to clipboard')
    } catch (error) {
      showToast('Failed to copy link to clipboard')
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadAnalyticsData = async () => {
      try {
        setIsLoading(true)
        setLoadError('')

        const [postsRes, commentsRes] = await Promise.all([
          fetch('https://jsonplaceholder.typicode.com/posts'),
          fetch('https://jsonplaceholder.typicode.com/comments')
        ])

        if (!postsRes.ok || !commentsRes.ok) {
          throw new Error('Failed to fetch analytics data')
        }

        const [posts, comments] = await Promise.all([postsRes.json(), commentsRes.json()])
        const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        const mappedActivity = dayLabels.map((day, index) => {
          const postChunk = posts.slice(index * 6, index * 6 + 6)
          const commentChunk = comments.slice(index * 14, index * 14 + 14)
          const visits = 900 + postChunk.reduce((sum, post) => sum + post.title.length, 0) * 2
          const signups = 20 + commentChunk.length + (index % 4) * 3
          const orders = 35 + postChunk.length * 8 + index * 4
          return { day, visits, signups, orders }
        })

        const mappedConversion = monthLabels.map((month, index) => ({
          month,
          rate: Number((2.2 + index * 0.18 + ((posts[index]?.id || 1) % 3) * 0.09).toFixed(1))
        }))

        const mappedTopPages = [
          { page: '/home', views: 12400, pct: 100 },
          { page: '/products', views: 8200, pct: 66 },
          { page: '/about', views: 5100, pct: 41 },
          { page: '/pricing', views: 4300, pct: 35 },
          { page: '/blog', views: 3800, pct: 31 },
          { page: '/contact', views: 2100, pct: 17 }
        ]

        if (!isMounted) return
        setActivityData(mappedActivity)
        setConversionData(mappedConversion)
        setTopPages(mappedTopPages)
      } catch (error) {
        if (!isMounted) return
        setActivityData(fallbackActivityData)
        setConversionData(fallbackConversionData)
        setTopPages(fallbackTopPages)
        setLoadError(error.message || 'Failed to load analytics data')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadAnalyticsData()
    return () => {
      isMounted = false
    }
  }, [])

  const comparedActivity = useMemo(
    () =>
      compareMode
        ? activityData.map((d) => ({
            ...d,
            prev_visits: Math.round(d.visits * 0.85),
            prev_signups: Math.round(d.signups * 0.78),
            prev_orders: Math.round(d.orders * 0.9)
          }))
        : activityData,
    [activityData, compareMode]
  )

  return (
    <div className='analytics-page'>
      {toast && <div className='toast'>{toast}</div>}
      {loadError && <div className='toast'>{loadError}</div>}

      <div className='page-header'>
        <h1>Analytics</h1>
        <div className='header-actions'>
          <button className='btn' onClick={handleShare}>
            <Share2 size={14} /> Share
          </button>
          <button className={`btn ${compareMode ? 'btn-active' : ''}`} onClick={() => setCompareMode(!compareMode)}>
            <RefreshCw size={14} /> {compareMode ? 'Comparing' : 'Compare'}
          </button>
          <div className='date-range-picker'>
            <Calendar size={14} />
            {dateRanges.map((r) => (
              <button
                key={r}
                className={`range-btn ${dateRange === r ? 'active' : ''}`}
                onClick={() => setDateRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='metrics-grid'>
        {metrics.map((m) => (
          <div key={m.label} className='metric-card'>
            <div className='metric-top'>
              <div className='metric-label'>{m.label}</div>
              <div className='metric-icon-wrap'>
                <m.icon size={18} />
              </div>
            </div>
            <div className='metric-value'>{m.value}</div>
            <div className={`metric-change ${m.positive ? 'positive' : 'negative'}`}>
              {m.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {m.change}
            </div>
          </div>
        ))}
      </div>

      <div className={`chart-card ${expandedChart === 'activity' ? 'chart-expanded' : ''}`}>
        <div className='chart-header'>
          <h2>Weekly Activity</h2>
          <div className='chart-actions'>
            <div className='metric-toggle'>
              {['visits', 'signups', 'orders'].map((m) => (
                <button key={m} className={`toggle-btn ${metric === m ? 'active' : ''}`} onClick={() => setMetric(m)}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
            <button className='icon-action' onClick={() => handleExport('activity')}>
              <Download size={15} />
            </button>
            <button
              className='icon-action'
              onClick={() => setExpandedChart(expandedChart === 'activity' ? null : 'activity')}
            >
              {expandedChart === 'activity' ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>
        {isLoading && <div className='empty-state'>Loading analytics data...</div>}
        <ResponsiveContainer width='100%' height={expandedChart === 'activity' ? 440 : 320}>
          <BarChart data={comparedActivity} barSize={compareMode ? 16 : 32}>
            <CartesianGrid strokeDasharray='3 3' stroke='#2e303a' />
            <XAxis dataKey='day' stroke='#6b7280' fontSize={12} />
            <YAxis stroke='#6b7280' fontSize={12} />
            <Tooltip
              contentStyle={{ background: '#1a1b23', border: '1px solid #2e303a', borderRadius: 8 }}
              labelStyle={{ color: '#f3f4f6' }}
            />
            <Bar dataKey={metric} fill='#6366f1' radius={[6, 6, 0, 0]} />
            {compareMode && <Bar dataKey={`prev_${metric}`} fill='#4b5563' radius={[6, 6, 0, 0]} />}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className='charts-split'>
        <div className={`chart-card ${expandedChart === 'conversion' ? 'chart-expanded' : ''}`}>
          <div className='chart-header'>
            <h2>Conversion Rate Trend</h2>
            <div className='chart-actions'>
              <button className='icon-action' onClick={() => handleExport('conversion')}>
                <Download size={15} />
              </button>
              <button
                className='icon-action'
                onClick={() => setExpandedChart(expandedChart === 'conversion' ? null : 'conversion')}
              >
                {expandedChart === 'conversion' ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </div>
          </div>
          <ResponsiveContainer width='100%' height={expandedChart === 'conversion' ? 380 : 260}>
            <LineChart data={conversionData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#2e303a' />
              <XAxis dataKey='month' stroke='#6b7280' fontSize={12} />
              <YAxis stroke='#6b7280' fontSize={12} unit='%' />
              <Tooltip
                contentStyle={{ background: '#1a1b23', border: '1px solid #2e303a', borderRadius: 8 }}
                labelStyle={{ color: '#f3f4f6' }}
                formatter={(v) => `${v}%`}
              />
              <Line type='monotone' dataKey='rate' stroke='#22c55e' strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className='chart-card'>
          <div className='chart-header'>
            <h2>Top Pages</h2>
            <button className='icon-action' onClick={() => handleExport('pages')}>
              <Download size={15} />
            </button>
          </div>
          <div className='top-pages'>
            {topPages.map((p) => (
              <div key={p.page} className='page-row'>
                <div className='page-info'>
                  <span className='page-path'>{p.page}</span>
                  <span className='page-views'>{p.views.toLocaleString()}</span>
                </div>
                <div className='page-bar-bg'>
                  <div className='page-bar-fill' style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
