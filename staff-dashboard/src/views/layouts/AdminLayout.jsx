import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import useAdminLayoutViewModel from '../../viewmodels/layouts/useAdminLayoutViewModel.js'

const AdminLayout = () => {
  const { user, isChecking, handleLogout } = useAdminLayoutViewModel()
  const location = useLocation()
  const navigate = useNavigate()
  const roleName = user?.roleName?.toLowerCase() ?? ''
  const isKitchenUser = roleName === 'chef'
  const isSuperAdmin = roleName === 'superadmin'

  const navigationItems = useMemo(() => {
    if (isKitchenUser) {
      return [
        { to: '/kitchen', label: 'Kitchen Display', icon: KitchenIcon },
      ]
    }

    const items = [
      { to: '/dashboard', label: 'Overview', icon: DashboardIcon },
      { to: '/menu/categories', label: 'Menu Categories', icon: MenuIcon },
      { to: '/menu/items', label: 'Menu Items', icon: ItemsIcon },
      { to: '/menu/addon-library', label: 'Add-on Library', icon: LibraryIcon },
      { to: '/orders', label: 'Orders', icon: OrdersIcon },
      { to: '/kitchen', label: 'Kitchen Display', icon: KitchenIcon },
      { to: '/tables', label: 'Tables', icon: TablesIcon },
    ]

    if (isSuperAdmin) {
      items.splice(4, 0, { to: '/users', label: 'Staff Accounts', icon: UsersIcon })
    }

    return items
  }, [isKitchenUser, isSuperAdmin])

  const allowedPaths = useMemo(
    () => navigationItems.map((item) => item.to),
    [navigationItems],
  )

  useEffect(() => {
    if (isChecking || !isKitchenUser) {
      return
    }

    if (!allowedPaths.includes(location.pathname)) {
      navigate('/kitchen', { replace: true })
    }
  }, [allowedPaths, isChecking, isKitchenUser, location.pathname, navigate])

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

  return (
    <div className="flex min-h-screen bg-surface text-slate-100">
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-sidebar/95 px-6 py-8 lg:flex fixed left-0 top-0 bottom-0 overflow-y-auto">
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

      <div className="flex flex-1 flex-col lg:ml-64">
        <header className="flex items-center justify-between border-b border-white/10 bg-sidebar/80 px-6 py-4 backdrop-blur fixed top-0 right-0 left-0 lg:left-64 z-30">
          <div>
            <h1 className="text-lg font-semibold text-white">
              {user?.restaurantName ?? 'My Restaurant'}
            </h1>
            <p className="text-xs text-slate-400">
              {isKitchenUser
                ? 'Kitchen mode — stay on top of incoming tickets.'
                : 'Manage menu, orders, and floor in real time.'}
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

        <main className="flex-1 overflow-y-auto bg-surface px-6 py-8 mt-[73px]">
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
    <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ItemsIcon = (props) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 15.75m18 0v-2.513m0 2.513v.375c0 .621-.504 1.125-1.125 1.125h-15.75A1.125 1.125 0 0 1 3 16.125V15.75m18-2.513v-2.013a2.25 2.25 0 0 0-1.5-2.122l-1.5-.5m-15 4.635v2.513m0-2.513V11.25a2.25 2.25 0 0 1 1.5-2.122l1.5-.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const LibraryIcon = (props) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" strokeLinecap="round" strokeLinejoin="round" />
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

const KitchenIcon = (props) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4.5 4.5h15v6h-15zM7.5 10.5v9m9-9v9M4.5 19.5h15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9 13.5h6" strokeLinecap="round" />
  </svg>
)

const UsersIcon = (props) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M15.75 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 19.5a6 6 0 1 1 12 0"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.75 9.75a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 19.5a3.75 3.75 0 0 0-5.678-3.215"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default AdminLayout
