// SDK
export const SDK_VERSION = '0.14.1';

// URLs
//TODO: fix
export const BITSKI_USER_API_HOST = 'https://www.krypteo.mn';
export const BITSKI_TRANSACTION_API_BASE_URL = 'https://api.krypteo.mn/v1';
export const BITSKI_RPC_BASE_URL = 'https://node.corexchain.io';
export const BITSKI_WEB_BASE_URL = 'https://krypteo.mn';
export const IFRAME_MESSAGE_ORIGIN_INCLUDES = '.krypteo.mn';

// OAuth
export const DEFAULT_OAUTH_CONFIGURATION = {
  authorization_endpoint:
    'https://account.krypteo.mn/auth/realms/wallet/protocol/openid-connect/auth',
  revocation_endpoint: '',
  token_endpoint: 'https://account.krypteo.mn/auth/realms/wallet/protocol/openid-connect/token',
  userinfo_endpoint:
    'https://account.krypteo.mn/auth/realms/wallet/protocol/openid-connect/userinfo',
};
export const DEFAULT_SCOPES = ['openid']; // scopes that are always included
export const DEFAULT_OPTIONAL_SCOPES = ['offline']; // scopes that are included by default, but can be overridden

// Popup Window
export const CHECK_FOR_POPUP_CLOSE_INTERVAL = 500;
export const DEFAULT_POPUP_FEATURES = {
  location: 'no',
  toolbar: 'no',
  width: 500,
  height: 500,
  left: 100,
  top: 100,
};

// Storage
export const REFRESH_TOKEN_KEY = 'bitski.refresh_token';
export const ACCESS_TOKEN_KEY = 'bitski.access_token';
export const ID_TOKEN_KEY = 'bitski.id_token';
export const USER_KEY = 'bitski.user';

// Methods
export const CACHED_METHODS = ['eth_accounts'];
export const DEFAULT_AUTHORIZED_METHODS = [
  'eth_sendTransaction',
  'eth_signTransaction',
  'eth_sign',
  'personal_sign',
  'eth_signTypedData',
  'eth_signTypedData_v3', // For metamask compatibility
  'eth_signTypedData_v4',
];