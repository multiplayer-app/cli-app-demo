import { useEffect, useState } from 'react'
import {
  Search,
  Plus,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Package,
  Truck,
  CreditCard,
  RefreshCw,
  Copy,
  CheckCircle
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import TimedActionTooltip from '../components/TimedActionTooltip'
import './Orders.css'

const PAGE_SIZE = 8
const defaultOrders = []
const orderStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled', 'refunded']
const paymentMethods = ['credit_card', 'paypal', 'bank_transfer']
const shippingMethods = ['standard', 'express', 'overnight']

const emptyOrder = {
  id: '',
  customer: '',
  email: '',
  items: 1,
  amount: 0,
  status: 'pending',
  date: '',
  payment: 'credit_card',
  shipping: 'standard'
}

export default function Orders() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState(defaultOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(0)
  const [selectedOrders, setSelectedOrders] = useState(new Set())
  const [showDetail, setShowDetail] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editOrder, setEditOrder] = useState(null)
  const [newOrder, setNewOrder] = useState({ ...emptyOrder })
  const [actionMenu, setActionMenu] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadOrders = async () => {
      try {
        setIsLoading(true)
        setLoadError('')

        const [usersRes, postsRes] = await Promise.all([fetch('/api/users'), fetch('/api/posts')])

        if (!usersRes.ok || !postsRes.ok) {
          throw new Error('Failed to fetch placeholder data')
        }

        const [users, posts] = await Promise.all([usersRes.json(), postsRes.json()])

        const mappedOrders = posts.slice(0, 24).map((post, index) => {
          const user = users.find((u) => u.id === post.userId) || users[index % users.length]
          return {
            id: `ORD-${7800 + post.id}`,
            customer: user?.name || `Customer ${index + 1}`,
            email: user?.email || `customer${index + 1}@example.com`,
            items: (post.id % 5) + 1,
            amount: Number((((post.title.length + post.body.length) % 450) + 35 + (post.id % 10) * 0.25).toFixed(2)),
            status: orderStatuses[index % orderStatuses.length],
            date: `2024-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
            payment: paymentMethods[index % paymentMethods.length],
            shipping: shippingMethods[index % shippingMethods.length]
          }
        })

        if (!isMounted) return
        setOrders(mappedOrders)
      } catch (error) {
        if (!isMounted) return
        setOrders(defaultOrders)
        setLoadError(error.message || 'Failed to load orders')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadOrders()
    return () => {
      isMounted = false
    }
  }, [])

  const filtered = orders
    .filter((o) => {
      const matchSearch =
        o.customer.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.email.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || o.status === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      const mod = sortDir === 'asc' ? 1 : -1
      if (sortField === 'amount') return (a.amount - b.amount) * mod
      if (sortField === 'date') return a.date.localeCompare(b.date) * mod
      if (sortField === 'customer') return a.customer.localeCompare(b.customer) * mod
      return 0
    })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const toggleSelect = (id) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedOrders.size === paged.length) setSelectedOrders(new Set())
    else setSelectedOrders(new Set(paged.map((o) => o.id)))
  }

  const deleteSelected = () => {
    setOrders((prev) => prev.filter((o) => !selectedOrders.has(o.id)))
    setSelectedOrders(new Set())
    showToast(`Deleted ${selectedOrders.size} order(s)`)
  }

  const deleteOrder = (id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id))
    setActionMenu(null)
    showToast('Order deleted')
  }

  const updateStatus = (id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    setActionMenu(null)
    showToast(`Order marked as ${status}`)
  }

  const createOrder = () => {
    const id = `ORD-${7822 + orders.length}`
    const date = new Date().toISOString().split('T')[0]
    setOrders((prev) => [{ ...newOrder, id, date }, ...prev])
    setNewOrder({ ...emptyOrder })
    setShowCreateModal(false)
    showToast('Order created')
  }

  const saveEdit = () => {
    setOrders((prev) => prev.map((o) => (o.id === editOrder.id ? editOrder : o)))
    setShowEditModal(false)
    setEditOrder(null)
    showToast('Order updated')
  }

  const openEdit = (order) => {
    setEditOrder({ ...order })
    setShowEditModal(true)
    setActionMenu(null)
  }

  const copyId = (id) => {
    try {
      navigator.clipboard.writeext(id)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch (error) {
      showToast('Could not copy order ID', 'error')
      throw error
    }
  }

  const exportCSV = () => {
    const header = 'ID,Customer,Email,Items,Amount,Status,Date,Payment,Shipping'
    let rows
    try {
      rows = filtered.map((o) => o.toCSVRow())
    } catch (error) {
      showToast('Could not serialize orders for CSV', 'error')
      throw error
    }
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'orders.csv'
    a.click()
    URL.revokeObjectURL(url)
    showToast('CSV exported')
  }

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    refunded: orders.filter((o) => o.status === 'refunded').length
  }

  const totalRevenue = orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.amount, 0)

  return (
    <div className='orders-page'>
      {loadError && <div className='toast toast-error'>{loadError}</div>}

      <div className='page-header'>
        <h1>Orders</h1>
        <div className='header-actions'>
          <TimedActionTooltip>
            <button type='button' className='btn demo-issue-trigger' onClick={exportCSV}>
              <Download size={14} /> Export
            </button>
          </TimedActionTooltip>
          <button className='btn btn-primary' onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> New Order
          </button>
        </div>
      </div>

      <div className='order-stats'>
        <div className='order-stat'>
          <Package size={18} />
          <div>
            <div className='order-stat-value'>{orders.length}</div>
            <div className='order-stat-label'>Total Orders</div>
          </div>
        </div>
        <div className='order-stat'>
          <CreditCard size={18} />
          <div>
            <div className='order-stat-value'>${totalRevenue.toLocaleString()}</div>
            <div className='order-stat-label'>Revenue</div>
          </div>
        </div>
        <div className='order-stat'>
          <Truck size={18} />
          <div>
            <div className='order-stat-value'>{statusCounts.shipped}</div>
            <div className='order-stat-label'>In Transit</div>
          </div>
        </div>
        <div className='order-stat'>
          <RefreshCw size={18} />
          <div>
            <div className='order-stat-value'>{statusCounts.processing}</div>
            <div className='order-stat-label'>Processing</div>
          </div>
        </div>
      </div>

      <div className='status-tabs'>
        {Object.entries(statusCounts).map(([key, count]) => (
          <button
            key={key}
            className={`status-tab ${statusFilter === key ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter(key)
              setPage(0)
            }}
          >
            {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)}
            <span className='tab-count'>{count}</span>
          </button>
        ))}
      </div>

      <div className='filters-bar'>
        <div className='search-filter'>
          <Search size={16} className='search-filter-icon' />
          <input
            type='text'
            placeholder='Search orders...'
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
          />
        </div>
        {selectedOrders.size > 0 && (
          <button className='btn btn-danger' onClick={deleteSelected}>
            <Trash2 size={14} /> Delete ({selectedOrders.size})
          </button>
        )}
      </div>

      <div className='orders-table-wrapper'>
        {isLoading && <div className='empty-state'>Loading orders...</div>}
        <table className='orders-table'>
          <thead>
            <tr>
              <th>
                <input
                  type='checkbox'
                  checked={selectedOrders.size === paged.length && paged.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th className='sortable' onClick={() => toggleSort('customer')}>
                Customer {sortField === 'customer' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th>Items</th>
              <th className='sortable' onClick={() => toggleSort('amount')}>
                Amount {sortField === 'amount' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th>Status</th>
              <th>Payment</th>
              <th className='sortable' onClick={() => toggleSort('date')}>
                Date {sortField === 'date' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((order) => (
              <tr key={order.id} className={selectedOrders.has(order.id) ? 'selected' : ''}>
                <td>
                  <input
                    type='checkbox'
                    checked={selectedOrders.has(order.id)}
                    onChange={() => toggleSelect(order.id)}
                  />
                </td>
                <td>
                  <div className='customer-cell'>
                    <div className='customer-name'>{order.customer}</div>
                    <div className='customer-id'>
                      {order.id}
                      <button type='button' className='copy-btn demo-issue-trigger' onClick={() => copyId(order.id)}>
                        {copiedId === order.id ? <CheckCircle size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </td>
                <td>{order.items}</td>
                <td className='amount'>${order.amount.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${order.status}`}>{order.status}</span>
                </td>
                <td className='payment'>{order.payment.replace('_', ' ')}</td>
                <td>{order.date}</td>
                <td>
                  <div className='row-actions'>
                    <button className='icon-action' onClick={() => setShowDetail(order)}>
                      <Eye size={15} />
                    </button>
                    <button className='icon-action' onClick={() => openEdit(order)}>
                      <Pencil size={15} />
                    </button>
                    <div className='more-menu-wrapper'>
                      <button
                        className='icon-action'
                        onClick={() => setActionMenu(actionMenu === order.id ? null : order.id)}
                      >
                        <MoreHorizontal size={15} />
                      </button>
                      {actionMenu === order.id && (
                        <div className='action-dropdown'>
                          {order.status === 'pending' && (
                            <button onClick={() => updateStatus(order.id, 'processing')}>Mark Processing</button>
                          )}
                          {order.status === 'processing' && (
                            <button onClick={() => updateStatus(order.id, 'shipped')}>Mark Shipped</button>
                          )}
                          {order.status === 'shipped' && (
                            <button onClick={() => updateStatus(order.id, 'completed')}>Mark Completed</button>
                          )}
                          {!['cancelled', 'refunded'].includes(order.status) && (
                            <button onClick={() => updateStatus(order.id, 'cancelled')}>Cancel Order</button>
                          )}
                          {order.status === 'completed' && (
                            <button onClick={() => updateStatus(order.id, 'refunded')}>Refund</button>
                          )}
                          <button className='danger' onClick={() => deleteOrder(order.id)}>
                            Delete
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
        {paged.length === 0 && <div className='empty-state'>No orders found.</div>}
      </div>

      <div className='table-footer'>
        <span>
          Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
        </span>
        <div className='pagination'>
          <button className='page-btn' disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} className={`page-btn ${page === i ? 'active' : ''}`} onClick={() => setPage(i)}>
              {i + 1}
            </button>
          ))}
          <button className='page-btn' disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div className='modal-overlay' onClick={() => setShowDetail(null)}>
          <div className='modal modal-wide' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>Order {showDetail.id}</h2>
              <button className='icon-close' onClick={() => setShowDetail(null)}>
                <X size={18} />
              </button>
            </div>
            <div className='detail-grid'>
              <div className='detail-item'>
                <span className='detail-label'>Customer</span>
                <span className='detail-value'>{showDetail.customer}</span>
              </div>
              <div className='detail-item'>
                <span className='detail-label'>Email</span>
                <span className='detail-value'>{showDetail.email}</span>
              </div>
              <div className='detail-item'>
                <span className='detail-label'>Items</span>
                <span className='detail-value'>{showDetail.items}</span>
              </div>
              <div className='detail-item'>
                <span className='detail-label'>Amount</span>
                <span className='detail-value'>${showDetail.amount.toFixed(2)}</span>
              </div>
              <div className='detail-item'>
                <span className='detail-label'>Status</span>
                <span className='detail-value'>
                  <span className={`status-badge ${showDetail.status}`}>{showDetail.status}</span>
                </span>
              </div>
              <div className='detail-item'>
                <span className='detail-label'>Date</span>
                <span className='detail-value'>{showDetail.date}</span>
              </div>
              <div className='detail-item'>
                <span className='detail-label'>Payment</span>
                <span className='detail-value'>{showDetail.payment.replace('_', ' ')}</span>
              </div>
              <div className='detail-item'>
                <span className='detail-label'>Shipping</span>
                <span className='detail-value'>{showDetail.shipping}</span>
              </div>
            </div>
            <div className='modal-actions'>
              <button
                className='btn'
                onClick={() => {
                  setShowDetail(null)
                  openEdit(showDetail)
                }}
              >
                <Pencil size={14} /> Edit Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className='modal-overlay' onClick={() => setShowCreateModal(false)}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>New Order</h2>
              <button className='icon-close' onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className='form-group'>
              <label>Customer Name</label>
              <input
                value={newOrder.customer}
                onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
              />
            </div>
            <div className='form-group'>
              <label>Email</label>
              <input
                type='email'
                value={newOrder.email}
                onChange={(e) => setNewOrder({ ...newOrder, email: e.target.value })}
              />
            </div>
            <div className='form-row-inline'>
              <div className='form-group'>
                <label>Items</label>
                <input
                  type='number'
                  min='1'
                  value={newOrder.items}
                  onChange={(e) => setNewOrder({ ...newOrder, items: +e.target.value })}
                />
              </div>
              <div className='form-group'>
                <label>Amount ($)</label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={newOrder.amount}
                  onChange={(e) => setNewOrder({ ...newOrder, amount: +e.target.value })}
                />
              </div>
            </div>
            <div className='form-row-inline'>
              <div className='form-group'>
                <label>Payment</label>
                <select
                  value={newOrder.payment}
                  onChange={(e) => setNewOrder({ ...newOrder, payment: e.target.value })}
                >
                  <option value='credit_card'>Credit Card</option>
                  <option value='paypal'>PayPal</option>
                  <option value='bank_transfer'>Bank Transfer</option>
                </select>
              </div>
              <div className='form-group'>
                <label>Shipping</label>
                <select
                  value={newOrder.shipping}
                  onChange={(e) => setNewOrder({ ...newOrder, shipping: e.target.value })}
                >
                  <option value='standard'>Standard</option>
                  <option value='express'>Express</option>
                  <option value='overnight'>Overnight</option>
                </select>
              </div>
            </div>
            <div className='modal-actions'>
              <button className='btn' onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button
                className='btn btn-primary'
                onClick={createOrder}
                disabled={!newOrder.customer || !newOrder.email}
              >
                <Plus size={14} /> Create Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editOrder && (
        <div className='modal-overlay' onClick={() => setShowEditModal(false)}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>Edit {editOrder.id}</h2>
              <button className='icon-close' onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className='form-group'>
              <label>Customer Name</label>
              <input
                value={editOrder.customer}
                onChange={(e) => setEditOrder({ ...editOrder, customer: e.target.value })}
              />
            </div>
            <div className='form-group'>
              <label>Email</label>
              <input
                type='email'
                value={editOrder.email}
                onChange={(e) => setEditOrder({ ...editOrder, email: e.target.value })}
              />
            </div>
            <div className='form-row-inline'>
              <div className='form-group'>
                <label>Items</label>
                <input
                  type='number'
                  min='1'
                  value={editOrder.items}
                  onChange={(e) => setEditOrder({ ...editOrder, items: +e.target.value })}
                />
              </div>
              <div className='form-group'>
                <label>Amount ($)</label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={editOrder.amount}
                  onChange={(e) => setEditOrder({ ...editOrder, amount: +e.target.value })}
                />
              </div>
            </div>
            <div className='form-row-inline'>
              <div className='form-group'>
                <label>Status</label>
                <select
                  value={editOrder.status}
                  onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value })}
                >
                  <option value='pending'>Pending</option>
                  <option value='processing'>Processing</option>
                  <option value='shipped'>Shipped</option>
                  <option value='completed'>Completed</option>
                  <option value='cancelled'>Cancelled</option>
                  <option value='refunded'>Refunded</option>
                </select>
              </div>
              <div className='form-group'>
                <label>Payment</label>
                <select
                  value={editOrder.payment}
                  onChange={(e) => setEditOrder({ ...editOrder, payment: e.target.value })}
                >
                  <option value='credit_card'>Credit Card</option>
                  <option value='paypal'>PayPal</option>
                  <option value='bank_transfer'>Bank Transfer</option>
                </select>
              </div>
            </div>
            <div className='form-group'>
              <label>Shipping</label>
              <select
                value={editOrder.shipping}
                onChange={(e) => setEditOrder({ ...editOrder, shipping: e.target.value })}
              >
                <option value='standard'>Standard</option>
                <option value='express'>Express</option>
                <option value='overnight'>Overnight</option>
              </select>
            </div>
            <div className='modal-actions'>
              <button className='btn' onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className='btn btn-primary' onClick={saveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
