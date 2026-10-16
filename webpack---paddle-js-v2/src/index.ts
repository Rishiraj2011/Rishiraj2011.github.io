import { Paddle } from 'src/classes/Paddle'

import packageInfo from '../package.json'

interface InitialPwClientQueue {
  q?: any[]
}

interface PwClientFunction {
  (commandName: string, ...commandArgs: any[]): any
  isLoaded?: boolean
}

declare global {
  interface Window {
    opera: string
    _hthck: 0 | 1
    profitwell: InitialPwClientQueue & PwClientFunction
    PaddleWindow?: Window
    PaddleFrame?: HTMLIFrameElement
    isRetainApplePaySupported?: boolean
    isRetainEnabled?: boolean
    ApplePaySession: {
      canMakePayments: () => void
    }
  }
}

const PaddleInstance = new Paddle(packageInfo.version)

export { PaddleInstance as Paddle, PaddleInstance as PaddleBillingV1 }
