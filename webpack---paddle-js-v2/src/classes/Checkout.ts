import { CheckoutLineItem } from '@paddle/paddle-js'
import { closeCheckoutIFrame, renderCheckoutFrame } from 'src/gateway'
import { fireEvent } from 'src/gateway/events.gateway'
import {
  InternalCheckoutOpenOptions,
  CheckoutOutputAttributesProps,
  DISPLAY_MODE,
  Itemtype,
  LOG_LEVEL,
  THEME,
  UpdateCheckoutInputAttributesProps,
  VARIANT,
} from 'src/globals/types'

import { Status } from 'src/configs'
import { Options } from 'src/configs/Options'

import { CHECKOUT_EVENTS, TRANSACTION_ACTION } from 'src/constants/events'
import {
  CHECKOUT_PARAMS_MISSING,
  CREATING_CHECKOUT_LOG,
  ERROR_ADDRESS_ID_AND_OTHER_ATTRIBUTES,
  ERROR_BUSINESS_ID_AND_OTHER_ATTRIBUTES,
  ERROR_CUSTOMER_ID_AND_OTHER_ATTRIBUTES,
  ERROR_CUSTOMER_ID_OR_EMAIL_REQUIRED,
  ERROR_DISCOUNT_ID_AND_DISCOUNT_CODE,
  ERROR_INVALID_SUCCESS_URL,
  ERROR_TRANSACTION_ID_AND_ITEMS,
  ERROR_TRANSACTION_ID_REQUIRED_FOR_UPSELL,
  FAILED_CHECKOUT_INPUT,
  INVALID_CUSTOM_DATA,
  INVALID_ITEMS_ARRAY,
  PADDLE_SETUP_CALL_WARNING,
  UPDATING_CHECKOUT_LOG,
} from 'src/constants/logs'

import { hasValue, isObjectValid, logger } from 'src/utils'
import { isApplePaySupported } from 'src/utils/payment'
import { buildAvailablePaymentMethods } from 'src/utils/price-preview'
import { sanitizeUrl, _isArray, generateReferrer } from 'src/utils/urls'

export const WIDE_OVERLAY = 'wide-overlay'

class Checkout {
  public isOpen: boolean = false
  open(checkoutInputAttributes: InternalCheckoutOpenOptions) {
    closeCheckoutIFrame()
    if (!Status.completedSetup) {
      logger.log(PADDLE_SETUP_CALL_WARNING, LOG_LEVEL.WARNING, true)
    }
    if (typeof checkoutInputAttributes == 'object') {
      runCheckoutInputValidations(checkoutInputAttributes)
      const checkoutProps: CheckoutOutputAttributesProps = buildCheckoutProps(checkoutInputAttributes)

      logger.log(CREATING_CHECKOUT_LOG + JSON.stringify(checkoutProps))

      const frameProps = {
        frameStyle: checkoutProps.settings?.frameStyle,
        frameInitialHeight: checkoutProps.settings?.frameInitialHeight,
        frameTarget: checkoutProps.settings?.frameTarget,
      }
      if (document.readyState !== 'loading') {
        renderCheckoutFrame(checkoutProps, frameProps, checkoutProps.settings?.displayMode === DISPLAY_MODE.INLINE)
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          renderCheckoutFrame(checkoutProps, frameProps, checkoutProps.settings?.displayMode === DISPLAY_MODE.INLINE)
        })
      }
    } else {
      throw new Error(CHECKOUT_PARAMS_MISSING)
    }
  }

  close() {
    fireEvent({
      name: CHECKOUT_EVENTS.CHECKOUT_CLOSE,
      data: {},
    })
    closeCheckoutIFrame()
  }

  updateItems(items: CheckoutLineItem[]) {
    const childFrameWindow = (document.getElementsByName('paddle_frame')[0] as HTMLIFrameElement).contentWindow
    childFrameWindow?.postMessage(
      {
        action: TRANSACTION_ACTION,
        eventName: CHECKOUT_EVENTS.CHECKOUT_ITEMS_UPDATED,
        callbackData: items,
      },
      '*'
    )
  }

  updateCheckout(checkoutInputAttributes: UpdateCheckoutInputAttributesProps) {
    if (typeof checkoutInputAttributes == 'object') {
      runCheckoutInputValidations(checkoutInputAttributes)
      /* We are not passing this data to the iframe. This is just for logging and We are passing user input as-is to CFE.
       *  Why? - No clue. It is probably a bug.
       *  `buildCheckoutProps` is not the correct function to call here. Using this function will break seller's implementation.
       *   TODO: Fix this function when building v3
       */
      const checkoutProps: CheckoutOutputAttributesProps = buildCheckoutProps(checkoutInputAttributes)

      logger.log(UPDATING_CHECKOUT_LOG + JSON.stringify(checkoutProps))

      const childFrameWindow = (document.getElementsByName('paddle_frame')[0] as HTMLIFrameElement).contentWindow
      childFrameWindow?.postMessage(
        {
          action: TRANSACTION_ACTION,
          eventName: CHECKOUT_EVENTS.CHECKOUT_UPDATED,
          callbackData: {
            ...checkoutInputAttributes,
            ...(checkoutProps.customData && { customData: checkoutProps.customData }),
          },
        },
        '*'
      )
    } else {
      throw new Error(CHECKOUT_PARAMS_MISSING)
    }
  }
}

