import { TransactionPreviewResponse } from '@paddle/paddle-js'

import { getAddress, getPrice, getProduct } from 'src/classes/price-preview/mappers/price-preview-response-mapper'
import {
  TaxRatesUsed,
  TransactionPreviewItem,
  TransactionPreviewLineItems,
  TransactionPreviewResponseObject,
  TransactionTotal,
} from 'src/classes/transaction-preview/types/transaction-preview-response-object'

function getTaxRatesUsed(taxRateUsed: TaxRatesUsed) {
  return {
    taxRate: taxRateUsed.tax_rate,
    totals: taxRateUsed.totals,
  }
}

function getTransactionTotals(totals: TransactionTotal) {
  return {
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    total: totals.total,
    credit: totals.credit,
    balance: totals.balance,
    grandTotal: totals.grand_total,
    fee: totals.fee,
    earnings: totals.earnings,
    currencyCode: totals.currency_code,
  }
}

function getLineItems(lineItem: TransactionPreviewLineItems) {
  return {
    priceId: lineItem.price_id,
    quantity: lineItem.quantity,
    taxRate: lineItem.tax_rate,
    unitTotals: lineItem.unit_totals,
    totals: lineItem.totals,
    product: getProduct(lineItem.product),
  }
}

function getItems(item: TransactionPreviewItem) {
  return {
    price: getPrice(item.price),
    quantity: item.quantity,
    includeInTotals: item.include_in_totals,
    proration: item.proration
      ? {
          rate: item.proration.rate,
          billingPeriod: {
            startsAt: item.proration.billing_period.starts_at,
            endsAt: item.proration.billing_period.ends_at,
          },
        }
      : null,
  }
}

export function parseTransactionPreviewResponse(
  response: TransactionPreviewResponseObject
): TransactionPreviewResponse {
  return {
    data: {
      customerId: response.data.customer_id,
      addressId: response.data.address_id,
      businessId: response.data.business_id,
      currencyCode: response.data.currency_code,
      discountId: response.data.discount_id,
      customerIpAddress: response.data.customer_ip_address,
      address: getAddress(response.data.address),
      ignoreTrials: response.data.ignore_trials,
      details: {
        taxRatesUsed: response.data.details.tax_rates_used.map(getTaxRatesUsed),
        totals: getTransactionTotals(response.data.details.totals),
        lineItems: response.data.details.line_items.map(getLineItems),
      },
      items: response.data.items.map(getItems),
      availablePaymentMethods: response.data.available_payment_methods,
    },
    meta: {
      requestId: response.meta.request_id,
    },
  }
}
