import { TransactionPreviewItem, TransactionPreviewParams, TransactionPreviewResponse } from '@paddle/paddle-js'

import { getTransactionPreviewRequest } from 'src/classes/transaction-preview/mappers/transaction-preview-request-mapper'
import { parseTransactionPreviewResponse } from 'src/classes/transaction-preview/mappers/transaction-preview-response-mapper'

import { Environment } from 'src/configs'
import { Options } from 'src/configs/Options'

import { isObjectValid } from 'src/utils'
import { getPaddleApiHeaders } from 'src/utils/headers'

const hasValidTransactionItems = (items: TransactionPreviewItem[]) => {
  if (!items || !items.length) {
    return false
  }

  return items.every((item: TransactionPreviewItem) => {
    return (item.priceId || item.price) && item.quantity
  })
}

export async function TransactionPreview(params: TransactionPreviewParams): Promise<TransactionPreviewResponse> {
  if (!Options.token) {
    throw new Error('[PADDLE] token is required to use Paddle.TransactionPreview()')
  }

  if (!isObjectValid(params) || !hasValidTransactionItems(params.items)) {
    throw new Error('[PADDLE] At least 1 item with priceId and quantity is required to use Paddle.TransactionPreview()')
  }

  const parsedTransactionPreviewParams = getTransactionPreviewRequest(params)
  const raw = JSON.stringify(parsedTransactionPreviewParams)

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
    response = await fetch(`${apiBase}/transactions/preview`, requestOptions)
  } catch (error) {
    // Should only be a network error
    return Promise.reject({
      name: 'TransactionPreview.failed',
      data: {},
      error: {
        type: 'network_error',
        code: 'network_error',
        detail: 'Network error encountered when calling Paddle.TransactionPreview.',
      },
    })
  }

  // Try to parse the JSON even if the response is not ok
  try {
    json = await response.json()
  } catch (e) {
    // We can't parse the JSON, return an error
    return Promise.reject({
      name: 'TransactionPreview.failed',
      data: {},
      error: {
        type: 'api_error',
        code: `${response.status}`,
        detail: 'Something went wrong when calling Paddle.TransactionPreview.',
      },
    })
  }

  if (response.ok) {
    const parsedResponse = parseTransactionPreviewResponse(json)
    return Promise.resolve(parsedResponse)
  }

  return Promise.reject(json)
}
