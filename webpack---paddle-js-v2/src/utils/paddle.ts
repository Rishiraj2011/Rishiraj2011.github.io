import Checkout from 'src/classes/Checkout'

import { URL_PARAMS } from 'src/constants'

import { hasValue, showLoading } from 'src/utils/checkout'
import { urlParam } from 'src/utils/urls'

// Auto-open the checkout if _ptxn={transactionId} is set
export const detectAutoOpenWithTransactionId = (hasSellerId = false) => {
  if (hasValue(urlParam(URL_PARAMS.PADDLE_TRANSACTION))) {
    showLoading()
    const transactionId = urlParam(URL_PARAMS.PADDLE_TRANSACTION)
    if (hasSellerId) Checkout.open({ transactionId })
  }
}

// Detect if __pw_iic={retainId} or __pw={retainId} is set
export const isRetainEnabled = (): boolean => {
  return (
    window.isRetainEnabled ||
    hasValue(urlParam(URL_PARAMS.RETAIN_IDENTIFIER)) ||
    hasValue(urlParam(URL_PARAMS.SHORT_RETAIN_IDENTIFIER))
  )
}

export const getCheckoutAction = (): string => {
  return urlParam(URL_PARAMS.PADDLE_ACTION)
}
