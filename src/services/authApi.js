import { apiRequest, storeAuthToken } from './apiClient'

const TOKEN_KEYS = ['token', 'accessToken', 'authToken', 'jwtToken', 'jwt', 'bearerToken']

const extractToken = (payload) => {
  if (!payload) return ''
  if (typeof payload === 'string') return payload

  for (const key of TOKEN_KEYS) {
    if (typeof payload[key] === 'string') return payload[key]
  }

  for (const value of Object.values(payload)) {
    if (value && typeof value === 'object') {
      const token = extractToken(value)
      if (token) return token
    }
  }

  return ''
}

export const authApi = {
  login: async ({ username, password }) => {
    const response = await apiRequest('/api/DashboardAuth/login', {
      method: 'POST',
      skipAuth: true,
      body: {
        username: username.trim(),
        password,
      },
    })

    const token = extractToken(response)
    if (!token) {
      throw new Error('Login succeeded, but the API response did not include a JWT token.')
    }

    storeAuthToken(token)
    return response
  },
}
