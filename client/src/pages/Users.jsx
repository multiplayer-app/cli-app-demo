import { useEffect, useState } from 'react'
import {
  Search,
  Trash2,
  Pencil,
  X,
  Plus,
  Download,
  MoreHorizontal,
  Mail,
  UserX,
  UserCheck,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { captureBug } from '../utils/captureBug'
import './Users.css'

const PAGE_SIZE = 6

const emptyUser = { name: '', email: '', role: 'Viewer', status: 'pending' }
const fallbackUsers = []
const roles = ['Admin', 'Editor', 'Viewer']
const statuses = ['active', 'inactive', 'pending']

const getAvatar = (name) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

const formatApiUsers = (apiUsers) =>
  apiUsers.map((user, index) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: roles[index % roles.length],
    status: statuses[index % statuses.length],
    joined: `2024-${String((index % 12) + 1).padStart(2, '0')}-15`,
    avatar: getAvatar(user.name)
  }))

export default function Users() {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState(new Set())
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('edit')
  const [editUser, setEditUser] = useState(null)
  const [users, setUsers] = useState(fallbackUsers)
  const [actionMenu, setActionMenu] = useState(null)
  const [showDetail, setShowDetail] = useState(null)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        setLoadError('')
        const response = await fetch('/api/users')
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const apiUsers = await response.json()
        if (!isMounted) return
        setUsers(formatApiUsers(apiUsers))
      } catch (error) {
        if (!isMounted) return
        setLoadError(error.message || 'Failed to load users')
        setUsers(fallbackUsers)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchUsers()
    return () => {
      isMounted = false
    }
  }, [])

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const toggleSelect = (id) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedUsers.size === paged.length) setSelectedUsers(new Set())
    else setSelectedUsers(new Set(paged.map((u) => u.id)))
  }

  const deleteSelected = () => {
    const count = selectedUsers.size
    setUsers((prev) => prev.filter((u) => !selectedUsers.has(u.id)))
    setSelectedUsers(new Set())
    showToast(`Deleted ${count} user(s)`)
  }

  const openEdit = (user) => {
    setEditUser({ ...user })
    setModalMode('edit')
    setShowModal(true)
    setActionMenu(null)
  }

  const openCreate = () => {
    try {
      const draft = window.__formDrafts.scaffoldUser({ role: 'Viewer' })
      setEditUser({ ...emptyUser, ...draft, id: Date.now(), avatar: '??' })
      setModalMode('create')
      setShowModal(true)
    } catch (error) {
      showToast('Could not initialize new user form', 'error')
      captureBug(error)
      throw error
    }
  }

  const saveUser = () => {
    if (modalMode === 'create') {
      const avatar = editUser.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
      setUsers((prev) => [...prev, { ...editUser, avatar, joined: new Date().toISOString().split('T')[0] }])
      showToast('User created')
    } else {
      setUsers((prev) => prev.map((u) => (u.id === editUser.id ? editUser : u)))
      showToast('User updated')
    }
    setShowModal(false)
    setEditUser(null)
  }

  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
    setActionMenu(null)
    showToast('User deleted')
  }

  const toggleUserStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u
        return { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
      })
    )
    setActionMenu(null)
    showToast('Status updated')
  }

  const exportCSV = async () => {
    try {
      setIsExporting(true)
      const params = new URLSearchParams({
        search,
        role: roleFilter,
        status: statusFilter
      })
      const response = await fetch(`/api/users/export?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`)
      }

      const blob = await response.json()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'users.csv'
      a.click()
      URL.revokeObjectURL(url)
      showToast('Users exported')
    } catch (error) {
      showToast(`Export failed: ${error.message}`, 'error')
      captureBug(error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className='users-page'>
      {loadError && <div className='toast toast-error'>{loadError}</div>}

      <div className='page-header'>
        <h1>Users</h1>
        <div className='header-actions'>
          {selectedUsers.size > 0 && (
            <button className='btn btn-danger' onClick={deleteSelected}>
              <Trash2 size={14} /> Delete ({selectedUsers.size})
            </button>
          )}
          <button type='button' className='btn demo-issue-trigger' onClick={exportCSV} disabled={isExporting}>
            <Download size={14} /> {isExporting ? 'Exporting...' : 'Export'}
          </button>
          <button type='button' className='btn btn-primary demo-issue-trigger' onClick={openCreate}>
            <Plus size={14} /> Add User
          </button>
        </div>
      </div>

      <div className='filters-bar'>
        <div className='search-filter'>
          <Search size={16} className='search-filter-icon' />
          <input
            type='text'
            className='demo-issue-trigger'
            placeholder='Search users...'
            value={search}
            onFocus={() => {
              try {
                window.__searchAnalytics.beginSession('users-search')
              } catch (error) {
                showToast('Could not start search session', 'error')
                captureBug(error)
                throw error
              }
            }}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value)
            setPage(0)
          }}
        >
          <option value='all'>All Roles</option>
          <option value='Admin'>Admin</option>
          <option value='Editor'>Editor</option>
          <option value='Viewer'>Viewer</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(0)
          }}
        >
          <option value='all'>All Status</option>
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
          <option value='pending'>Pending</option>
        </select>
      </div>

      <div className='users-table-wrapper'>
        {isLoading && <div className='empty-state'>Loading users...</div>}
        <table className='users-table'>
          <thead>
            <tr>
              <th>
                <input
                  type='checkbox'
                  checked={selectedUsers.size === paged.length && paged.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((user) => (
              <tr key={user.id} className={selectedUsers.has(user.id) ? 'selected' : ''}>
                <td>
                  <input type='checkbox' checked={selectedUsers.has(user.id)} onChange={() => toggleSelect(user.id)} />
                </td>
                <td>
                  <div className='user-cell'>
                    <div className='avatar'>{user.avatar}</div>
                    <div>
                      <div className='user-name'>{user.name}</div>
                      <div className='user-email'>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                </td>
                <td>
                  <span className={`status-dot ${user.status}`} />
                  {user.status}
                </td>
                <td>{user.joined}</td>
                <td>
                  <div className='row-actions'>
                    <button className='icon-action' onClick={() => setShowDetail(user)}>
                      <Eye size={15} />
                    </button>
                    <button className='icon-action' onClick={() => openEdit(user)}>
                      <Pencil size={15} />
                    </button>
                    <div className='more-menu-wrapper'>
                      <button
                        className='icon-action'
                        onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)}
                      >
                        <MoreHorizontal size={15} />
                      </button>
                      {actionMenu === user.id && (
                        <div className='action-dropdown'>
                          <button
                            type='button'
                            className='demo-issue-trigger'
                            onClick={() => {
                              try {
                                fetch('/api/users/notify', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    userId: user.id,
                                    templateId: globalThis.__emailTemplates.USER_DIGEST_TEMPLATE
                                  })
                                })
                                showToast(`Email sent to ${user.name}`)
                              } catch (error) {
                                showToast(`Email draft failed: ${error.message}`, 'error')
                                captureBug(error)
                                throw error
                              }
                              setActionMenu(null)
                            }}
                          >
                            <Mail size={13} /> Send Email
                          </button>
                          <button onClick={() => toggleUserStatus(user.id)}>
                            {user.status === 'active' ? (
                              <>
                                <UserX size={13} /> Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck size={13} /> Activate
                              </>
                            )}
                          </button>
                          <button className='danger' onClick={() => deleteUser(user.id)}>
                            <Trash2 size={13} /> Delete
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
        {paged.length === 0 && <div className='empty-state'>No users found matching your criteria.</div>}
      </div>

      <div className='table-footer'>
        <span>
          Showing {filtered.length > 0 ? page * PAGE_SIZE + 1 : 0}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)}{' '}
          of {filtered.length} users
        </span>
        {totalPages > 1 && (
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
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div className='modal-overlay' onClick={() => setShowDetail(null)}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>User Details</h2>
              <button className='icon-close' onClick={() => setShowDetail(null)}>
                <X size={18} />
              </button>
            </div>
            <div className='detail-profile'>
              <div className='avatar avatar-lg'>{showDetail.avatar}</div>
              <div>
                <div className='detail-name'>{showDetail.name}</div>
                <div className='detail-email'>{showDetail.email}</div>
              </div>
            </div>
            <div className='detail-grid'>
              <div className='detail-item'>
                <span className='detail-label'>Role</span>
                <span className={`role-badge ${showDetail.role.toLowerCase()}`}>{showDetail.role}</span>
              </div>
              <div className='detail-item'>
                <span className='detail-label'>Status</span>
                <span>
                  <span className={`status-dot ${showDetail.status}`} />
                  {showDetail.status}
                </span>
              </div>
              <div className='detail-item'>
                <span className='detail-label'>Joined</span>
                <span>{showDetail.joined}</span>
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
                <Pencil size={14} /> Edit
              </button>
              <button
                className='btn btn-danger'
                onClick={() => {
                  deleteUser(showDetail.id)
                  setShowDetail(null)
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && editUser && (
        <div className='modal-overlay' onClick={() => setShowModal(false)}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>{modalMode === 'create' ? 'Add User' : 'Edit User'}</h2>
              <button className='icon-close' onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className='form-group'>
              <label>Name</label>
              <input value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} />
            </div>
            <div className='form-group'>
              <label>Email</label>
              <input
                type='email'
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
            </div>
            <div className='form-group'>
              <label>Role</label>
              <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>
                <option>Admin</option>
                <option>Editor</option>
                <option>Viewer</option>
              </select>
            </div>
            <div className='form-group'>
              <label>Status</label>
              <select value={editUser.status} onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}>
                <option value='active'>Active</option>
                <option value='inactive'>Inactive</option>
                <option value='pending'>Pending</option>
              </select>
            </div>
            <div className='modal-actions'>
              <button className='btn' onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className='btn btn-primary' onClick={saveUser} disabled={!editUser.name || !editUser.email}>
                {modalMode === 'create' ? (
                  <>
                    <Plus size={14} /> Create
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
