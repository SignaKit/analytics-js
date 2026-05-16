export interface ElementMetadata {
  element_tag: string
  element_text: string | null
  element_id: string | null
  element_classes: string | null
  element_href: string | null
  sk_label: string | null
}

export function getElementMetadata(el: Element): ElementMetadata {
  const tag = el.tagName.toLowerCase()
  const rawText = (el as HTMLElement).innerText?.trim() ?? null
  return {
    element_tag: tag,
    element_text: rawText ? rawText.slice(0, 64) : null,
    element_id: el.id || null,
    element_classes: el.className ? String(el.className).trim() || null : null,
    element_href: tag === 'a' ? (el as HTMLAnchorElement).href || null : null,
    sk_label: el.getAttribute('data-sk-label'),
  }
}

export function findClosest(target: EventTarget | null, selector: string): Element | null {
  if (!(target instanceof Element)) return null
  return target.closest(selector)
}
