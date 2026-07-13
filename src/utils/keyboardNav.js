const FIELD_SELECTOR = [
  'input:not([type=hidden]):not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button[aria-haspopup="listbox"]:not([disabled])',
].join(', ')

const isVisible = (element) => element.offsetParent !== null

export function focusNextFieldOnEnter(event) {
  if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return

  const target = event.target
  const tagName = target.tagName

  if (tagName === 'TEXTAREA' || tagName === 'BUTTON') return

  const scope = event.currentTarget
  const fields = Array.from(scope.querySelectorAll(FIELD_SELECTOR)).filter(isVisible)
  const index = fields.indexOf(target)

  if (index === -1) return

  event.preventDefault()

  const next = fields[index + 1]
  if (next) {
    next.focus()
    return
  }

  const form = scope.tagName === 'FORM' ? scope : scope.querySelector('form')
  if (form && typeof form.requestSubmit === 'function') {
    form.requestSubmit()
  }
}