export const runCheckoutInputValidations = (input: InternalCheckoutOpenOptions) => {
  try {
    // check if successUrl starts with http:// | https://
    if (input.settings?.successUrl) {
      const url = input.settings.successUrl
      const re = new RegExp('^https?://', 'i')
      if (!re.test(url)) throw Error(ERROR_INVALID_SUCCESS_URL)
    }
    const items = typeof input.items === 'string' ? JSON.parse(input.items) : input.items
    const { transactionId, customer, upsell } = input
    if (hasValue(transactionId) && _isArray(items) && items.length > 0) {
      throw new Error(ERROR_TRANSACTION_ID_AND_ITEMS)
    }
    if (hasValue(input.discountId) && hasValue(input.discountCode)) {
      throw new Error(ERROR_DISCOUNT_ID_AND_DISCOUNT_CODE)
    }
    if (customer && isObjectValid(customer) && !hasValue(customer?.id) && !hasValue(customer?.email)) {
      throw Error(ERROR_CUSTOMER_ID_OR_EMAIL_REQUIRED)
    }
    if (customer && isObjectValid(customer) && hasValue(customer?.id) && hasValue(customer?.email)) {
      throw Error(ERROR_CUSTOMER_ID_AND_OTHER_ATTRIBUTES)
    }
    if (upsell && isObjectValid(upsell) && !hasValue(upsell.transactionId)) {
      throw Error(ERROR_TRANSACTION_ID_REQUIRED_FOR_UPSELL)
    }
    if (
      customer &&
      customer.address &&
      isObjectValid(customer) &&
      isObjectValid(customer.address) &&
      hasValue(customer.address?.id) &&
      Object.keys(customer.address).length > 1
    ) {
      throw Error(ERROR_ADDRESS_ID_AND_OTHER_ATTRIBUTES)
    }
    if (
      customer &&
      customer.business &&
      isObjectValid(customer) &&
      isObjectValid(customer.business) &&
      hasValue(customer.business?.id) &&
      Object.keys(customer.business).length > 1
    ) {
      throw Error(ERROR_BUSINESS_ID_AND_OTHER_ATTRIBUTES)
    }
  } catch (error) {
    throw new Error(`${FAILED_CHECKOUT_INPUT}${error}`)
  }
}

