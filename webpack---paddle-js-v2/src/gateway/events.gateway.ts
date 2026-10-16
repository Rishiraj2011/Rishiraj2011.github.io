import { PaddleEventData } from '@paddle/paddle-js'
import { closeCheckoutIFrame } from 'src/gateway/iframe.gateway'
import { EventData } from 'src/globals/types'

import Checkout from 'src/classes/Checkout'

import { Options } from 'src/configs/Options'

import { ACTIONS, CHECKOUT_EVENTS } from 'src/constants/events'
import { CHECKOUT_ERROR_LOG, CHECKOUT_WARNING_LOG } from 'src/constants/logs'

import { hideLoading } from 'src/utils'
import { redirectOnComplete, updateFrameHeight } from 'src/utils/checkout'
import { validateCheckoutOrigin } from 'src/utils/urls'

function shouldSkipSendingEvents(): boolean {
  return !!(Options.enableConcurrentVersions && !Checkout.isOpen)
}

interface CheckoutErrorData {
  type?: string
  code?: string
  detail?: string
  errors?: unknown
}

interface CheckoutFieldError {
  field?: string
  message: string
}

function isFieldError(value: unknown): value is CheckoutFieldError {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const { field, message } = value as Partial<CheckoutFieldError>
  return typeof message === 'string' && (field === undefined || typeof field === 'string')
}

// Pointers use the checkout service's request shape; sellers know the Paddle.Checkout.open() option names.
// The raw pointer stays alongside in case the two ever diverge.
function describeField(field: string) {
  if (!field.startsWith('/')) {
    return field
  }

  const option = field
    .split('/')
    .filter(Boolean)
    .filter((part, index) => !(index === 0 && part === 'data'))
    .map((part) =>
      /^\d+$/.test(part) ? `[${part}]` : `.${part.replace(/_([a-z])/g, (_, char) => char.toUpperCase())}`
    )
    .join('')
    .replace(/^\./, '')

  return option ? `${option} (${field})` : field
}

function formatCheckoutProblem(prefix: string, { code, detail, errors }: CheckoutErrorData) {
  const fieldErrors = Array.isArray(errors) ? errors.filter(isFieldError) : []
  // The checkout copies the first field error into detail, so it's often a repeat.
  const repeatsDetail = fieldErrors.some(({ field, message }) => field && message === detail)
  const lines = [(prefix + (repeatsDetail ? '' : detail ?? code ?? '')).trimEnd()]

  fieldErrors
    .filter(({ field, message }) => field || message !== detail)
    .forEach(({ field, message }) => lines.push(field ? `  ${describeField(field)}: ${message}` : `  ${message}`))

  return lines.join('\n')
}

// The checkout only reports errors through eventCallback, which most sellers don't log.
// Front-end errors are buyer input mistakes, so they warn instead of erroring.
function logCheckoutError(data: CheckoutErrorData) {
  const log = data.type === 'api_error' ? console.error : console.warn
  log(formatCheckoutProblem(CHECKOUT_ERROR_LOG, data))
}

// Warnings mean the checkout opened but dropped some of the seller's options, such as an invalid prefilled email.
function logCheckoutWarning(data: CheckoutErrorData) {
  console.warn(formatCheckoutProblem(CHECKOUT_WARNING_LOG, data))
}

/**
The original eventData sent by CFE has this structure:
{
  action: '',
  event_name: '',
  callback_data: {}
}

When we fire the event to sellers we want to hide the extra fields and only send the contents of `callback_data`:
{
  name: '',
  data: {}
}
 */
export const _messageListener = function (message: MessageEvent) {
  if (
    message?.data?.event_name &&
    [CHECKOUT_EVENTS.CHECKOUT_LOADED, CHECKOUT_EVENTS.CHECKOUT_FAILED].includes(message.data.event_name)
  ) {
    Checkout.isOpen = true
  }

  if (!validateCheckoutOrigin(message.origin) || shouldSkipSendingEvents()) {
    return
  }
  const { data } = message
  if (data.action === ACTIONS.EVENT || data.action === ACTIONS.CLOSE) {
    fireEvent({
      ...data.callback_data,
    })
    switch (data.event_name?.toLowerCase()) {
      case CHECKOUT_EVENTS.CHECKOUT_CLOSE:
        closeCheckoutIFrame()
        break
      case CHECKOUT_EVENTS.CHECKOUT_REMOVE_SPINNER:
      case CHECKOUT_EVENTS.CHECKOUT_LOADED:
        hideLoading()
        break
      case CHECKOUT_EVENTS.CHECKOUT_PING_SIZE:
        updateFrameHeight(data)
        break
      case CHECKOUT_EVENTS.CHECKOUT_COMPLETE:
        redirectOnComplete()
        break
      case CHECKOUT_EVENTS.CHECKOUT_ERROR:
      case CHECKOUT_EVENTS.CHECKOUT_PAYMENT_ERROR:
        logCheckoutError(data.callback_data ?? {})
        break
      case CHECKOUT_EVENTS.CHECKOUT_WARNING:
        logCheckoutWarning(data.callback_data ?? {})
        break
    }
  }
}

// Listen for messages from the checkout
export function listen(): void {
  window.addEventListener('message', _messageListener, false)
}

export function fireEvent(eventData: EventData) {
  if (typeof Options.eventCallback == 'function') {
    Options.eventCallback(eventData as PaddleEventData)
  }
}
