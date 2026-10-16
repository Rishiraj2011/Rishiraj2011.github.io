import { RetainCancellationFlowResult } from '@paddle/paddle-js'
import { ENVIRONMENTS, EnvironmentValue, RETAIN_DEMO_FEATURE } from 'src/globals/types'

import { Environment } from 'src/configs'
import { Options } from 'src/configs/Options'

import { STAGING_PROFITWELL_URL } from 'src/constants'

import { hasValue } from 'src/utils'
import { getProfitwellSnippetURL } from 'src/utils/urls'

export interface PaddleSetupPwCustomer {
  id?: string
  email?: string
}

export function initPwSnippet() {
  // If profitwell is already loaded, do nothing. We don't want to initialize it more than once
  // and lose any settings from the first snippet's initial queue.
  if (window.profitwell?.isLoaded) {
    return
  }
  const environment = Environment.get()
  // Don't load the snippet in sandbox, since Retain doesn't have a sandbox environment and
  // therefore we don't support it there yet.
  if (environment === ENVIRONMENTS.SANDBOX) {
    return
  }
  const authToken = getAuthToken()
  if (authToken === null) {
    return
  }
  setupInitialQueue(authToken, environment)
  loadProfitwellScript(authToken)
}

function loadProfitwellScript(authToken: string) {
  // Create the script to dynamically import `profitwell.js` and attach to the head
  const pwScript = document.createElement('script')
  pwScript.src = getProfitwellSnippetURL(authToken)
  const head = document.getElementsByTagName('head')[0]
  head.appendChild(pwScript)
}

function setupInitialQueue(authToken: string, environment: EnvironmentValue = ENVIRONMENTS.PRODUCTION) {
  // Define `profitwell` to capture and queue any calls before the snippet loads
  window.profitwell = (...args: any[]) => {
    window.profitwell.q = window.profitwell.q || []
    window.profitwell.q.push(args)
  }
  const params = {
    auth_token: authToken,
    ...getCustomerIdentityParams(),
    // override the pw_url for staging environment
    ...(environment === ENVIRONMENTS.STAGING && { pw_url: STAGING_PROFITWELL_URL }),
  }
  // Queue the command to start the snippet with the pwAuth token
  window.profitwell('start', params)
}

export function updatePwCustomer(customer: PaddleSetupPwCustomer) {
  if (window.profitwell && customer) {
    if (hasValue(customer.id)) {
      window.profitwell('user_id', customer.id)
    }
    if (hasValue(customer.email)) {
      window.profitwell('user_email', customer.email)
    }
  }
}

function getAuthToken(): string | null {
  const pwAuth = Options.pwAuth
  const token = Options.token
  // If the client token is present, add the paddletoken_ prefix and return it
  if (hasValue(token)) {
    return `paddletoken_${token}`
  }
  // If the client token is not present, check if pwAuth is present and return it
  if (hasValue(pwAuth) && typeof pwAuth === 'string') {
    return pwAuth
  }
  return null
}

function getCustomerIdentityParams() {
  const customer = Options.pwCustomer
  if (customer && hasValue(customer.id)) {
    return { user_id: customer.id }
  }
  if (customer && hasValue(customer.email)) {
    return { user_email: customer.email }
  }
  return null
}

export function initRetainDemo(feature: RETAIN_DEMO_FEATURE) {
  window.profitwell('cq_demo', ...getRetainDemoParams(feature))
}

function getRetainDemoParams(feature: RETAIN_DEMO_FEATURE): string[] {
  switch (feature) {
    case RETAIN_DEMO_FEATURE.CANCELLATION_FLOW:
      return ['cancellation_flow']
    case RETAIN_DEMO_FEATURE.PAYMENT_RECOVERY:
      return ['dunning']
    case RETAIN_DEMO_FEATURE.PAYMENT_RECOVERY_IN_APP:
      return ['in_app']
    case RETAIN_DEMO_FEATURE.TERM_OPTIMIZATION:
      return ['plan_upgrade']
    case RETAIN_DEMO_FEATURE.TERM_OPTIMIZATION_IN_APP:
      return ['plan_upgrade', 'notification']
    case RETAIN_DEMO_FEATURE.PRE_PAYMENT_FAILURE_IN_APP:
      return ['card_watch']
    default:
      throw new Error('Unsupported Retain demo feature')
  }
}

export function initRetainCancellationFlow(subscriptionId?: string): Promise<RetainCancellationFlowResult> {
  if (hasValue(subscriptionId)) {
    return window.profitwell('init_cancellation_flow', { subscription_id: subscriptionId })
  } else {
    return window.profitwell('init_cancellation_flow')
  }
}
