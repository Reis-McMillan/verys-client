const verysBaseUrl = import.meta.env.VITE_VERYS_BASE_URL || '/api'

export const OAUTH2_CONFIG = {
  clientId: import.meta.env.VITE_OAUTH2_CLIENT_ID || 'verys-client',
  redirectUri: `${window.location.origin}/callback`,
  scope: import.meta.env.VITE_OAUTH2_SCOPE || 'openid',
  verysBaseUrl,
  authorizeEndpoint: `${verysBaseUrl}/authorize`,
  tokenEndpoint: `${verysBaseUrl}/token`,
  userInfoEndpoint: `${verysBaseUrl}/userinfo`,
  revokeEndpoint: `${verysBaseUrl}/token/revoke`,
  endSessionEndpoint: `${verysBaseUrl}/end-session`,
}
