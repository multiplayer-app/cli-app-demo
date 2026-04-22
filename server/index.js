/* global process */
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = Number(process.env.PORT || 8787)
const UPSTREAM_BASE_URL = 'https://jsonplaceholder.typicode.com'

app.use(cors())
app.use(express.json())

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

const shouldFailRequest = (req) => {
  const forceFail = req.query.fail === '1'
  const failRate = toInt(req.query.failRate ?? process.env.API_FAIL_RATE, 0)
  const randomFailure = failRate > 0 && Math.random() * 100 < failRate
  return forceFail || randomFailure
}

const delayMs = (req) => Math.max(0, toInt(req.query.delay ?? process.env.API_DELAY_MS, 0))

const failResponse = (req, res) => {
  const status = toInt(req.query.failStatus ?? process.env.API_FAIL_STATUS, 500)
  res.status(status).json({
    error: 'Simulated backend failure',
    status,
    path: req.path
  })
}

const maybeDelay = async (req) => {
  const ms = delayMs(req)
  if (!ms) return
  await new Promise((resolve) => setTimeout(resolve, ms))
}

const proxyGet = (upstreamPath) => async (req, res) => {
  if (shouldFailRequest(req)) {
    return failResponse(req, res)
  }

  await maybeDelay(req)

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

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'mock-backend' })
})

app.get('/api/users', proxyGet('/users'))
app.get('/api/posts', proxyGet('/posts'))
app.get('/api/comments', proxyGet('/comments'))

app.listen(PORT, () => {
  console.log(`Mock backend server listening on http://localhost:${PORT}`)
})
