import { describe, it, expect } from 'vitest'
import { getElementMetadata, findClosest } from '../dom'

// jsdom does not implement innerText — patch it so tests can exercise the metadata
function patchInnerText(el: HTMLElement, text: string): void {
  Object.defineProperty(el, 'innerText', { get: () => text, configurable: true })
}

describe('getElementMetadata', () => {
  it('returns metadata for a button element', () => {
    const btn = document.createElement('button')
    btn.id = 'btn'
    btn.className = 'primary'
    patchInnerText(btn, 'Click me')
    const meta = getElementMetadata(btn)
    expect(meta).toEqual({
      element_tag: 'button',
      element_text: 'Click me',
      element_id: 'btn',
      element_classes: 'primary',
      element_href: null,
      sk_label: null,
    })
  })

  it('returns href and sk_label for an anchor element', () => {
    const a = document.createElement('a')
    a.href = 'https://example.com'
    a.setAttribute('data-sk-label', 'cta')
    patchInnerText(a, 'Link')
    document.body.appendChild(a)
    const meta = getElementMetadata(a)
    expect(meta.element_href).toBe('https://example.com/')
    expect(meta.sk_label).toBe('cta')
    document.body.removeChild(a)
  })

  it('truncates element_text to 64 characters', () => {
    const p = document.createElement('p')
    patchInnerText(p, 'a'.repeat(100))
    const meta = getElementMetadata(p)
    expect(meta.element_text?.length).toBe(64)
  })

  it('returns null element_id when id is not set', () => {
    const div = document.createElement('div')
    const meta = getElementMetadata(div)
    expect(meta.element_id).toBeNull()
  })
})

describe('findClosest', () => {
  it('finds an ancestor element matching selector', () => {
    const parent = document.createElement('div')
    parent.className = 'container'
    const child = document.createElement('span')
    parent.appendChild(child)
    document.body.appendChild(parent)
    expect(findClosest(child, '.container')).toBe(parent)
    document.body.removeChild(parent)
  })

  it('returns null for a non-Element target', () => {
    expect(findClosest(null, 'div')).toBeNull()
    expect(findClosest(new EventTarget(), 'div')).toBeNull()
  })
})
