import { DISPLAY_MODE, InternalPaddleSetupOptions, THEME, VARIANT } from 'src/globals/types'

import {
  BOTH_TOKEN_SELLER,
  FAULTY_TOKEN_NO_SELLER,
  NO_TOKEN_NO_SELLER,
  WRONG_SELLER_ID_NO_TOKEN,
} from 'src/constants/logs'

import { hasValue } from 'src/utils'
import { logger } from 'src/utils/logger'

class _Options {
  options: InternalPaddleSetupOptions
  constructor() {
    this.options = {
      pwCustomer: undefined,
      pwAuth: undefined,
      debug: false,
      enableConcurrentVersions: false,
      seller: 0,
      token: undefined,
      eventCallback: undefined,
      checkout: {
        settings: {
          variant: VARIANT.MULTI_PAGE,
          theme: THEME.LIGHT,
          displayMode: DISPLAY_MODE.OVERLAY,
          allowLogout: true,
          allowedPaymentMethods: [],
        },
      },
    }
  }

  update(options: Partial<InternalPaddleSetupOptions>) {
    if (typeof options == 'object') {
      this.updateOptions(options)
    } else {
      throw new Error('[PADDLE] The Options() method accepts an object of options values.')
    }
  }

  set(options: InternalPaddleSetupOptions) {
    if (typeof options == 'object') {
      this.validateSeller(options.seller, options.token)
      // Loop through the 'options' object that is passed to this function.
      this.updateOptions(options)
    } else {
      throw new Error('[PADDLE] The Options() method accepts an object of options values.')
    }
  }

  private updateOptions(options: Partial<InternalPaddleSetupOptions>) {
    for (const option in options) {
      // Check that the option they're trying to override is one we support overriding.
      if (this.options.hasOwnProperty(option)) {
        this.options[option] = options[option]
        // Overwrite the this.options object with the new defined values.
        logger.log("Set option '" + option + "' to '" + options[option] + "'.")
      } else {
        // If it's not an option we support overriding, throw an error.
        throw new Error("[PADDLE] Unknown option parameter '" + option + "'")
      }
    }
  }

  get debug() {
    return this.options.debug
  }

  get eventCallback() {
    return this.options.eventCallback
  }

  get seller() {
    return this.options.seller
  }

  get token() {
    return this.options.token
  }

  get enableConcurrentVersions() {
    return this.options.enableConcurrentVersions
  }

  get theme() {
    return this.options.checkout?.settings.theme
  }

  get displayMode() {
    return this.options.checkout?.settings.displayMode
  }

  get variant() {
    return this.options.checkout?.settings.variant
  }

  get allowLogout() {
    return this.options.checkout?.settings.allowLogout
  }

  get showAddDiscounts() {
    return this.options.checkout?.settings.showAddDiscounts
  }

  get allowDiscountRemoval() {
    return this.options.checkout?.settings.allowDiscountRemoval
  }

  get showAddTaxId() {
    return this.options.checkout?.settings.showAddTaxId
  }

  get showNonExpressPaymentMethods() {
    return this.options.checkout?.settings.showNonExpressPaymentMethods
  }

  get express() {
    return this.options.checkout?.settings.express
  }

  get allowedPaymentMethods() {
    return this.options.checkout?.settings.allowedPaymentMethods
  }

  get locale() {
    return this.options.checkout?.settings.locale
  }
  set successUrl(successUrl: string | undefined) {
    if (this.options.checkout && this.options.checkout.settings) {
      this.options.checkout.settings.successUrl = successUrl
    }
  }
  get successUrl() {
    return this.options.checkout?.settings.successUrl
  }
  get frameTarget() {
    return this.options.checkout?.settings.frameTarget
  }
  get frameStyle() {
    return this.options.checkout?.settings.frameStyle
  }
  get frameInitialHeight() {
    return this.options.checkout?.settings.frameInitialHeight
  }

  get pwCustomer() {
    return this.options.pwCustomer
  }

  get pwAuth() {
    return this.options.pwAuth
  }

  private validateSeller(seller?: number, token?: string) {
    if (!hasValue(seller) && !hasValue(token)) {
      throw new Error(NO_TOKEN_NO_SELLER)
    }
    if (hasValue(seller) && hasValue(token)) {
      throw new Error(BOTH_TOKEN_SELLER)
    }
    // Validate the 'seller' option is of valid type (number)
    if (!hasValue(token) && hasValue(seller) && (seller !== parseInt(`${seller}`, 10) || seller === 0)) {
      throw new Error(WRONG_SELLER_ID_NO_TOKEN)
    }

    if (hasValue(token) && typeof token !== 'string' && !hasValue(seller)) {
      // TODO specify token format
      throw new Error(FAULTY_TOKEN_NO_SELLER)
    }

    // The ID 1234567 is reserved for examples, if someone uses this, throw an error.
    if (seller === 1234567) {
      throw new Error(
        "[PADDLE] You must specify a valid Paddle Seller ID for the 'seller' attribute within the Paddle.Initialize() method. The provided Vendor ID '1234567' is invalid and is used for example purposes. See: https://developer.paddle.com/build/checkout/build-overlay-checkout"
      )
    }
  }
}

export const Options = new _Options()
