export enum CHECKOUT_EVENTS {
  CHECKOUT_CLOSE = 'checkout.closed',
  CHECKOUT_COMPLETE = 'checkout.completed',
  CHECKOUT_LOADED = 'checkout.loaded',
  CHECKOUT_PING_SIZE = 'checkout.ping.size',
  CHECKOUT_ITEMS_UPDATED = 'checkout.items.updated',
  CHECKOUT_UPDATED = 'checkout.updated',
  CHECKOUT_REMOVE_SPINNER = 'checkout.removespinner',
  CHECKOUT_FAILED = 'checkout.failed',
  CHECKOUT_ERROR = 'checkout.error',
  CHECKOUT_PAYMENT_ERROR = 'checkout.payment.error',
  CHECKOUT_WARNING = 'checkout.warning',
  CHECKOUT_FRAME_REVEALED = 'checkout.frame.revealed',
}

export const TRANSACTION_ACTION = 'transaction-action'

export enum ACTIONS {
  CLOSE = 'close',
  EVENT = 'event',
}
