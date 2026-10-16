import { AvailablePaymentMethod, CheckoutCustomerAddress, CheckoutCustomerBusiness } from '@paddle/paddle-js'
import { InternalCheckoutOpenOptions, DISPLAY_MODE, LOG_LEVEL, THEME, VARIANT_TYPE } from 'src/globals/types'

import Checkout from 'src/classes/Checkout'

import { Environment, Status } from 'src/configs'

import { CLASSES, DATA_ATTRIBUTES, getResource } from 'src/constants'

import { logger } from 'src/utils/logger'

export function addButtonStylesheet(): void {
  const env = Environment.get()
  if (!Status.loadedButtonStylesheet) {
    const head = document.getElementsByTagName('head')[0]
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = getResource(env).PADDLE_CSS_FILE
    link.media = 'all'
    head.appendChild(link)

    Status.loadedButtonStylesheet = true
  }
}

export function nodeToString(node?: HTMLDivElement | null) {
  let tmpNode: HTMLDivElement | null = document.createElement('div') as HTMLDivElement
  if (node) tmpNode.appendChild(node.cloneNode(true))

  const str = tmpNode.innerHTML
  tmpNode = node = null // prevent memory leaks in IE

  return str
}

export function each(className: string, callback?: (e: any) => void) {
  const elements: HTMLCollectionOf<Element> = document.getElementsByClassName(className) as HTMLCollectionOf<Element> // a live nodeList

  for (let i = 0; i < elements.length; i++) {
    const thisElement = elements[i]

    if (typeof callback === 'function') {
      callback(thisElement)
    } else {
      throw new Error('each(className, function() {... requires the callback argument to be of type Function')
    }

    // Might need to reverse the order in which we loop through, unsure. See:
    // http://stackoverflow.com/questions/15843581/how-to-corectly-iterate-through-getelementsbyclassname
  }
}

export function loadButtons() {
  ready(_onLoadButtonsReady)
}

export function hasClass(el: Element | HTMLElement, className: string) {
  if (el.classList) {
    return el.classList.contains(className)
  } else {
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
  }
}

export function addClass(el: HTMLElement | Element, className: string) {
  if (el.classList) {
    el.classList.add(className)
  } else if (!hasClass(el, className)) {
    el.className += ' ' + className
  }
}

export function removeClass(el: HTMLElement | Element, className: string) {
  if (el.classList) {
    el.classList.remove(className)
  } else if (hasClass(el, className)) {
    const reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className = el.className.replace(reg, ' ')
  }
}

export function addButtonTheme(buttonElement: HTMLElement, theme?: string) {
  if (theme !== 'none') {
    addClass(buttonElement, CLASSES.PADDLE_STYLED_BUTTON)

    if (theme === THEME.GREEN) {
      addClass(buttonElement, CLASSES.GREEN)
    } else if (theme === THEME.LIGHT) {
      addClass(buttonElement, CLASSES.LIGHT)
    } else if (theme === THEME.DARK) {
      addClass(buttonElement, CLASSES.DARK)
    }
  }
}

