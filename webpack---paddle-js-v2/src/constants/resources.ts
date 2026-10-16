import { ENVIRONMENTS, EnvironmentValue } from 'src/globals/types'

import { isKnownEnvironment } from 'src/utils/environment-utils'

export const cssBaseURL = {
  [ENVIRONMENTS.PRODUCTION]: 'https://cdn.paddle.com/paddle/v2/assets/css',
  [ENVIRONMENTS.SANDBOX]: 'https://sandbox-cdn.paddle.com/paddle/v2/assets/css',
  [ENVIRONMENTS.STAGING]: 'https://staging-cdn.paddle.dev/paddle/v2/assets/css',
  [ENVIRONMENTS.DEVELOPMENT]: 'https://development-cdn.paddle.dev/paddle/v2/assets/css',
  [ENVIRONMENTS.LOCAL]: 'assets/css',
}

const imagesBaseURL = {
  [ENVIRONMENTS.PRODUCTION]: 'https://cdn.paddle.com/paddle/v2/assets/images',
  [ENVIRONMENTS.SANDBOX]: 'https://sandbox-cdn.paddle.com/paddle/v2/assets/images',
  [ENVIRONMENTS.STAGING]: 'https://staging-cdn.paddle.dev/paddle/v2/assets/images',
  [ENVIRONMENTS.DEVELOPMENT]: 'https://development-cdn.paddle.dev/paddle/v2/assets/images',
  [ENVIRONMENTS.LOCAL]: 'assets/images',
}

export const errorLinks = {
  [ENVIRONMENTS.PRODUCTION]: 'https://cdn.paddle.com/paddle/v2/error.html',
  [ENVIRONMENTS.SANDBOX]: 'https://sandbox-cdn.paddle.com/paddle/v2/error.html',
  [ENVIRONMENTS.STAGING]: 'https://staging-cdn.paddle.dev/paddle/v2/error.html',
  [ENVIRONMENTS.DEVELOPMENT]: 'https://development-cdn.paddle.dev/v2/paddle/error.html',
  [ENVIRONMENTS.LOCAL]: 'http://localhost:8081/error.html',
}

export const getResource = (environment: EnvironmentValue) => {
  const env = isKnownEnvironment(environment) ? environment : ENVIRONMENTS.PRODUCTION
  return {
    PADDLE_CSS_FILE: cssBaseURL[env] + '/paddle.css',
    VENDORS_URL: 'https://vendors.paddle.com/download/product/',
    HEALTH_CHECK_GIF: imagesBaseURL[env] + '/health-check.gif',
  }
}

export const LOCAL_URLS = {
  checkoutBase: 'https://local-buy.paddle.com/product/',
  checkoutFrontEndBase: 'https://local-buy.paddle.com',
  profitwellSnippetBase: 'http://www2.profitwell-local.com/dotjs-client/main/profitwell.js',
  apiBase: 'https://api.paddle.local',
}

export const DEV_CREATE_CHECKOUT_DOMAIN = 'https://development-create-checkout.paddle.dev'
export const DEV_URLS = {
  checkoutBase: DEV_CREATE_CHECKOUT_DOMAIN + '/checkout/product/',
  checkoutFrontEndBase: 'https://development-buy.paddle.dev',
  profitwellSnippetBase: 'https://public.profitwell.com/js/profitwell.js',
  apiBase: 'https://development-api.paddle.dev',
}

export const STAGING_CREATE_CHECKOUT_DOMAIN = 'https://staging-create-checkout.paddle.dev'
export const STAGING_URLS = {
  checkoutBase: STAGING_CREATE_CHECKOUT_DOMAIN + '/checkout/product/',
  checkoutFrontEndBase: 'https://staging-buy.paddle.dev',
  profitwellSnippetBase: 'https://pw-staging-profitwell-public.paddle.dev/js/profitwell.js',
  apiBase: 'https://staging-api.paddle.dev',
}
export const STAGING_PROFITWELL_URL = 'https://www2.pw-staging.paddle-internal.com'

export const SANDBOX_CREATE_CHECKOUT_DOMAIN = 'https://sandbox-create-checkout.paddle.com'
export const SANDBOX_URLS = {
  checkoutBase: SANDBOX_CREATE_CHECKOUT_DOMAIN + '/checkout/product/',
  checkoutFrontEndBase: 'https://sandbox-buy.paddle.com',
  profitwellSnippetBase: 'https://public.profitwell.com/js/profitwell.js',
  apiBase: 'https://sandbox-api.paddle.com',
}

export const PRODUCTION_CREATE_CHECKOUT_DOMAIN = 'https://create-checkout.paddle.com'
export const PRODUCTION_URLS = {
  checkoutBase: PRODUCTION_CREATE_CHECKOUT_DOMAIN + '/checkout/product/',
  checkoutFrontEndBase: 'https://buy.paddle.com',
  profitwellSnippetBase: 'https://public.profitwell.com/js/profitwell.js',
  apiBase: 'https://api.paddle.com',
}
