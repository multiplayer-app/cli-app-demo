import 'dotenv/config'
import './instrumentation.js'
import express from 'express'
import cors from 'cors'
import { Integrations } from '@multiplayer-app/session-recorder-node'
import { PORT } from './config.js'

const app = express()

const UPSTREAM_BASE_URL = 'https://jsonplaceholder.typicode.com'

app.use(cors())
app.use(express.json())

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

const proxyGet = (upstreamPath) => async (req, res) => {
  try {
    const url = new URL(`${UPSTREAM_BASE_URL}${upstreamPath}`)
    for (const [key, value] of Object.entries(req.query)) {
      if (!['fail', 'failRate', 'failStatus', 'delay'].includes(key)) {
        url.searchParams.set(key, String(value))
      }
    }

    const response = await fetch(url)
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Upstream request failed with status ${response.status}`,
        upstream: url.toString()
      })
    }

    const data = await response.json()
    return res.json(data)
  } catch (error) {
    return res.status(502).json({
      error: 'Failed to reach upstream service',
      details: error.message
    })
  }
}

const usersToDashboardUsers = (apiUsers) => {
  const userRoles = ['Admin', 'Editor', 'Viewer']
  const userStatuses = ['active', 'inactive', 'pending']

  return apiUsers.map((user, index) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: userRoles[index % userRoles.length],
    status: userStatuses[index % userStatuses.length],
    joined: `2024-${String((index % 12) + 1).padStart(2, '0')}-15`
  }))
}

const escapeCsvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`

app.get('/api/users/export', async (req, res) => {
  if (req.query.crashValue?.length > 0) {
    JSON.parse(req.query.crashValue)
  }

  try {
    const response = await fetch(`${UPSTREAM_BASE_URL}/users`)
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Upstream request failed with status ${response.status}`,
        upstream: `${UPSTREAM_BASE_URL}/users`
      })
    }

    const apiUsers = await response.json()
    const users = usersToDashboardUsers(apiUsers)
    const search = String(req.query.search ?? '')
      .toLowerCase()
      .trim()
    const role = String(req.query.role ?? 'all')
    const status = String(req.query.status ?? 'all')

    const filtered = users.filter((user) => {
      const matchSearch =
        search.length === 0 || user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search)
      const matchRole = role === 'all' || user.role === role
      const matchStatus = status === 'all' || user.status === status
      return matchSearch && matchRole && matchStatus
    })

    const header = 'Name,Email,Role,Status,Joined'
    const rows = filtered.map((user) =>
      [user.name, user.email, user.role, user.status, user.joined].map(escapeCsvCell).join(',')
    )
    const csv = [header, ...rows].join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="users-export.csv"')
    return res.status(200).send(csv)
  } catch (error) {
    return res.status(502).json({
      error: 'Failed to prepare users export',
      details: error.message
    })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'mock-backend' })
})

app.get('/api/users', proxyGet('/users'))
app.get('/api/posts', proxyGet('/posts'))
app.get('/api/comments', proxyGet('/comments'))

// Error handler middleware for HTTP 5xx errors
app.use(Integrations.express.expressErrorHandler())

app.listen(PORT, () => {
  console.log(`Mock backend server listening on http://localhost:${PORT}`)
})
