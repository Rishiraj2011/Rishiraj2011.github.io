import { PricePreviewResponse } from '@paddle/paddle-js'
import { Price, Product } from '@paddle/paddle-js/types/shared/shared'

import {
  Address,
  DiscountLineItem,
  LineItem,
  PricePreviewResponseObject,
  UnitPriceOverride,
} from 'src/classes/price-preview/types/price-preview-response-object'

export function getUnitPriceOverrides(override: UnitPriceOverride) {
  return {
    countryCodes: override.country_codes,
    unitPrice: {
      amount: override.unit_price.amount,
      currencyCode: override.unit_price.currency_code,
    },
  }
}

export function getProduct(product: LineItem['product']): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    taxCategory: product.tax_category as Product['taxCategory'],
    imageUrl: product.image_url,
    customData: product.custom_data,
    status: product.status,
    createdAt: product.created_at,
    importMeta: product.import_meta
      ? {
          externalId: product.import_meta.external_id ?? null,
          importedFrom: product.import_meta.imported_from,
        }
      : null,
  }
}

function getDiscount(discount: DiscountLineItem) {
  return {
    amount: discount.discount.amount,
    currencyCode: discount.discount.currency_code,
    description: discount.discount.description,
    id: discount.discount.id,
    type: discount.discount.type,
    code: discount.discount.code,
    createdAt: discount.discount.created_at,
    enabledForCheckout: discount.discount.enabled_for_checkout,
    expiresAt: discount.discount.expires_at,
    maximumRecurringIntervals: discount.discount.maximum_recurring_intervals,
    recur: discount.discount.recur,
    restrictTo: discount.discount.restrict_to,
    status: discount.discount.status,
    timesUsed: discount.discount.times_used,
    updatedAt: discount.discount.updated_at,
    usageLimit: discount.discount.usage_limit,
  }
}

function getDiscountLineItem(discount: DiscountLineItem) {
  return {
    discount: getDiscount(discount),
    total: discount.total,
    formattedTotal: discount.formatted_total,
  }
}

export function getPrice(price: LineItem['price']): Price {
  return {
    id: price.id,
    name: price.name ?? null,
    description: price.description,
    customData: price.custom_data,
    status: price.status,
    billingCycle: price.billing_cycle,
    productId: price.product_id,
    quantity: price.quantity,
    taxMode: price.tax_mode,
    trialPeriod: price.trial_period,
    unitPrice: {
      amount: price.unit_price.amount,
      currencyCode: price.unit_price.currency_code,
    },
    unitPriceOverrides: price.unit_price_overrides?.map(getUnitPriceOverrides),
    importMeta: price.import_meta
      ? {
          externalId: price.import_meta.external_id ?? null,
          importedFrom: price.import_meta.imported_from,
        }
      : null,
  }
}

function getLineItem(item: LineItem) {
  return {
    price: getPrice(item.price),
    quantity: item.quantity,
    taxRate: item.tax_rate,
    unitTotals: item.unit_totals,
    formattedUnitTotals: item.formatted_unit_totals,
    totals: item.totals,
    formattedTotals: item.formatted_totals,
    product: getProduct(item.product),
    discounts: item.discounts?.map(getDiscountLineItem),
  }
}

export function getAddress(address: Address | null) {
  return address
    ? {
        countryCode: address.country_code,
        postalCode: address.postal_code,
      }
    : null
}

export function parsePricePreviewResponse(response: PricePreviewResponseObject): PricePreviewResponse {
  return {
    data: {
      customerId: response.data.customer_id,
      addressId: response.data.address_id,
      businessId: response.data.business_id,
      currencyCode: response.data.currency_code,
      address: getAddress(response.data.address),
      customerIpAddress: response.data.customer_ip_address,
      discountId: response.data.discount_id,
      details: {
        lineItems: response.data.details.line_items?.map(getLineItem),
      },
      availablePaymentMethods: response.data.available_payment_methods,
    },
    meta: {
      requestId: response.meta.request_id,
    },
  }
}
