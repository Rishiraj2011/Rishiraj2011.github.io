import { NonCatalogPriceRequest, TransactionPreviewItem, TransactionPreviewParams } from '@paddle/paddle-js'

import {
  TransactionPreviewRequestBody,
  TransactionPreviewItem as TransactionPreviewItemRequest,
  NonCatalogPrice,
} from 'src/classes/transaction-preview/types/transaction-preview-request-body'

function getPrice(price: NonCatalogPriceRequest) {
  const priceRequest: NonCatalogPrice = {
    name: price.name,
    description: price.description,
    unit_price: {
      amount: price.unitPrice.amount,
      currency_code: price.unitPrice.currencyCode,
    },
    tax_mode: price.taxMode,
    unit_price_overrides: price.unitPriceOverrides?.map((override) => ({
      country_codes: override.countryCodes,
      unit_price: {
        amount: override.unitPrice.amount,
        currency_code: override.unitPrice.currencyCode,
      },
    })),
    quantity: price.quantity,
    custom_data: price.customData,
  }
  if (price.billingCycle) {
    priceRequest.billing_cycle = {
      interval: price.billingCycle.interval,
      frequency: price.billingCycle.frequency,
    }
  }
  if (price.trialPeriod) {
    priceRequest.trial_period = {
      interval: price.trialPeriod.interval,
      frequency: price.trialPeriod.frequency,
    }
  }

  if (price.productId) {
    priceRequest.product_id = price.productId
  } else if (price.product) {
    priceRequest.product = {
      name: price.product.name,
      tax_category: price.product.taxCategory,
      description: price.product.description,
      image_url: price.product.imageUrl,
      custom_data: price.product.customData,
    }
  }

  return priceRequest
}

function getLineItems(item: TransactionPreviewItem) {
  const lineItem: TransactionPreviewItemRequest = {
    quantity: item.quantity,
    include_in_totals: item.includeInTotals,
  }
  if (item.priceId) {
    lineItem.price_id = item.priceId
  } else if (item.price) {
    lineItem.price = getPrice(item.price)
  }
  return lineItem
}

function getAddress(inputData: TransactionPreviewParams) {
  return inputData.address
    ? {
        country_code: inputData.address.countryCode,
        postal_code: inputData.address.postalCode,
      }
    : undefined
}

export function getTransactionPreviewRequest(inputData: TransactionPreviewParams): TransactionPreviewRequestBody {
  return {
    items: inputData.items.map(getLineItems),
    customer_id: inputData.customerId,
    address_id: inputData.addressId,
    business_id: inputData.businessId,
    currency_code: inputData.currencyCode,
    discount_id: inputData.discountId,
    address: getAddress(inputData),
    customer_ip_address: inputData.customerIpAddress,
    ignore_trials: inputData.ignoreTrials,
  }
}
