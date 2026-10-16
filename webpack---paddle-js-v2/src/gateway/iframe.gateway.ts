import { CheckoutOutputAttributesProps, FrameProps } from 'src/globals/types'

import Checkout from 'src/classes/Checkout'

import { CLASSES } from 'src/constants'
import { CHECKOUT_EVENTS, TRANSACTION_ACTION } from 'src/constants/events'
import { CHECKOUT_FRAME_CLOSED } from 'src/constants/logs'

import { buildCheckoutUrl, hasValue, hideLoading, isMobile, logger, showLoading } from 'src/utils'
import { measureFramePlacement, watchForFrameReveal } from 'src/utils/frame-placement'
import { each } from 'src/utils/html'
import { attachCheckoutUrl } from 'src/utils/urls'

let stopRevealWatch: (() => void) | undefined

export const closeCheckoutIFrame = () => {
  logger.log(CHECKOUT_FRAME_CLOSED)

  stopRevealWatch?.()
  stopRevealWatch = undefined

  hideLoading()

  each(CLASSES.PADDLE_FRAME, function (element: HTMLElement) {
    element.parentNode?.removeChild(element)
  })

  if (typeof window.PaddleWindow != 'undefined' && !window.PaddleWindow.closed) {
    window.PaddleWindow.close()
  }
  Checkout.isOpen = false
}

export const renderCheckoutFrame = (
  checkoutProps: CheckoutOutputAttributesProps,
  frameProps: FrameProps,
  inline: boolean
) => {
  // Stamped here rather than in buildCheckoutUrl so the frame's own setup counts against it.
  checkoutProps.checkoutInitiated = new Date().getTime()

  const useInlineTarget = inline && hasValue(frameProps.frameTarget)
  const inlineContainer = useInlineTarget ? document.getElementsByClassName(`${frameProps.frameTarget}`)[0] : undefined

  // Show loading spinner while frame is loading.
  if (!inline) {
    showLoading()
  }

  window.PaddleFrame = document.createElement('iframe')
  window.PaddleFrame.className = CLASSES.PADDLE_FRAME
  window.PaddleFrame.name = 'paddle_frame'
  //@ts-ignore ignore deprecation warning
  window.PaddleFrame.frameBorder = '0'
  //@ts-ignore allowTransparency do exist on HTMLIFrameElement
  window.PaddleFrame.allowTransparency = 'true'
  window.PaddleFrame.allow = 'payment'

  if (inline) {
    window.PaddleFrame.classList.add(CLASSES.PADDLE_FRAME_INLINE)
    // We have to inject a <style> tag to the page
    // in order to add a rule that targets the iframe's scrollbar.
    // This is because pseudo-selectors cannot be targeted
    // by inline CSS! This fixes a scrollbar bug in Safari.
    const styleElement = document.createElement('style')
    styleElement.type = 'text/css'
    styleElement.innerHTML = `.${CLASSES.PADDLE_FRAME_INLINE}::-webkit-scrollbar { display: none !important; }`
    document.getElementsByTagName('head')[0].appendChild(styleElement)
  } else {
    window.PaddleFrame.classList.add(CLASSES.PADDLE_FRAME_OVERLAY)
  }
  if (hasValue(frameProps.frameStyle) && inline) {
    window.PaddleFrame.setAttribute('style', `${frameProps?.frameStyle}`)
  } else {
    if (!isMobile()) {
      window.PaddleFrame.setAttribute(
        'style',
        'z-index: 2147483647; display: block; background-color: transparent; border: 0px none transparent; overflow-x: hidden; overflow-y: auto; visibility: visible; margin: 0px; padding: 0px; -webkit-tap-highlight-color: transparent; position: fixed; left: 0px; top: 0px; width: 100%; height: 100%;'
      )
    } else {
      window.PaddleFrame.setAttribute(
        'style',
        'z-index: 2147483647; display: block; background-color: transparent; border: 0px none transparent; overflow-x: hidden; overflow-y: scroll; visibility: visible; margin: 0px; padding: 0px; -webkit-tap-highlight-color: transparent; position: fixed; left: 0px; top: 0px; width: 100%; height: 100%;'
      )
    }
  }

  if (hasValue(frameProps.frameInitialHeight) && inline) {
    window.PaddleFrame.setAttribute('height', `${frameProps?.frameInitialHeight}px`)
  }

  const frameParent = useInlineTarget ? (inlineContainer as Element) : document.getElementsByTagName('body')[0]
  frameParent.appendChild(window.PaddleFrame as HTMLIFrameElement)

  // The container takes its size from the frame, so measuring before the append reads 0x0. Setting
  // src late is safe: navigating off the initial about:blank replaces (HTML spec).
  const placement = inline ? measureFramePlacement(inlineContainer) : { covered: false, hidden: false }

  attachCheckoutUrl(window.PaddleFrame, buildCheckoutUrl(checkoutProps, inline, placement))

  if (placement.hidden && inlineContainer) {
    const frame = window.PaddleFrame as HTMLIFrameElement
    let revealed = false

    const postReveal = () =>
      frame.contentWindow?.postMessage(
        { action: TRANSACTION_ACTION, eventName: CHECKOUT_EVENTS.CHECKOUT_FRAME_REVEALED, callbackData: {} },
        '*'
      )

    // A reveal can arrive before the frame has a document to receive it, so it is sent again on load.
    const onLoad = () => {
      if (!revealed) return

      postReveal()
      frame.removeEventListener('load', onLoad)
    }

    frame.addEventListener('load', onLoad)

    stopRevealWatch = watchForFrameReveal(inlineContainer, () => {
      revealed = true
      postReveal()
    })
  }
}
