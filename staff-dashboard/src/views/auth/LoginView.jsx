import useLoginViewModel from '../../viewmodels/auth/useLoginViewModel.js'

const LoginView = () => {
  const {
    form,
    errors,
    apiError,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useLoginViewModel()

  return (
    <div className="rounded-2xl border border-white/10 bg-sidebar/80 p-10 shadow-2xl backdrop-blur">
      <div className="mb-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M3 5h18M7 3v4m10-4v4M5 9h14l-1 11H6L5 9Zm5 3v6m4-6v6"
            />
          </svg>
        </span>
        <h1 className="mt-6 text-2xl font-semibold text-white">
          Staff Portal
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to manage menu, orders, and tables.
        </p>
      </div>

      {apiError ? (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {apiError}
        </div>
      ) : null}

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-300"
            htmlFor="username"
          >
            Username
          </label>
          <input
            autoComplete="username"
            className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            id="username"
            name="username"
            onChange={handleChange('username')}
            placeholder="e.g. admin"
            type="text"
            value={form.username}
          />
          {errors.username ? (
            <p className="mt-2 text-xs text-red-300">{errors.username}</p>
          ) : null}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              className="block text-sm font-medium text-slate-300"
              htmlFor="password"
            >
              Password
            </label>
            <button
              className="text-xs font-medium text-slate-400 transition hover:text-slate-200"
              type="button"
            >
              Forgot password?
            </button>
          </div>
          <input
            autoComplete="current-password"
            className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            id="password"
            name="password"
            onChange={handleChange('password')}
            placeholder="••••••••"
            type="password"
            value={form.password}
          />
          {errors.password ? (
            <p className="mt-2 text-xs text-red-300">{errors.password}</p>
          ) : null}
        </div>

        <button
          className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-slate-500">
        Access is limited to restaurant staff and administrators.
      </p>
    </div>
  )
}

export default LoginView
