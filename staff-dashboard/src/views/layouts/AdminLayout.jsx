import { NavLink, Outlet } from 'react-router-dom'
import useAdminLayoutViewModel from '../../viewmodels/layouts/useAdminLayoutViewModel.js'

const AdminLayout = () => {
  const { user, isChecking, handleLogout } = useAdminLayoutViewModel()

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-slate-200">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-sidebar/80 px-6 py-4 shadow-lg">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm font-medium tracking-wide">
            Preparing dashboard...
          </span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const navigationItems = [
    { to: '/dashboard', label: 'Overview', icon: DashboardIcon },
    { to: '/menu', label: 'Menu Manager', icon: MenuIcon },
    { to: '/orders', label: 'Orders', icon: OrdersIcon },
    { to: '/tables', label: 'Tables', icon: TablesIcon },
  ]

  return (
    <div className="flex min-h-screen bg-surface text-slate-100">
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-sidebar/95 px-6 py-8 lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <DashboardIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">
              Digital Menu
            </p>
            <p className="text-lg font-semibold text-white">
              Staff Dashboard
            </p>
          </div>
        </div>

        <nav className="mt-10 space-y-1">
          {navigationItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-primary/15 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
              key={to}
              to={to}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Signed in as
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {user?.fullName ?? user?.username}
          </p>
          <p className="text-xs text-slate-500">{user?.roleName}</p>
          <button
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
            onClick={handleLogout}
            type="button"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 bg-sidebar/80 px-6 py-4 backdrop-blur">
          <div>
            <h1 className="text-lg font-semibold text-white">
              {user?.restaurantName ?? 'My Restaurant'}
            </h1>
            <p className="text-xs text-slate-400">
              Manage menu, orders, and floor in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium text-white">
                {user?.fullName ?? user?.username}
              </p>
              <p className="text-xs text-slate-400">{user?.roleName}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
              <span className="text-sm font-semibold">
                {(user?.fullName ?? user?.username ?? 'U')
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-surface px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const DashboardIcon = (props) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M3.75 5A2.25 2.25 0 0 1 6 2.75h2.25A2.25 2.25 0 0 1 10.5 5v2.25A2.25 2.25 0 0 1 8.25 9.5H6A2.25 2.25 0 0 1 3.75 7.25V5Z" />
    <path d="M13.5 5A2.25 2.25 0 0 1 15.75 2.75H18a2.25 2.25 0 0 1 2.25 2.25v2.25A2.25 2.25 0 0 1 18 9.5h-2.25A2.25 2.25 0 0 1 13.5 7.25V5Z" />
    <path d="M3.75 15A2.25 2.25 0 0 1 6 12.75h2.25A2.25 2.25 0 0 1 10.5 15v2.25A2.25 2.25 0 0 1 8.25 19.5H6A2.25 2.25 0 0 1 3.75 17.25V15Z" />
    <path d="M13.5 15a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 15v2.25A2.25 2.25 0 0 1 18 19.5h-2.25A2.25 2.25 0 0 1 13.5 17.25V15Z" />
  </svg>
)

const MenuIcon = (props) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M4.5 6.75h15" />
    <path d="M4.5 12h15" />
    <path d="M4.5 17.25h15" />
  </svg>
)

const OrdersIcon = (props) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M4.5 4.5h15v15h-15z" />
    <path d="M8 8h8" />
    <path d="M8 12h8" />
    <path d="M8 16h5" />
  </svg>
)

const TablesIcon = (props) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M4 7h16l-1 10H5L4 7Z" />
    <path d="M9 7V5h6v2" />
  </svg>
)

export default AdminLayout
