import { LOG_LEVEL } from 'src/globals/types'

import { Options } from 'src/configs/Options'

class Logger {
  isEnabled: boolean
  constructor() {
    this.isEnabled = true
  }

  log(message: string, type = LOG_LEVEL.LOG, alwaysShow = false) {
    window.console.debug = window.console.debug || window.console.log || function () {}

    const debugMessage = '[Paddle Debug]' + message
    if (Options.debug) {
      if (type === LOG_LEVEL.LOG) {
        console.debug(debugMessage)
      } else if (type === LOG_LEVEL.WARNING) {
        console.warn(debugMessage)
      }
    }
    if (alwaysShow) {
      console.warn(message)
    }
  }
}

export const logger = new Logger()
