import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Users, ShoppingBag, BarChart3, Settings,
  ChevronLeft, ChevronRight, Search, Bell, CheckCheck, LogOut,
} from 'lucide-react'
import { notifications as initialNotifications } from '../data/mock'
import './Layout.css'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const clearAll = () => {
    setNotifications([])
    setShowNotifications(false)
  }

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          {sidebarOpen && <span className="logo">DashBoard</span>}
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <item.icon size={20} className="nav-icon" />
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        {sidebarOpen && (
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">GK</div>
              <div>
                <div className="user-name">Gegham K.</div>
                <div className="user-role">Administrator</div>
              </div>
            </div>
            <button className="logout-btn">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="topbar-actions">
            <div className="notification-wrapper">
              <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <span>Notifications</span>
                    <div className="dropdown-header-actions">
                      {unreadCount > 0 && (
                        <button className="dropdown-action" onClick={markAllRead}>
                          <CheckCheck size={14} /> Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button className="dropdown-action danger" onClick={clearAll}>
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="notification-empty">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`notification-item ${n.read ? '' : 'unread'}`}
                        onClick={() => markRead(n.id)}
                      >
                        <div className="notification-text">{n.text}</div>
                        <div className="notification-time">{n.time}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
