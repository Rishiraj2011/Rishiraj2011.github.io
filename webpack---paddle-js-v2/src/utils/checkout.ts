import { closeCheckoutIFrame } from 'src/gateway'

import { Options } from 'src/configs/Options'

import { CLASSES } from 'src/constants'

import { each, nodeToString } from 'src/utils/html'
import { sanitizeUrl } from 'src/utils/urls'

// Show a Loading Spinner
export function showLoading(returnHtml: boolean = false): string | void {
  hideLoading()

  const keyFrameStyle = document.createElement('style')
  keyFrameStyle.type = 'text/css'
  keyFrameStyle.innerHTML =
    // eslint-disable-next-line no-multi-str
    '\
				@-webkit-keyframes rotate {\
					0% {\
						-webkit-transform: rotate(45deg);\
					}\
					100% {\
						-webkit-transform: rotate(405deg);\
					}\
				}\
				@keyframes rotate {\
					from {\
						transform: rotate(45deg);\
					}\
					to {\
						transform: rotate(405deg);\
					}\
				}'
  document.getElementsByTagName('head')[0].appendChild(keyFrameStyle)

  const htmlLoader = document.createElement('div')
  htmlLoader.setAttribute(
    'style',
    'z-index:99998; display: block; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: 0px; padding: 0px; background: rgba(0,0,0,0.38);'
  )
  htmlLoader.setAttribute('class', CLASSES.PADDLE_LOADER)

  const mainSpinnerWrapper = document.createElement('main')
  const htmlLoaderIconWrapper =
    'align-items: center;display: flex;flex-direction: column;justify-content: center;left: 50%;margin: 0.5rem 0;position: absolute;text-align: center;top: 50%;transform: translate(-50%, -50%);width: 90%;'
  mainSpinnerWrapper.setAttribute('style', htmlLoaderIconWrapper)

  const spinner = document.createElement('div')
  const htmlLoaderIcon =
    'border: 4px solid #f3f3f3;border-radius: 50%;border-top: 4px solid #ccc;width: 34px;height: 34px;-webkit-animation: rotate 1s ease-in-out infinite forwards;animation: rotate 1s ease-in-out infinite forwards;'
  spinner.setAttribute('style', htmlLoaderIcon)

  mainSpinnerWrapper.appendChild(spinner)
  htmlLoader.appendChild(mainSpinnerWrapper)

  if (!returnHtml) {
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementsByTagName('body')[0].appendChild(htmlLoader)
    })
  } else {
    return nodeToString(htmlLoader)
  }
}

// Hide any active Loading Spinners
export function hideLoading() {
  each(CLASSES.PADDLE_LOADER, function (loader: HTMLElement) {
    loader?.parentNode?.removeChild(loader)
  })
}

export function isObjectValid(object?: object | string) {
  return (
    typeof object === 'object' &&
    object && // To prevent null values
    !Array.isArray(object) && // Arrays will also be of type "object" and Object.keys will return valid length for an array
    Object.keys(object).length > 0
  )
}

export function hasValue(value: any) {
  return typeof value !== 'undefined' && value !== '' && value !== null
}

export function updateFrameHeight(data: { callback_data: { height: string } }) {
  // The checkout sends us it's height every second or so, use it to update the height of the on-page iframe
  // if this is an 'inline' checkout.
  if (data.callback_data && data.callback_data.height !== '') {
    const iFrame = document.getElementsByClassName(CLASSES.PADDLE_FRAME_INLINE)
    if (iFrame.length > 0) {
      const newFrameHeight = parseInt(data.callback_data.height) + 45
      iFrame[0].setAttribute('height', `${newFrameHeight}`)
    }
  }
}

export function redirectOnComplete() {
  try {
    const successUrl = Options.successUrl
    if (successUrl) {
      closeCheckoutIFrame()
      setTimeout(() => {
        window.location.href = sanitizeUrl(successUrl)
      }, 200)
    }
  } catch (e) {
    // Do nothing
  }
}
