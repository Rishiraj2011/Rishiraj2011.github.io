import { ENVIRONMENTS, EnvironmentSettings, EnvironmentValue, EnvProps, LOG_LEVEL } from 'src/globals/types'

import { LOCAL_URLS, DEV_URLS, SANDBOX_URLS, PRODUCTION_URLS, STAGING_URLS, URL_PARAMS } from 'src/constants'

import { hasValue } from 'src/utils'
import { isKnownEnvironment, isValidCustomDomain } from 'src/utils/environment-utils'
import { logger } from 'src/utils/logger'
import { urlParam } from 'src/utils/urls'

function buildCustomDomainSettings(domain: string): EnvironmentSettings {
  const base = /^https?:\/\//.test(domain) ? domain : `https://${domain}`
  return {
    checkoutFrontEndBase: base,
    checkoutBase: LOCAL_URLS.checkoutBase,
    profitwellSnippetBase: LOCAL_URLS.profitwellSnippetBase,
    apiBase: LOCAL_URLS.apiBase,
  }
}

class _Environment {
  env: EnvProps
  constructor() {
    this.env = {
      current: ENVIRONMENTS.PRODUCTION,
      defaults: {
        [ENVIRONMENTS.LOCAL]: {
          ...LOCAL_URLS,
        },
        [ENVIRONMENTS.DEVELOPMENT]: {
          ...DEV_URLS,
        },
        [ENVIRONMENTS.SANDBOX]: {
          ...SANDBOX_URLS,
        },
        [ENVIRONMENTS.STAGING]: {
          ...STAGING_URLS,
        },
        [ENVIRONMENTS.PRODUCTION]: {
          ...PRODUCTION_URLS,
        },
      },
    }
  }

  detect() {
    if (hasValue(urlParam(URL_PARAMS.PADDLE_ENVIRONMENT)) && urlParam(URL_PARAMS.PADDLE_ENVIRONMENT) !== '') {
      logger.log('Environment Detected: ' + urlParam(URL_PARAMS.PADDLE_ENVIRONMENT))
      this.set(urlParam(URL_PARAMS.PADDLE_ENVIRONMENT))
    } else {
      logger.log('Environment Detected: ' + this.get())
    }
  }

  get(): EnvironmentValue {
    return this.env.current
  }

  set(environment: EnvironmentValue) {
    if (!isKnownEnvironment(environment) && !isValidCustomDomain(environment)) {
      logger.log(
        `Unknown environment: "${environment}". Expected one of ${Object.values(ENVIRONMENTS).join(
          ', '
        )} or a valid domain/URL.`,
        LOG_LEVEL.WARNING,
        true
      )
    }
    logger.log('Changing environment to: ' + environment)
    this.env.current = environment
  }

  defaults(): EnvironmentSettings {
    const current = this.env.current
    if (isKnownEnvironment(current)) {
      return this.env.defaults[current]
    }
    return buildCustomDomainSettings(current)
  }
}

export const Environment = new _Environment()
