import { RetainCancellationFlowAttributeProps, RetainDemoAttributeProps } from '@paddle/paddle-js'
import { initRetainCancellationFlow, initRetainDemo } from 'src/gateway/profitwell.gateway'
import { RETAIN_DEMO_FEATURE } from 'src/globals/types'

import { Options } from 'src/configs/Options'

import { hasValue } from 'src/utils'

class Retain {
  demo(retainDemoAttributes: RetainDemoAttributeProps) {
    if (!hasValue(Options.token) && !hasValue(Options.pwAuth)) {
      throw new Error('[PADDLE] Options.token or Options.pwAuth must be set for Paddle.Retain.demo()')
    }

    initRetainDemo(retainDemoAttributes.feature as RETAIN_DEMO_FEATURE)
  }

  initCancellationFlow(retainCancellationFlowAttributes?: RetainCancellationFlowAttributeProps) {
    if (!hasValue(Options.token) && !hasValue(Options.pwAuth)) {
      throw new Error('[PADDLE] Options.token or Options.pwAuth must be set for Paddle.Retain.initCancellationFlow()')
    }
    if (!hasValue(Options.pwCustomer) && !retainCancellationFlowAttributes?.subscriptionId) {
      throw new Error('[PADDLE] pwCustomer or subscriptionId required to use Paddle.Retain.initCancellationFlow')
    }

    return initRetainCancellationFlow(retainCancellationFlowAttributes?.subscriptionId)
  }
}

export default new Retain()
