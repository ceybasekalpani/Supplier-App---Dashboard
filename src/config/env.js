const readBoolean = (value, fallback = false) => {
  if (value === undefined) return fallback
  return String(value).toLowerCase() === 'true'
}

export const env = {
  appName: import.meta.env.VITE_APP_NAME || 'Tea Factory Supplier Admin',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  enableMockData: readBoolean(import.meta.env.VITE_ENABLE_MOCK_DATA, true),
  isProduction: import.meta.env.PROD,
}
