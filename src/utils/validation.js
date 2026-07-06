export const sanitizeText = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim())

export const isValidPhone = (value) => {
  const phone = String(value ?? '').trim()
  return phone === '' || /^\d{10}$/.test(phone)
}

export const validateRequired = (value, label) => {
  return sanitizeText(value) ? '' : `${label} is required`
}

export const validateUserForm = (formData, { editing = false } = {}) => {
  const errors = {}

  const fullName = sanitizeText(formData.fullName)
  if (!fullName) errors.fullName = 'Full name is required'
  else if (fullName.length < 2) errors.fullName = 'Full name must be at least 2 characters'
  else if (fullName.length > 100) errors.fullName = 'Full name cannot exceed 100 characters'

  const email = sanitizeText(formData.email)
  if (!email) errors.email = 'Email is required'
  else if (!isValidEmail(email)) errors.email = 'Invalid email format'
  else if (email.length > 150) errors.email = 'Email cannot exceed 150 characters'

  const username = sanitizeText(formData.username)
  if (!username) errors.username = 'Username is required'
  else if (username.length < 3) errors.username = 'Username must be at least 3 characters'
  else if (username.length > 50) errors.username = 'Username cannot exceed 50 characters'
  else if (!/^[A-Za-z0-9._-]+$/.test(username)) errors.username = 'Username can use letters, numbers, dots, underscores, or hyphens only'

  if (!editing) {
    if (!formData.password) errors.password = 'Password is required'
    else if (String(formData.password).length < 6) errors.password = 'Password must be at least 6 characters'
    else if (String(formData.password).length > 100) errors.password = 'Password cannot exceed 100 characters'
  } else if (formData.password && String(formData.password).length < 6) {
    errors.password = 'New password must be at least 6 characters'
  } else if (formData.password && String(formData.password).length > 100) {
    errors.password = 'New password cannot exceed 100 characters'
  }

  const phoneNo = sanitizeText(formData.phoneNo)
  if (!phoneNo) errors.phoneNo = 'Phone number is required'
  else if (!/^\d+$/.test(phoneNo)) errors.phoneNo = 'Phone number must contain digits only'
  else if (!isValidPhone(phoneNo)) errors.phoneNo = 'Phone number must be exactly 10 digits'

  const status = sanitizeText(formData.status).toLowerCase()
  if (!status) errors.status = 'Status is required'
  else if (!['active', 'inactive'].includes(status)) errors.status = 'Status must be active or inactive'

  return errors
}