export function getButtonAttributes(buttonElement: HTMLElement | HTMLButtonElement): InternalCheckoutOpenOptions {
  // Create a friendly object of recognised attributes from the button (named correctly)
  const discountId = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_DISCOUNT_ID)
  const discountCode = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_DISCOUNT_CODE)
  const transactionId = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_TRANSACTION_ID)
  const items = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_ITEMS)
  const customData = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_CUSTOM_DATA)
  const id = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_CUSTOMER_ID)
  const email = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_CUSTOMER_EMAIL)
  const name = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_BUSINESS_NAME)
  const businessId = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_BUSINESS_ID)
  const taxIdentifier = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_BUSINESS_TAX_ID)
  const firstLine = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_CUSTOMER_ADDRESS_FIRST_LINE)
  const city = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_CUSTOMER_ADDRESS_CITY)
  const region = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_CUSTOMER_ADDRESS_REGION)
  const addressId = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_CUSTOMER_ADDRESS_ID)
  const countryCode = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_CUSTOMER_ADDRESS_COUNTRY_CODE)
  const postalCode = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_CUSTOMER_ADDRESS_POSTAL_CODE)
  const locale = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_LOCALE)
  const displayMode = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_DISPLAY_MODE)
  const theme = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_THEME)
  const variant = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_VARIANT)
  const successUrl = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_SUCCESS_URL)
  const allowLogout = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_ALLOW_LOGOUT)
  const showAddDiscounts = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_SHOW_ADD_DISCOUNTS)
  const allowDiscountRemoval = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_ALLOW_DISCOUNT_REMOVAL)
  const showAddTaxId = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_SHOW_ADD_TAX_ID)
  const showNonExpressPaymentMethods = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_SHOW_NON_EXPRESS_PAYMENT_METHODS)
  const allowedPaymentMethods = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_ALLOWED_PAYMENT_METHODS)
  const customerAuthToken = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_CUSTOMER_AUTH_TOKEN)
  const savedPaymentMethodId = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_SAVED_PAYMENT_METHOD_ID)

  // Upsell
  const upsellTransactionId = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_UPSELL_TRANSACTION_ID)
  const upsellShowSkipButton = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_UPSELL_SHOW_SKIP_BUTTON)

  const buttonAttributes: Partial<InternalCheckoutOpenOptions> = {
    ...(discountId && { discountId }),
    ...(discountCode && { discountCode }),
    ...(transactionId && { transactionId }),
    ...(customData && { customData }),
    ...(items && { items }),
    ...(customerAuthToken && { customerAuthToken }),
    ...(savedPaymentMethodId && { savedPaymentMethodId }),
  }
  if (id || email) {
    buttonAttributes.customer = {
      ...(id && { id }),
      ...(email && { email }),
    } as InternalCheckoutOpenOptions['customer']
  }
  if (addressId || postalCode || countryCode || firstLine || city || region) {
    buttonAttributes.customer = (buttonAttributes.customer || {}) as InternalCheckoutOpenOptions['customer']
    if (buttonAttributes.customer) {
      buttonAttributes.customer.address = {
        ...(addressId && { id: addressId }),
        ...(postalCode && { postalCode }),
        ...(countryCode && { countryCode }),
        ...(firstLine && { firstLine }),
        ...(city && { city }),
        ...(region && { region }),
      } as CheckoutCustomerAddress
    }
  }
  if (businessId || name || taxIdentifier) {
    buttonAttributes.customer = (buttonAttributes.customer || {}) as InternalCheckoutOpenOptions['customer']
    if (buttonAttributes.customer) {
      buttonAttributes.customer.business = {
        ...(businessId && { id: businessId }),
        ...(name && { name }),
        ...(taxIdentifier && { taxIdentifier }),
      } as CheckoutCustomerBusiness
    }
  }

  if (
    locale ||
    theme ||
    displayMode ||
    variant ||
    successUrl ||
    allowLogout ||
    showAddDiscounts ||
    showAddTaxId ||
    showNonExpressPaymentMethods ||
    allowDiscountRemoval
  ) {
    buttonAttributes.settings = {
      ...(locale && { locale }),
      ...(theme && { theme: theme as THEME }),
      ...(displayMode && { displayMode: displayMode as DISPLAY_MODE }),
      ...(variant && { variant: variant as VARIANT_TYPE }),
      ...(successUrl && { successUrl }),
      ...(allowLogout && { allowLogout: allowLogout === 'true' }),
      ...(showAddDiscounts && { showAddDiscounts: showAddDiscounts === 'true' }),
      ...(allowDiscountRemoval && { allowDiscountRemoval: allowDiscountRemoval === 'true' }),
      ...(showAddTaxId && { showAddTaxId: showAddTaxId === 'true' }),
      ...(showNonExpressPaymentMethods && {
        showNonExpressPaymentMethods: showNonExpressPaymentMethods === 'true',
      }),
      ...(allowedPaymentMethods && {
        allowedPaymentMethods: allowedPaymentMethods as unknown as AvailablePaymentMethod[],
      }),
    }
  }

  if (upsellTransactionId) {
    buttonAttributes.upsell = {
      transactionId: upsellTransactionId,
      settings: {
        showSkipButton: upsellShowSkipButton ? upsellShowSkipButton === 'true' : true,
      },
    }
  }

  return buttonAttributes as InternalCheckoutOpenOptions
}

