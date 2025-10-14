export const loginFormInitialState = {
  username: '',
  password: '',
}

export const validateLoginForm = (form) => {
  const errors = {}

  if (!form.username.trim()) {
    errors.username = 'Username is required'
  }

  if (!form.password.trim()) {
    errors.password = 'Password is required'
  }

  return errors
}
