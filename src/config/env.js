export const env = {
  appName: import.meta.env.VITE_APP_NAME || 'Tea Factory Supplier Admin',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  apiProxyTarget: import.meta.env.VITE_API_PROXY_TARGET || '',
  isProduction: import.meta.env.PROD,
}
