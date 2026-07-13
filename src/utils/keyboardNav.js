const FIELD_SELECTOR = [
  'input:not([type=hidden]):not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button[aria-haspopup="listbox"]:not([disabled])',
].join(', ')

const isVisible = (element) => element.offsetParent !== null

/**
 * Delegated Enter-key handler: attach to a form/modal wrapper via
 * `onKeyDown={focusNextFieldOnEnter}`. Moves focus to the next field in DOM
 * order on Enter. Leaves textareas and buttons (including Combobox trigger/
 * option buttons) untouched so their native Enter behavior keeps working.
 * On the last field inside a real <form>, submits the form instead.
 */
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
