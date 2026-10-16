import { AvailablePaymentMethod, CheckoutOpenOptions, CheckoutSettings, PaddleSetupOptions } from '@paddle/paddle-js'

export enum DISPLAY_MODE {
  OVERLAY = 'overlay', // PaddleJS V2 translates overlay method know to sellers to wide-overlay internally for cfe.
  INLINE = 'inline',
}

export type VARIANT_TYPE = 'multi-page' | 'one-page' | 'express'

export const VARIANT = {
  MULTI_PAGE: 'multi-page',
  ONE_PAGE: 'one-page',
  EXPRESS: 'express',
} as const

export type WIDE_OVERLAY = 'wide-overlay'

export enum ENVIRONMENTS {
  PRODUCTION = 'production',
  STAGING = 'staging',
  SANDBOX = 'sandbox',
  DEVELOPMENT = 'development',
  LOCAL = 'local',
}

// The `(string & {})` intersection preserves autocomplete for ENVIRONMENTS values
// while allowing arbitrary domain strings for custom local development.
// eslint-disable-next-line @typescript-eslint/ban-types
export type EnvironmentValue = ENVIRONMENTS | (string & {})

export enum THEME {
  LIGHT = 'light',
  DARK = 'dark',
  GREEN = 'green',
}

export enum LOG_LEVEL {
  WARNING = 'warning',
  LOG = 'log',
  ERROR = 'error',
}

// Describes how PaddleJS was loaded onto the page. The script is always the
// same CDN artifact; what varies is the loading behaviour. A parser-blocking
// classic script tag is BLOCKING; async/defer/dynamically-injected (e.g. the
// wrapper, which injects the CDN script) is ASYNC.
export enum SCRIPT_LOADING {
  BLOCKING = 'blocking',
  ASYNC = 'async',
}

export enum RETAIN_DEMO_FEATURE {
  PAYMENT_RECOVERY = 'paymentRecovery',
  PAYMENT_RECOVERY_IN_APP = 'paymentRecoveryInApp',
  TERM_OPTIMIZATION = 'termOptimization',
  TERM_OPTIMIZATION_IN_APP = 'termOptimizationInApp',
  CANCELLATION_FLOW = 'cancellationFlow',
  PRE_PAYMENT_FAILURE_IN_APP = 'prePaymentFailure',
}

export interface EnvironmentSettings {
  checkoutFrontEndBase: string
  checkoutBase: string
  profitwellSnippetBase: string
  apiBase: string
}

export interface EnvProps {
  current: EnvironmentValue
  defaults: {
    local: EnvironmentSettings
    development: EnvironmentSettings
    staging: EnvironmentSettings
    sandbox: EnvironmentSettings
    production: EnvironmentSettings
  }
}

export interface EventData {
  name: string
  data: object
  error?: object
}

export interface DataProps {
  libraryVersion: string | null
  scriptLoading: SCRIPT_LOADING | null
  completedSetup: boolean
  loadedButtonStylesheet: boolean
}

export type objectType = Record<string, string | number | boolean>

export interface Itemtype {
  priceId: string
  quantity?: number
}

export interface FrameProps {
  frameStyle?: string
  frameInitialHeight?: number
  frameTarget?: string
}

interface ExpressComponentSettings {
  componentVisible: boolean
  paymentMethods?: AvailablePaymentMethod[]
}

export interface ExpressSettings {
  expressCheckoutComponent: ExpressComponentSettings
  standardCheckoutComponent: ExpressComponentSettings
}

interface CheckoutUpsell {
  transactionId: string
  settings?: {
    showSkipButton?: boolean
  }
}

export interface CheckoutOutputAttributesProps extends Omit<InternalCheckoutOpenOptions, 'settings'> {
  settings?: {
    locale?: string
    theme?: THEME
    successUrl?: string
    allowLogout?: boolean
    showAddDiscounts?: boolean
    allowDiscountRemoval?: boolean
    showAddTaxId?: boolean
    showNonExpressPaymentMethods?: boolean
    express?: ExpressSettings
    frameTarget?: string
    frameInitialHeight?: number
    frameStyle?: string
    displayMode?: DISPLAY_MODE.INLINE | WIDE_OVERLAY
    variant?: VARIANT_TYPE
    sourcePage?: string
    referrer?: string | null
    allowedPaymentMethods?: AvailablePaymentMethod[]
  }
  sellerId?: number | null
  clientToken?: string
  applePayEnabled?: boolean
  checkoutInitiated?: number
  'paddlejs-version'?: string | null
  upsell?: CheckoutUpsell
}

// To be used only for attributes that are private or while in development. All public attributes should come from `CheckoutSettings`
// We have to override the theme because we support `green` and variant because we support `express`
interface InternalSettings extends Omit<CheckoutSettings, 'theme' | 'variant'> {
  theme?: THEME
  variant?: VARIANT_TYPE
  showNonExpressPaymentMethods?: boolean
  express?: ExpressSettings
}

// We have to override the settings, items and customData objects
export type InternalCheckoutOpenOptions = Omit<CheckoutOpenOptions, 'settings' | 'customData' | 'items'> & {
  settings?: InternalSettings
  customData?: CheckoutOpenOptions['customData'] | string
  items?: CheckoutOpenOptions['items'] | string
  customerAuthToken?: string
  savedPaymentMethodId?: string
  upsell?: CheckoutUpsell
}

// We have to override the settings here to support the custom theme
export type InternalPaddleSetupOptions = Omit<PaddleSetupOptions, 'checkout'> & {
  enableConcurrentVersions?: boolean
  checkout?: {
    settings: InternalSettings
  }
}

export type UpdateCheckoutInputAttributesProps = Omit<CheckoutOpenOptions, 'settings' | 'transactionId'>

export enum RetainCancellationFlowStatus {
  error = 'error',
  aborted = 'aborted',
  choseToCancel = 'chose_to_cancel',
  retained = 'retained',
}
