import { CheckoutOutputAttributesProps, objectType } from 'src/globals/types'

import { Environment, Status } from 'src/configs'

import { CheckoutActions } from '../constants'
import { isKnownEnvironment } from './environment-utils'
import { FramePlacement } from './frame-placement'
import { getCheckoutAction, isRetainEnabled } from './paddle'
import { isApplePaySupported } from './payment'

const toString = Object.prototype.toString

export function _isArray(obj: CheckoutOutputAttributesProps) {
  return toString.call(obj) == '[object Array]'
}

function _isFunction(obj: CheckoutOutputAttributesProps) {
  return typeof obj === 'function'
}

function _isObject(obj: CheckoutOutputAttributesProps) {
  return obj === Object(obj)
}

function _isDate(obj: CheckoutOutputAttributesProps) {
  return toString.call(obj) == '[object Date]'
}

function _isRegExp(obj: CheckoutOutputAttributesProps) {
  return toString.call(obj) == '[object RegExp]'
}

function _isBoolean(obj: CheckoutOutputAttributesProps) {
  return toString.call(obj) == '[object Boolean]'
}

function _processKeys(convert: (v: string) => string, obj: CheckoutOutputAttributesProps): any {
  if (!_isObject(obj) || _isDate(obj) || _isRegExp(obj) || _isBoolean(obj) || _isFunction(obj)) {
    return obj
  }
  let output,
    i = 0,
    l = 0

  if (_isArray(obj)) {
    output = []
    for (l = (obj as objectType[]).length; i < l; i++) {
      output.push(_processKeys(convert, obj[i]))
    }
  } else {
    output = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        output[convert(key)] = _processKeys(convert, obj[key])
      }
    }
  }
  return output
}

function separateWords(v: string) {
  return v.split(/(?=[A-Z])/).join('_')
}

function decamelize(v: string) {
  return separateWords(v).toLowerCase()
}

export function camelCaseToSnake(obj: CheckoutOutputAttributesProps) {
  return _processKeys(decamelize, obj)
}

export function validateCheckoutOrigin(origin: string) {
  const regex = /^https:\/\/[a-zA-Z0-9-_]+\.paddle\.(?:com|dev|local)$/g
  if (regex.test(origin)) {
    return true
  }

  const customDomain = Environment.get()
  if (!isKnownEnvironment(customDomain)) {
    const withoutScheme = customDomain.replace(/^https?:\/\//, '')
    const withoutPort = withoutScheme.replace(/:\d+$/, '')
    const expectedOriginBase = `https://${withoutPort}`
    return origin === expectedOriginBase || origin === `https://${withoutScheme}`
  }

  return false
}

export function urlParam(param: string) {
  const vars = {}
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (_, ...theArgs) {
    const [key, value] = theArgs
    vars[key] = value
    return ''
  })

  // We split any return value at the first #, as this indicates the start of a URL fragment, not query string.
  return vars[param] ? vars[param].split('#')[0] : ''
}

export function queryString(obj: CheckoutOutputAttributesProps, prefix?: string): string {
  const str: string[] = []
  for (const p in obj) {
    if (obj.hasOwnProperty(p)) {
      const k = prefix ? prefix + '[' + p + ']' : p,
        v = obj[p]
      if (k != null && k !== '' && v != null && (v !== '' || v === 0) && typeof v != 'function') {
        str.push(typeof v == 'object' ? queryString(v, k) : k + '=' + v)
      }
    }
  }

  return str.join('&')
}

export const attachCheckoutUrl = (windowIFrame: HTMLIFrameElement, url: string) => {
  windowIFrame.src = url
}

const encodeForTransport = (jsonString: string) => {
  /**
   * We double encode URL to ensure the parameters are in ASCII format while in transit
   *  First `encodeURIComponent` is to convert non ASCII chars to ASCII
   *  `btoa` to hash the JSON string
   *  Last `encodeURIComponent` to make it safe for query params
   */
  return encodeURIComponent(window.btoa(encodeURIComponent(jsonString)))
}

export const getCheckoutFrontEndURL = (jsonString: string, sourcePage: string) => {
  const checkoutFrontEndBase = Environment.defaults().checkoutFrontEndBase
  const contextPath = '/paddlejs/v2'
  const sourcePageParam = `?source_page=${encodeURIComponent(sourcePage)}`
  const payload = '#payload=' + encodeForTransport(jsonString)

  return checkoutFrontEndBase + contextPath + sourcePageParam + payload
}

export const getProfitwellSnippetURL = (pwAuth: string) =>
  Environment.defaults().profitwellSnippetBase + '?auth=' + pwAuth

export const buildCheckoutUrl = (
  checkoutProps: CheckoutOutputAttributesProps,
  inline: boolean,
  placement: FramePlacement = {}
) => {
  checkoutProps['paddlejs-version'] = Status.libraryVersion
  // Preserved when already set, so a caller can start the clock before its own setup.
  checkoutProps.checkoutInitiated = checkoutProps.checkoutInitiated ?? new Date().getTime()

  const sourcePage = checkoutProps.settings?.sourcePage || ''
  const checkoutFullUrl = getCheckoutFrontEndURL(JSON.stringify(camelCaseToSnake(checkoutProps)), sourcePage)
  let resultingUrl = inline ? checkoutFullUrl + '&display_mode=inline' : checkoutFullUrl

  if (Status.scriptLoading) {
    resultingUrl = resultingUrl + `&paddlejs-script-loading=${Status.scriptLoading}`
  }

  // add non encoded apple_pay_enabled param | Fixes race condition in FB webview
  resultingUrl = resultingUrl + `&apple_pay_enabled=${isApplePaySupported()}`

  resultingUrl = resultingUrl + `&retain_enabled=${isRetainEnabled()}`

  const action = getCheckoutAction()
  if (action === CheckoutActions.recovery) {
    resultingUrl = resultingUrl + `&action=${action}`
  }

  if (placement.covered !== undefined) {
    resultingUrl = resultingUrl + `&frame_covered=${placement.covered}`
  }
  if (placement.hidden !== undefined) {
    resultingUrl = resultingUrl + `&frame_hidden=${placement.hidden}`
  }

  return resultingUrl
}

export function sanitizeUrl(url?: string | number): string {
  const preventUrl = '#!'
  const XSS_ARRAY_CHECK = [';', '\b', '\f', '\n', '\r', '\t', '\v', '\0', '\x09', '\x0d', '\x0a']

  if (typeof url !== 'string') {
    return preventUrl
  }
  const encodedUrl = encodeURIComponent(url)

  if (!url.length || url.substring(0, 11).toLowerCase() === 'javascript:') {
    return preventUrl
  }

  for (let i = 0; i < XSS_ARRAY_CHECK.length; i++) {
    if (url.indexOf(XSS_ARRAY_CHECK[i]) > -1 || encodedUrl.indexOf(XSS_ARRAY_CHECK[i]) > -1) {
      return preventUrl
    }
  }
  return url
}

export function generateReferrer() {
  try {
    return document.referrer.split('/')[2]
  } catch (e) {
    return null
  }
}
