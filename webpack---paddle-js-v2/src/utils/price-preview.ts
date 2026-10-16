import { AvailablePaymentMethod, PricePreviewItem } from '@paddle/paddle-js'
import { LOG_LEVEL } from 'src/globals/types'

import { INVALID_ALLOWED_PAYMENT_METHODS } from 'src/constants/logs'

import { logger } from 'src/utils/logger'

export const hasValidItems = (items: PricePreviewItem[]) => {
  if (!items || !items.length) {
    return false
  }

  return items.every((item: PricePreviewItem) => {
    return item.priceId && item.quantity
  })
}

export const buildAvailablePaymentMethods = (
  paymentMethods: string | AvailablePaymentMethod[]
): AvailablePaymentMethod[] => {
  if (typeof paymentMethods === 'string') {
    try {
      return JSON.parse(paymentMethods)
    } catch (e) {
      logger.log(INVALID_ALLOWED_PAYMENT_METHODS, LOG_LEVEL.WARNING, true)
      return []
    }
  }
  return paymentMethods
}