export const _onLoadButtonsReady = () => {
  let buttonCounter = 0
  each('paddle_button', function (buttonElement: HTMLElement) {
    const paddleVersion: string = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_PADDLE_VERSION) ?? 'v1'
    if (paddleVersion !== 'v1') {
      return
    }

    // Has this button already been initialised?
    const _buttonHasInit = buttonElement.getAttribute(DATA_ATTRIBUTES.DATA_INIT) === 'true'

    // If this isn't the first init, remove any Paddle click handlers, buttonAttributes is cached, this will force it to fetch fresh values.
    if (_buttonHasInit) {
      // This method of cloning the element means we do not have to keep track of handlers we've added.
      const buttonClone = buttonElement.cloneNode(true) as HTMLElement
      buttonElement.parentNode?.replaceChild(buttonClone, buttonElement)
      buttonElement = buttonClone
    }

    // Get the Button Attributes for theme etc...
    const buttonAttributes = getButtonAttributes(buttonElement)

    // Apply theme to the button if required.
    addButtonTheme(buttonElement, buttonAttributes?.settings?.theme)

    // Add an attribute indicating the button has a handler
    buttonElement.setAttribute(DATA_ATTRIBUTES.DATA_INIT, 'true')

    // On click, we should open a checkout with friendly attributes object from above...
    buttonElement.addEventListener('click', function (event: Event) {
      // Prevents page from scrolling to top if this is an anchor.
      event.preventDefault()

      // Get latest button attributes on each click.
      const buttonAttributes = getButtonAttributes(buttonElement)
      // asserting here since productId is provided
      Checkout.open(buttonAttributes as InternalCheckoutOpenOptions)
    })

    buttonCounter++

    // Send a sensible log message for each button rendered.
    if (buttonAttributes.transactionId) {
      logger.log(
        'Loaded and initiated checkout button for Transaction ID: ' +
          buttonAttributes.transactionId +
          ' (Paddle Button #' +
          buttonCounter +
          ')'
      )
    } else if (buttonAttributes.items) {
      logger.log(
        'Loaded and initiated checkout button for items: ' +
          JSON.stringify(buttonAttributes.items) +
          ' (Paddle Button #' +
          buttonCounter +
          ')'
      )
    } else {
      logger.log(
        'Initiated a checkout button without a transaction Id or price Id. (Paddle Button #' + buttonCounter + ')',
        LOG_LEVEL.WARNING
      )
    }
  })
}

