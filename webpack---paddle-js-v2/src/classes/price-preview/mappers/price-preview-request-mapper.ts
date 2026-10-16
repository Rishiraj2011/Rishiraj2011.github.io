import { PricePreviewParams, PricePreviewItem } from '@paddle/paddle-js'

import { PricePreviewRequestBody } from 'src/classes/price-preview/types/price-preview-request-body'

function getLineItems(item: PricePreviewItem) {
  return {
    price_id: item.priceId,
    quantity: item.quantity,
  }
}

function getAddress(inputData: PricePreviewParams) {
  return inputData.address
    ? {
        country_code: inputData.address.countryCode,
        postal_code: inputData.address.postalCode,
      }
    : undefined
}

export function getPricePreviewRequest(inputData: PricePreviewParams): PricePreviewRequestBody {
  return {
    items: inputData.items.map(getLineItems),
    customer_id: inputData.customerId,
    address_id: inputData.addressId,
    business_id: inputData.businessId,
    currency_code: inputData.currencyCode,
    discount_id: inputData.discountId,
    address: getAddress(inputData),
    customer_ip_address: inputData.customerIpAddress,
  }
}
