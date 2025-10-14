const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5100'

const buildHeaders = (headers, includeAuth) => {
  const baseHeaders = new Headers(headers ?? {})

  if (!baseHeaders.has('Content-Type')) {
    baseHeaders.set('Content-Type', 'application/json')
  }

  if (includeAuth) {
    const token = localStorage.getItem('dms.auth.token')
    if (token) {
      baseHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  return baseHeaders
}

const handleResponse = async (response) => {
  const isJson = response.headers
    .get('Content-Type')
    ?.includes('application/json')

  const payload = isJson ? await response.json() : null

  if (!response.ok) {
    const error = new Error(payload?.message ?? 'Request failed')
    error.status = response.status
    error.details = payload
    throw error
  }

  return payload
}

const request = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body,
    headers,
    auth = true,
    signal,
    ...rest
  } = options

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: buildHeaders(headers, auth),
    signal,
    ...rest,
  })

  return handleResponse(response)
}

const postFormData = async (endpoint, formData, options = {}) => {
  const { auth = true, signal, ...rest } = options

  const headers = new Headers()
  if (auth) {
    const token = localStorage.getItem('dms.auth.token')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }
  // Do NOT set Content-Type for FormData - browser will set it with boundary

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    headers,
    signal,
    ...rest,
  })

  return handleResponse(response)
}

const apiClient = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) =>
    request(endpoint, { ...options, method: 'DELETE' }),
  postFormData,
}

export default apiClient
