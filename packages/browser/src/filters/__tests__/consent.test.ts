import { describe, it, expect, beforeEach } from 'vitest'
import { ConsentManager } from '../consent'

beforeEach(() => {
  localStorage.clear()
})

describe('ConsentManager', () => {
  it('mode none — isEnabled is true', () => {
    const cm = new ConsentManager('none')
    expect(cm.isEnabled).toBe(true)
  })

  it('mode opt-in — isEnabled is false', () => {
    const cm = new ConsentManager('opt-in')
    expect(cm.isEnabled).toBe(false)
  })

  it('mode opt-out without prior opt-out — isEnabled is true', () => {
    const cm = new ConsentManager('opt-out')
    expect(cm.isEnabled).toBe(true)
  })

  it('mode opt-out with sk_opt_out=true in localStorage — isEnabled is false', () => {
    localStorage.setItem('sk_opt_out', 'true')
    const cm = new ConsentManager('opt-out')
    expect(cm.isEnabled).toBe(false)
  })

  it('enable() sets isEnabled to true', () => {
    const cm = new ConsentManager('opt-in')
    cm.enable()
    expect(cm.isEnabled).toBe(true)
  })

  it('disable() sets isEnabled to false', () => {
    const cm = new ConsentManager('none')
    cm.disable()
    expect(cm.isEnabled).toBe(false)
  })

  it('optOut() sets isEnabled to false and writes sk_opt_out to localStorage', () => {
    const cm = new ConsentManager('none')
    cm.optOut()
    expect(cm.isEnabled).toBe(false)
    expect(localStorage.getItem('sk_opt_out')).toBe('true')
  })

  it('optIn() sets isEnabled to true and removes sk_opt_out from localStorage', () => {
    localStorage.setItem('sk_opt_out', 'true')
    const cm = new ConsentManager('opt-out')
    cm.optIn()
    expect(cm.isEnabled).toBe(true)
    expect(localStorage.getItem('sk_opt_out')).toBeNull()
  })

  it('after optOut(), new ConsentManager(opt-out) reads isEnabled as false', () => {
    const cm = new ConsentManager('opt-out')
    cm.optOut()
    const cm2 = new ConsentManager('opt-out')
    expect(cm2.isEnabled).toBe(false)
  })
})
