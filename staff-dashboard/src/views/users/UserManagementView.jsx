import { useEffect, useMemo, useState } from 'react'
import authService from '../../services/authService.js'
import userService from '../../services/userService.js'

const ROLE_OPTIONS = [
  { id: 2, label: 'Admin' },
  { id: 3, label: 'Chef' },
  { id: 4, label: 'Front of House' },
]

const emptyForm = {
  username: '',
  fullName: '',
  email: '',
  password: '',
  roleId: ROLE_OPTIONS[0].id,
}

const UserManagementView = () => {
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [usernameStatus, setUsernameStatus] = useState(null)

  const currentUser = useMemo(() => authService.getStoredUser(), [])
  const isSuperAdmin = currentUser?.roleName?.toLowerCase() === 'superadmin'
  const restaurantId = currentUser?.restaurantId

  useEffect(() => {
    if (!successMessage) {
      return
    }

    const timer = setTimeout(() => setSuccessMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [successMessage])

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
    setFormErrors((prev) => ({
      ...prev,
      [field]: null,
    }))
    if (field === 'username') {
      setUsernameStatus(null)
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!form.username.trim()) {
      errors.username = 'Username is required'
    } else if (form.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    }

    if (!form.fullName.trim()) {
      errors.fullName = 'Full name is required'
    }

    if (!form.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Enter a valid email address'
    }

    if (!form.password.trim()) {
      errors.password = 'Password is required'
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (!form.roleId) {
      errors.roleId = 'Select a role'
    }

    if (!restaurantId) {
      errors.restaurantId = 'Missing restaurant context'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCheckUsername = async () => {
    if (!form.username.trim()) {
      setFormErrors((prev) => ({ ...prev, username: 'Enter a username first' }))
      return
    }

    try {
      const result = await userService.checkUsername(form.username.trim())
      setUsernameStatus(result.available ? 'available' : 'taken')
    } catch (error) {
      setUsernameStatus('error')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSuccessMessage(null)

    try {
      const payload = {
        username: form.username.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        restaurantId,
        roleId: Number(form.roleId),
      }

      const response = await userService.createUser(payload)
      setSuccessMessage(`Created user ${response.username ?? form.username}`)
      setForm(emptyForm)
      setUsernameStatus(null)
    } catch (error) {
      const message = error.message || 'Failed to create user. Please try again.'
      setFormErrors((prev) => ({ ...prev, api: message }))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-8 text-sm text-amber-200">
        Only Super Admins may create staff accounts. Please contact an administrator for assistance.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Create Staff Account</h2>
        <p className="text-sm text-slate-400">
          Provision new team members with access to the platform. Passwords can be reset after first login.
        </p>
      </header>

      {successMessage && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successMessage}
        </div>
      )}

      {formErrors.api && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {formErrors.api}
        </div>
      )}

      <form
        className="space-y-5 rounded-2xl border border-white/10 bg-sidebar/80 px-6 py-6 shadow-lg"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="username">
              Username
            </label>
            <div className="mt-1 flex gap-2">
              <input
                autoComplete="username"
                className="flex-1 rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                id="username"
                name="username"
                onChange={handleFieldChange('username')}
                value={form.username}
              />
              <button
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-primary/40 hover:bg-primary/10"
                onClick={handleCheckUsername}
                type="button"
              >
                Check
              </button>
            </div>
            {usernameStatus === 'available' && (
              <p className="mt-1 text-xs text-emerald-300">Username is available</p>
            )}
            {usernameStatus === 'taken' && (
              <p className="mt-1 text-xs text-red-300">Username already taken</p>
            )}
            {usernameStatus === 'error' && (
              <p className="mt-1 text-xs text-amber-300">Could not verify username. Try again.</p>
            )}
            {formErrors.username && (
              <p className="mt-1 text-xs text-red-300">{formErrors.username}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="fullName">
              Full Name
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              id="fullName"
              name="fullName"
              onChange={handleFieldChange('fullName')}
              value={form.fullName}
            />
            {formErrors.fullName && (
              <p className="mt-1 text-xs text-red-300">{formErrors.fullName}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="email">
              Email Address
            </label>
            <input
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              id="email"
              name="email"
              onChange={handleFieldChange('email')}
              type="email"
              value={form.email}
            />
            {formErrors.email && (
              <p className="mt-1 text-xs text-red-300">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="password">
              Temporary Password
            </label>
            <input
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              id="password"
              name="password"
              onChange={handleFieldChange('password')}
              type="password"
              value={form.password}
            />
            {formErrors.password && (
              <p className="mt-1 text-xs text-red-300">{formErrors.password}</p>
            )}
          </div>
        </div>

        <div className="md:w-1/2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="roleId">
            Role
          </label>
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            id="roleId"
            name="roleId"
            onChange={handleFieldChange('roleId')}
            value={form.roleId}
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role.id} value={role.id}>
                {role.label}
              </option>
            ))}
          </select>
          {formErrors.roleId && (
            <p className="mt-1 text-xs text-red-300">{formErrors.roleId}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/5"
            disabled={isSubmitting}
            onClick={() => {
              setForm(emptyForm)
              setFormErrors({})
              setUsernameStatus(null)
            }}
            type="button"
          >
            Reset
          </button>
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </form>

      <section className="rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-xs text-slate-400">
        <h3 className="text-sm font-semibold text-slate-200">Tips</h3>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Share the temporary password with the staff member securely.</li>
          <li>They can update their password from the login screen after signing in.</li>
          <li>Need other roles? Extend the list in the user management view.</li>
        </ul>
      </section>
    </div>
  )
}

export default UserManagementView
