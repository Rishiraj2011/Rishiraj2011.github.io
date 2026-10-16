import { PricePreviewParams, PricePreviewResponse } from '@paddle/paddle-js'

import { getPricePreviewRequest } from 'src/classes/price-preview/mappers/price-preview-request-mapper'
import { parsePricePreviewResponse } from 'src/classes/price-preview/mappers/price-preview-response-mapper'

import { Environment } from 'src/configs'
import { Options } from 'src/configs/Options'

import { isObjectValid } from 'src/utils'
import { getPaddleApiHeaders } from 'src/utils/headers'
import { hasValidItems } from 'src/utils/price-preview'

export const PricePreview = async (params: PricePreviewParams): Promise<PricePreviewResponse> => {
  if (!Options.token) {
    throw new Error('[PADDLE] token is required to use Paddle.PricePreview()')
  }

  if (!isObjectValid(params) || !hasValidItems(params.items)) {
    throw new Error('[PADDLE] At least 1 item with priceId and quantity is required to use Paddle.PricePreview()')
  }

  const parsedPricePreviewParams = getPricePreviewRequest(params)
  const raw = JSON.stringify(parsedPricePreviewParams)

  const requestOptions = {
    method: 'POST',
    headers: getPaddleApiHeaders(Options.token),
    body: raw,
  }

  let response: Response
  let json

  // Wrap the fetch in our own promise to make it easier to change in the future
  try {
    const { apiBase } = Environment.defaults()
    response = await fetch(`${apiBase}/pricing-preview`, requestOptions)
  } catch (error) {
    // Should only be a network error
    return Promise.reject({
      name: 'PricePreview.failed',
      data: {},
      error: {
        type: 'network_error',
        code: 'network_error',
        detail: 'Network error encountered when calling Paddle.PricePreview.',
      },
    })
  }

  // Try to parse the JSON even if the response is not ok
  try {
    json = await response.json()
  } catch (e) {
    // We can't parse the JSON, return an error
    return Promise.reject({
      name: 'PricePreview.failed',
      data: {},
      error: {
        type: 'api_error',
        code: `${response.status}`,
        detail: 'Something went wrong when calling Paddle.PricePreview.',
      },
    })
  }

  if (response.ok) {
    const parsedResponse = parsePricePreviewResponse(json)
    return Promise.resolve(parsedResponse)
  }

  return Promise.reject(json)
}
