export const PADDLE_SETUP_CALL_WARNING =
  "[PADDLE BILLING] You haven't called Paddle.Initialize() - using Paddle.js without calling Paddle.Initialize() is unsupported and may result in unexpected behaviour. See: https://developer.paddle.com/build/checkout/build-overlay-checkout"
export const PADDLE_SETUP_ERROR =
  '[PADDLE BILLING] You must specify your Paddle Seller ID or token within the Paddle.Initialize() method. See: https://developer.paddle.com/build/checkout/build-overlay-checkout'

export const CHECKOUT_PARAMS_MISSING =
  '[PADDLE BILLING] An object of checkout parameters must be passed to Paddle.Checkout.open()'

export const CREATING_CHECKOUT_LOG = '[PADDLE BILLING] Creating checkout with attributes: '

export const UPDATING_CHECKOUT_LOG = '[PADDLE BILLING] Updating checkout with attributes: '

export const COMPLETED_SETUP = '[PADDLE BILLING] Completed library setup.'

export const DUPLICATED_CALL =
  '[PADDLE BILLING] Cannot call Paddle.Initialize() more than once per page, the call was ignored.'

export const ERROR_TRANSACTION_ID_AND_ITEMS = '[PADDLE BILLING] Either specify transaction ID or items but not both.'

export const ERROR_DISCOUNT_ID_AND_DISCOUNT_CODE =
  '[PADDLE BILLING] Either specify discount id or discount code but not both.'

export const ERROR_INVALID_SUCCESS_URL =
  '[PADDLE BILLING] The value for successUrl is not valid. Specify http(s)://example.com'

export const ERROR_CUSTOMER_ID_AND_OTHER_ATTRIBUTES =
  '[PADDLE BILLING] Either specify customer ID only or customer details(email,marketingConsent,etc) but not both.'

export const ERROR_ADDRESS_ID_AND_OTHER_ATTRIBUTES =
  '[PADDLE BILLING] Either specify customer address ID only or address details(postalCode,countryCode) but not both.'

export const ERROR_BUSINESS_ID_AND_OTHER_ATTRIBUTES =
  '[PADDLE BILLING] Either specify customer business ID only or business details(name,taxIdentifier) but not both.'

export const ERROR_CUSTOMER_ID_OR_EMAIL_REQUIRED = '[PADDLE BILLING] customer ID or email is required'

export const ERROR_TRANSACTION_ID_REQUIRED_FOR_UPSELL = '[PADDLE BILLING] Transaction ID is required for Upsell'

export const INVALID_ITEMS_ARRAY =
  '[PADDLE BILLING] The value set at items is not a valid array and it will be ignored.'

export const INVALID_CUSTOM_DATA =
  '[PADDLE BILLING] The value set at customData is not a valid object and it will be ignored.'

export const INVALID_ALLOWED_PAYMENT_METHODS =
  'The value set at `settings.allowedPaymentMethods` is not a valid array and it will be ignored.'

export const FAILED_CHECKOUT_INPUT = '[PADDLE BILLING] Checkout input failed validation : '

export const CHECKOUT_ERROR_LOG = '[PADDLE BILLING] Checkout error: '
export const CHECKOUT_WARNING_LOG = '[PADDLE BILLING] Checkout warning: '

export const CHECKOUT_FRAME_CLOSED = '[PADDLE BILLING] Checkout frame/window has been closed.'

export const NO_TOKEN_NO_SELLER = "[PADDLE BILLING] The option parameter 'seller' or 'token' must have a value."
export const BOTH_TOKEN_SELLER =
  "[PADDLE BILLING] The option parameter 'seller' or 'token' must have a value but not both."
export const WRONG_SELLER_ID_NO_TOKEN = "[PADDLE BILLING] The option parameter 'seller' must be an integer."
export const FAULTY_TOKEN_NO_SELLER = "[PADDLE BILLING] The option parameter 'token' must be an string."
