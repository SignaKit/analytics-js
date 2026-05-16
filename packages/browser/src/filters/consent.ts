import { local } from '../utils/storage'

const OPT_OUT_KEY = 'sk_opt_out'

export type ConsentMode = 'none' | 'opt-out' | 'opt-in'

export class ConsentManager {
  private _enabled: boolean

  constructor(private mode: ConsentMode) {
    if (mode === 'opt-in') {
      this._enabled = false
    } else if (mode === 'opt-out') {
      this._enabled = local.get(OPT_OUT_KEY) !== 'true'
    } else {
      this._enabled = true
    }
  }

  get isEnabled(): boolean {
    return this._enabled
  }

  enable(): void {
    this._enabled = true
  }

  disable(): void {
    this._enabled = false
  }

  optIn(): void {
    local.remove(OPT_OUT_KEY)
    this._enabled = true
  }

  optOut(): void {
    local.set(OPT_OUT_KEY, 'true')
    this._enabled = false
  }
}
