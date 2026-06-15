export const sanitizeText = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim())

export const isValidPhone = (value) => {
  const phone = String(value ?? '').replace(/\s/g, '')
  return phone === '' || /^[\d+()-]{10,}$/.test(phone)
}

export const validateRequired = (value, label) => {
  return sanitizeText(value) ? '' : `${label} is required`
}

export const validateUserForm = (formData, { editing = false } = {}) => {
  const errors = {}

  const nameError = validateRequired(formData.fullName, 'Full name')
  if (nameError) errors.fullName = nameError

  const email = sanitizeText(formData.email)
  if (!email) errors.email = 'Email is required'
  else if (!isValidEmail(email)) errors.email = 'Invalid email format'

  const usernameError = validateRequired(formData.username, 'Username')
  if (usernameError) errors.username = usernameError

  if (!editing) {
    if (!formData.password) errors.password = 'Password is required'
    else if (String(formData.password).length < 6) errors.password = 'Password must be at least 6 characters'
  } else if (formData.password && String(formData.password).length < 6) {
    errors.password = 'New password must be at least 6 characters'
  }

  if (!isValidPhone(formData.phoneNo)) errors.phoneNo = 'Invalid phone number'

  return errors
}
