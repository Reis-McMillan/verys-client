import { OAUTH2_CONFIG } from '../config.js'

const BASE_URL = OAUTH2_CONFIG.verysBaseUrl

export function setTokens({ access_token, refresh_token, id_token }) {
  if (access_token) localStorage.setItem('access_token', access_token)
  if (refresh_token) localStorage.setItem('refresh_token', refresh_token)
  if (id_token) localStorage.setItem('id_token', id_token)
}

export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('id_token')
}

export function getTokens() {
  return {
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
    idToken: localStorage.getItem('id_token'),
  }
}

async function refreshAccessToken() {
  const { refreshToken } = getTokens()
  if (!refreshToken) return false

  const params = new URLSearchParams()
  params.set('grant_type', 'refresh_token')
  params.set('refresh_token', refreshToken)
  params.set('client_id', OAUTH2_CONFIG.clientId)

  try {
    const res = await fetch(`${BASE_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })

    if (res.ok) {
      const data = await res.json()
      setTokens(data)
      return true
    }
  } catch {
    // refresh failed
  }

  clearTokens()
  return false
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const headers = { ...options.headers }

  const { accessToken } = getTokens()
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  if (options.body && !(options.body instanceof URLSearchParams) && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, { ...options, headers })

  if (response.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      const { accessToken: newToken } = getTokens()
      headers['Authorization'] = `Bearer ${newToken}`
      return fetch(url, { ...options, headers })
    }
  }

  return response
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),

  postForm: (path, params) => {
    const body = new URLSearchParams(params)
    return request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
  },
}
