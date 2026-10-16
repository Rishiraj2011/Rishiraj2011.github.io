import { DataProps, SCRIPT_LOADING } from 'src/globals/types'

class _Status {
  data: DataProps

  constructor() {
    this.data = {
      libraryVersion: null,
      scriptLoading: null,
      completedSetup: false,
      loadedButtonStylesheet: false,
    }
  }

  get completedSetup(): boolean {
    return this.data.completedSetup
  }

  set completedSetup(value: boolean) {
    this.data.completedSetup = value
  }

  get loadedButtonStylesheet(): boolean {
    return this.data.loadedButtonStylesheet
  }

  set loadedButtonStylesheet(value: boolean) {
    this.data.loadedButtonStylesheet = value
  }

  get libraryVersion(): string | null {
    return this.data.libraryVersion
  }

  set libraryVersion(value: string | null) {
    this.data.libraryVersion = value
  }

  get scriptLoading(): SCRIPT_LOADING | null {
    return this.data.scriptLoading
  }

  set scriptLoading(value: SCRIPT_LOADING | null) {
    this.data.scriptLoading = value
  }
}

export const Status = new _Status()
