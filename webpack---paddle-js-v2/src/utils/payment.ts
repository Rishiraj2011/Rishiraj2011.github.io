export function isApplePaySupported() {
  // Check if the current browser has ApplePay enabled
  // This util method is implemented here in paddlejs v2 because it has
  // access to the buyers browser/window and we can detect whether ApplePay
  // is available.

  // CFE runs within an IFrame so because of security reasons, we cannot detect
  // whether applePay is enabled in the window.

  const applePaySession = window.ApplePaySession
  let isSupported

  try {
    isSupported = applePaySession && applePaySession.canMakePayments()
  } catch (e) {
    isSupported = false
  }

  return !!window.isRetainApplePaySupported || !!isSupported
}
