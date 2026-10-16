import {
  CheckoutLineItem,
  PricePreviewParams,
  PricePreviewResponse,
  RetainCancellationFlowAttributeProps,
  RetainCancellationFlowResult,
  RetainDemoAttributeProps,
  TransactionPreviewParams,
  TransactionPreviewResponse,
} from '@paddle/paddle-js'
import { listen } from 'src/gateway/events.gateway'
import { initPwSnippet, updatePwCustomer } from 'src/gateway/profitwell.gateway'
import {
  EnvironmentValue,
  InternalCheckoutOpenOptions,
  InternalPaddleSetupOptions,
  LOG_LEVEL,
  UpdateCheckoutInputAttributesProps,
} from 'src/globals/types'

import Checkout from 'src/classes/Checkout'
import { PricePreview } from 'src/classes/PricePreview'
import Retain from 'src/classes/Retain'
import { TransactionPreview } from 'src/classes/TransactionPreview'

import { Environment, Status } from 'src/configs'
import { Options } from 'src/configs/Options'

import { CLASSES } from 'src/constants'
import { PADDLE_SETUP_ERROR } from 'src/constants/logs'

import {
  addButtonStylesheet,
  detectScriptLoading,
  hasValue,
  hideLoading,
  loadButtons,
  logger,
  showLoading,
} from 'src/utils'
import { getButtonAttributes } from 'src/utils/html'
import { detectAutoOpenWithTransactionId } from 'src/utils/paddle'

export class Paddle {
  Checkout: {
    open: (parameters: InternalCheckoutOpenOptions) => void
    close: () => void
    updateCheckout: (parameters: UpdateCheckoutInputAttributesProps) => void
    updateItems: (parameters: CheckoutLineItem[]) => void
  }
  Retain: {
    demo: (parameters: RetainDemoAttributeProps) => void
    initCancellationFlow: (parameters: RetainCancellationFlowAttributeProps) => Promise<RetainCancellationFlowResult>
  }
  Environment: {
    detect: () => void
    get: () => EnvironmentValue
    set: (environment: EnvironmentValue) => void
  }
  PricePreview: (params: PricePreviewParams) => Promise<PricePreviewResponse>
  TransactionPreview: (params: TransactionPreviewParams) => Promise<TransactionPreviewResponse>

  Spinner: {
    show: () => string | void
    hide: () => void
  }

  Status: {
    libraryVersion: string
  }

  constructor(version: string) {
    Status.libraryVersion = version

    Status.scriptLoading = detectScriptLoading()

    this.Status = {
      libraryVersion: version,
    }

    // perform health check as soon as Paddlejs init
    window._hthck = 1

    // Public methods
    this.Checkout = {
      open: (options: InternalCheckoutOpenOptions) => Checkout.open(options),
      close: () => Checkout.close(),
      updateCheckout: (options: UpdateCheckoutInputAttributesProps) => Checkout.updateCheckout(options),
      updateItems: (options: CheckoutLineItem[]) => Checkout.updateItems(options),
    }

    this.Retain = {
      demo: (parameters: RetainDemoAttributeProps) => Retain.demo(parameters),
      initCancellationFlow: (parameters: RetainCancellationFlowAttributeProps) =>
        Retain.initCancellationFlow(parameters),
    }

    this.Environment = {
      detect: () => Environment.detect(),
      get: () => Environment.get(),
      set: (environment) => Environment.set(environment),
    }

    this.PricePreview = PricePreview
    this.TransactionPreview = TransactionPreview

    // Public methods for working with loading spinners.
    this.Spinner = {
      show: showLoading,
      hide: hideLoading,
    }

    this.Status = {
      libraryVersion: Status.libraryVersion,
    }
  }

  Options(options: InternalPaddleSetupOptions) {
    Options.set(options)
  }

  // Setup is called once per session, here we do anything global, like setting listeners...
  // @deprecated - Use `Initialize` function instead
  Setup(options: InternalPaddleSetupOptions) {
    this._setup(options)
  }

  /**
   * A flag to help users identify if the library has been initialized.
   */
  get Initialized() {
    return Status.completedSetup
  }
  /** Initialize should be called only once per session,
   *  We initialize Paddle Pay button and add event listeners.
   */
  Initialize(options: InternalPaddleSetupOptions) {
    this._setup(options)
  }

  /** Update can be called multiple times,
   *  We update the options stored in memory with new values for eventCallback
   */
  Update(options: Partial<InternalPaddleSetupOptions>) {
    Options.update(options)
    if (options.pwCustomer) {
      updatePwCustomer(options.pwCustomer)
    }
  }

  private _setup(options: InternalPaddleSetupOptions) {
    if (!Status.completedSetup) {
      addButtonStylesheet()
      // Here we would look for 'paddle_button' items, and call a function to iterate
      // over them, like this.Paddle.Button.load(); ('this' is required due to our current scope)
      loadButtons()
      // Mark the library as having completed setup, so we don't run this block more than once
      // even if there are multiple <script>'s with Paddle.js on the page.
      Status.completedSetup = true
      // Fire a 'completed setup' debug event, just for verbosity.
      logger.log('[PADDLE BILLING] Completed library setup.')
      // Start listeners.
      listen()
      // Detect/set checkout environment.
      Environment.detect()

      // Public methods
      if (hasValue(options.seller) || hasValue(options.token)) {
        Options.set(options)
      } else {
        throw new Error(PADDLE_SETUP_ERROR)
      }

      // Detect any auto-open URL parameters again as setup is completed.
      detectAutoOpenWithTransactionId(hasValue(Options.seller) || hasValue(Options.token))

      // Load the Profitwell snippet if the pwAuth option is set
      initPwSnippet()
    } else {
      logger.log(
        '[PADDLE BILLING] Cannot call Paddle.Initialize() more than once per page, the call was ignored.',
        LOG_LEVEL.WARNING
      )
    }
  }
}

export const _onReady = () => {
  const firstButton: HTMLButtonElement | undefined = hasValue(document.getElementsByClassName(CLASSES.PADDLE_BUTTON)[0])
    ? (document.getElementsByClassName(CLASSES.PADDLE_BUTTON)[0] as HTMLButtonElement)
    : undefined

  if (firstButton) {
    const buttonAttributes = getButtonAttributes(firstButton)
    Checkout.open(buttonAttributes)
  }
}