export const ready = (function () {
  let readyList: Record<string, any>, DOMContentLoaded: EventListenerOrEventListenerObject
  const class2type = {}
  class2type['[object Boolean]'] = 'boolean'
  class2type['[object Number]'] = 'number'
  class2type['[object String]'] = 'string'
  class2type['[object Function]'] = 'function'
  class2type['[object Array]'] = 'array'
  class2type['[object Date]'] = 'date'
  class2type['[object RegExp]'] = 'regexp'
  class2type['[object Object]'] = 'object'

  const ReadyObj = {
    // Is the DOM ready to be used? Set to true once it occurs.
    isReady: false,
    // A counter to track how many items to wait for before
    // the ready event fires. See #6781
    readyWait: 1,
    // Hold (or release) the ready event
    holdReady: function (hold: boolean) {
      if (hold) {
        ReadyObj.readyWait++
      } else {
        ReadyObj.ready(true)
      }
    },
    // Handle when the DOM is ready
    ready: function (wait: boolean = false): undefined {
      // Either a released hold or an DOMready/load event and not yet ready
      if ((wait === true && !--ReadyObj.readyWait) || (wait !== true && !ReadyObj.isReady)) {
        // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
        if (!document.body) {
          setTimeout(ReadyObj.ready, 1)
          return
        }

        // Remember that the DOM is ready
        ReadyObj.isReady = true
        // If a normal DOM Ready event fired, decrement, and wait if need be
        if (wait !== true && --ReadyObj.readyWait > 0) {
          return
        }
        // If there are functions bound, to execute
        readyList.resolveWith(document, [ReadyObj])

        // Trigger any bound ready events
        //if ( ReadyObj.fn.trigger ) {
        //  ReadyObj( document ).trigger( "ready" ).unbind( "ready" );
        //}
        return
      }
      return
    },

    bindReady: function () {
      if (readyList) {
        return
      }
      readyList = ReadyObj._Deferred()

      // Catch cases where $(document).ready() is called after the
      // browser event has already occurred.
      if (document.readyState === 'complete') {
        // Handle it asynchronously to allow scripts the opportunity to delay ready
        return setTimeout(ReadyObj.ready, 1)
      }

      // Mozilla, Opera and webkit nightlies currently support this event
      if (document.addEventListener) {
        // Use the handy event callback
        document.addEventListener('DOMContentLoaded', DOMContentLoaded, false)
        // A fallback to window.onload, that will always work
        window.addEventListener('load', ReadyObj.ready as any, false)

        // If IE event model is used
      } else if ((document as any).attachEvent) {
        // ensure firing before onload,
        // maybe late but safe also for iframes
        // @ts-ignore
        document.attachEvent('onreadystatechange', DOMContentLoaded)(document).attachEvent('onload', ReadyObj.ready)

        // If IE and not a frame
        // continually check to see if the document is ready
        let toplevel = false

        try {
          toplevel = window.frameElement == null
        } catch (e) {}

        if ((document.documentElement as any).doScroll && toplevel) {
          doScrollCheck()
        }
      }
      return
    },
    _Deferred: function () {
      let // callbacks list
        callbacks: any[] = [],
        // stored [ context , args ]
        fired: 0 | 1 | object[],
        // to avoid firing when already doing so
        firing: number,
        // flag to know if the deferred has been cancelled
        cancelled: number
      // the deferred itself
      const deferred = {
        // done( f1, f2, ...)
        done: function () {
          if (!cancelled) {
            const args = arguments
            let i, length, elem, type, _fired
            if (fired) {
              _fired = fired
              fired = 0
            }
            for (i = 0, length = args.length; i < length; i++) {
              elem = args[i]
              type = ReadyObj.type(elem)
              if (type === 'array') {
                deferred.done.apply(deferred, elem)
              } else if (type === 'function') {
                callbacks.push(elem)
              }
            }
            if (_fired) {
              deferred.resolveWith(_fired[0], _fired[1])
            }
          }
          return this
        },

        // resolve with given context and args
        resolveWith: function (context: Record<string, any>, args: Record<string, any>) {
          if (!cancelled && !fired && !firing) {
            // make sure args are available (#8421)
            args = args || []
            firing = 1
            try {
              while (callbacks[0]) {
                callbacks.shift().apply(context, args) //shifts a callback, and applies it to document
              }
            } finally {
              fired = [context, args]
              firing = 0
            }
          }
          return this
        },

        // resolve with this as context and given arguments
        resolve: function () {
          deferred.resolveWith(this, arguments)
          return this
        },

        // Has this deferred been resolved?
        isResolved: function () {
          return !!(firing || fired)
        },

        // Cancel
        cancel: function () {
          cancelled = 1
          callbacks = []
          return this
        },
      }

      return deferred
    },
    type: function (obj: object) {
      return obj == null ? String(obj) : class2type[Object.prototype.toString.call(obj)] || 'object'
    },
  }
  // The DOM ready check for Internet Explorer
  function doScrollCheck() {
    if (ReadyObj.isReady) {
      return
    }

    try {
      // If IE is used, use the trick by Diego Perini
      // http://javascript.nwbox.com/IEContentLoaded/
      // @ts-ignore
      document.documentElement.doScroll('left')
    } catch (e) {
      setTimeout(doScrollCheck, 1)
      return
    }

    // and execute any waiting functions
    ReadyObj.ready()
  }
  // Cleanup functions for the document ready method
  if (!!document.addEventListener) {
    DOMContentLoaded = function () {
      document.removeEventListener('DOMContentLoaded', DOMContentLoaded, false)
      ReadyObj.ready()
    }
  } else if (!!(document as any).attachEvent) {
    DOMContentLoaded = function () {
      // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
      if (document.readyState === 'complete') {
        // @ts-ignore
        document.detachEvent('onreadystatechange', DOMContentLoaded)
        ReadyObj.ready()
      }
    }
  }
  function ready(fn: { (): void }) {
    // Attach the listeners
    ReadyObj.bindReady()

    ReadyObj.type(fn)

    // Add the callback
    readyList.done(fn) //readyList is result of _Deferred()
  }
  return ready
})()
