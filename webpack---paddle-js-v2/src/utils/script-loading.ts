import { SCRIPT_LOADING } from 'src/globals/types'

// Detects whether PaddleJS was loaded via a parser-blocking classic script tag
// or a non-blocking one (async/defer/dynamically-injected, e.g. by an SDK
// wrapper). The underlying script is always the same CDN artifact; only the
// loading behaviour differs.
//
// Must run at load time: document.currentScript is only populated while the
// script executes synchronously, and is null inside later callbacks.
export function detectScriptLoading(): SCRIPT_LOADING {
  const script = document.currentScript as HTMLScriptElement | null
  return script && !script.async && !script.defer ? SCRIPT_LOADING.BLOCKING : SCRIPT_LOADING.ASYNC
}
