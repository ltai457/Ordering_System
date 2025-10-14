import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  loginFormInitialState,
  validateLoginForm,
} from '../../models/auth/loginFormModel.js'
import authService from '../../services/authService.js'

const useLoginViewModel = () => {
  const [form, setForm] = useState(loginFormInitialState)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()

  const handleChange = useCallback((field) => {
    return (event) => {
      const value = event.target.value
      setForm((prev) => ({ ...prev, [field]: value }))

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }
  }, [errors])

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      setApiError(null)

      const validationErrors = validateLoginForm(form)
      setErrors(validationErrors)

      if (Object.keys(validationErrors).length > 0) {
        return
      }

      setIsSubmitting(true)

      try {
        await authService.login(form)
        navigate('/dashboard', { replace: true })
      } catch (error) {
        setApiError(error.message ?? 'Unable to login')
      } finally {
        setIsSubmitting(false)
      }
    },
    [form, navigate],
  )

  return {
    form,
    errors,
    apiError,
    isSubmitting,
    handleChange,
    handleSubmit,
  }
}

export default useLoginViewModel