export const buildCheckoutProps = (input: InternalCheckoutOpenOptions) => {
  // Determine the variant first as it affects other settings
  const variant = input.settings?.variant ?? Options.variant ?? VARIANT.MULTI_PAGE
  const isExpressVariant = variant === VARIANT.EXPRESS

  // Fields destructured out of the settings spread are defaulted (and gated to the express
  // variant where applicable) below instead of flowing through verbatim.
  const {
    allowLogout: inputAllowLogout,
    showNonExpressPaymentMethods: inputShowNonExpressPaymentMethods,
    express: inputExpress,
    ...remainingInputSettings
  } = input.settings || {}
  const showNonExpressPaymentMethods = inputShowNonExpressPaymentMethods ?? Options.showNonExpressPaymentMethods
  const express = inputExpress ?? Options.express
  const expressVariantSettings = isExpressVariant
    ? {
        showNonExpressPaymentMethods: showNonExpressPaymentMethods ?? true,
        ...(express && { express }),
      }
    : {}

  const checkoutProps: CheckoutOutputAttributesProps = {
    ...(hasValue(input.discountId) && {
      discountId: input.discountId,
    }),
    ...(hasValue(input.discountCode) && {
      discountCode: input.discountCode,
    }),
    ...(hasValue(input.transactionId) && {
      transactionId: input.transactionId,
    }),
    ...(hasValue(input.customer) && {
      customer: input.customer,
    }),

    ...(hasValue(input.settings) && {
      settings: {
        ...remainingInputSettings,
        ...((input.settings?.successUrl || Options.successUrl) && {
          successUrl: sanitizeUrl(input.settings?.successUrl || Options.successUrl),
        }),
        ...((input.settings?.locale || Options.locale) && {
          locale: input.settings?.locale || Options.locale,
        }),
        ...((input.settings?.frameTarget || Options.frameTarget) && {
          frameTarget: input.settings?.frameTarget || Options.frameTarget,
        }),
        ...((input.settings?.frameStyle || Options.frameStyle) && {
          frameStyle: input.settings?.frameStyle || Options.frameStyle,
        }),
        ...((input.settings?.frameInitialHeight || Options.frameInitialHeight) && {
          frameInitialHeight: input.settings?.frameInitialHeight || Options.frameInitialHeight,
        }),
        theme: input.settings?.theme || Options.theme || THEME.LIGHT,
        allowLogout: inputAllowLogout ?? (isExpressVariant ? false : Options.allowLogout ?? true),
        showAddDiscounts:
          input.settings?.showAddDiscounts ?? Options.showAddDiscounts ?? (isExpressVariant ? false : true),
        allowDiscountRemoval:
          input.settings?.allowDiscountRemoval ?? Options.allowDiscountRemoval ?? (isExpressVariant ? false : true),
        showAddTaxId: input.settings?.showAddTaxId ?? Options.showAddTaxId ?? (isExpressVariant ? false : true),
        ...expressVariantSettings,
        variant,
        displayMode:
          (input.settings?.displayMode ?? Options.displayMode) === DISPLAY_MODE.INLINE
            ? DISPLAY_MODE.INLINE
            : WIDE_OVERLAY,

        ...(input.settings?.allowedPaymentMethods
          ? { allowedPaymentMethods: buildAvailablePaymentMethods(input.settings?.allowedPaymentMethods) ?? [] }
          : {}),
      },
    }),
    ...(!hasValue(input.settings) && {
      settings: {
        theme: Options.theme || THEME.LIGHT,
        allowLogout: inputAllowLogout ?? (isExpressVariant ? false : Options.allowLogout ?? true),
        showAddDiscounts: Options.showAddDiscounts ?? (isExpressVariant ? false : true),
        allowDiscountRemoval: Options.allowDiscountRemoval ?? (isExpressVariant ? false : true),
        showAddTaxId: Options.showAddTaxId ?? (isExpressVariant ? false : true),
        ...expressVariantSettings,
        displayMode: Options.displayMode === DISPLAY_MODE.INLINE ? DISPLAY_MODE.INLINE : WIDE_OVERLAY,
        variant,
        ...(Options.locale && { locale: Options.locale }),
        ...(Options.successUrl && { successUrl: sanitizeUrl(Options.successUrl) }),
        ...(Options.frameTarget && { frameTarget: Options.frameTarget }),
        ...(Options.frameStyle && { frameStyle: Options.frameStyle }),
        ...(Options.frameInitialHeight && { frameInitialHeight: Options.frameInitialHeight }),
        ...(Options.allowedPaymentMethods && { allowedPaymentMethods: Options.allowedPaymentMethods }),
      },
    }),

    // Saved Payment method related fields
    ...(hasValue(input.customerAuthToken) && {
      customerAuthToken: input.customerAuthToken,
    }),
    ...(hasValue(input.savedPaymentMethodId) && {
      savedPaymentMethodId: input.savedPaymentMethodId,
    }),
    ...(hasValue(input.upsell) && {
      upsell: {
        // The empty string is just to make the types happy. `transactionId` will always be available.
        transactionId: input.upsell?.transactionId ?? '',
        settings: {
          showSkipButton: input.upsell?.settings?.showSkipButton ?? true,
        },
      },
    }),
  }

  // TODO: Temporary fix for successUrl. This should be removed once we have a proper state management to handle properties used to load a checkout
  if (input.settings) {
    if (input.settings.successUrl) {
      Options.successUrl = input.settings.successUrl
    }
  }
  if (hasValue(input.customData)) {
    try {
      // When we pass this value using `data-custom-data` html attribute it will be a string. So we are parsing it to check its validity
      const customData = typeof input.customData === 'string' ? JSON.parse(input.customData) : input.customData
      if (isObjectValid(customData)) {
        checkoutProps.customData = JSON.stringify(customData)
      } else {
        throw new Error('Invalid custom data')
      }
    } catch (e) {
      logger.log(INVALID_CUSTOM_DATA, LOG_LEVEL.WARNING, true)
    }
  }
  if (hasValue(input.items)) {
    try {
      // When we pass this value using `data-custom-data` html attribute it will be a string. So we are parsing it to check its validity
      const items = typeof input.items === 'string' ? JSON.parse(input.items) : input.items
      if (_isArray(items)) {
        checkoutProps.items = items.map((item: Itemtype) => (!item.quantity ? { ...item, quantity: 1 } : item))
      } else {
        throw new Error('Invalid items array')
      }
    } catch (e) {
      logger.log(INVALID_ITEMS_ARRAY, LOG_LEVEL.WARNING, true)
    }
  }

  // add sellerId to checkout. Seller ID is required and passed in during Paddle.setup() before checkout.open() is called
  // add token to checkout. cst token is optional and passed in during Paddle.setup() before checkout.open() is called
  if (Options.seller) checkoutProps.sellerId = Options.seller
  if (Options.token) checkoutProps.clientToken = Options.token
  checkoutProps.applePayEnabled = isApplePaySupported()

  if (checkoutProps.settings) {
    checkoutProps.settings.sourcePage = window.location.href
    checkoutProps.settings.referrer = generateReferrer()
  }

  return checkoutProps
}

export default new Checkout()
