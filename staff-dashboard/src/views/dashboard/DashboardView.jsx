import useDashboardViewModel from '../../viewmodels/dashboard/useDashboardViewModel.js'

const DashboardView = () => {
  const { user, greeting } = useDashboardViewModel()

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-semibold text-white">
          {greeting}, {user?.fullName ?? user?.username ?? 'team'}!
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          This is your mission control for menu updates, live orders, and table
          availability. We&apos;ll expand this overview with analytics and
          alerts as we build out the admin experience.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Active Orders', value: '—' },
          { label: 'Items Available', value: '—' },
          { label: 'Tables Occupied', value: '—' },
          { label: 'Staff Online', value: '—' },
        ].map(({ label, value }) => (
          <div
            className="rounded-2xl border border-white/5 bg-sidebar/60 p-5"
            key={label}
          >
            <p className="text-xs uppercase tracking-widest text-slate-500">
              {label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs text-slate-500">
              Coming soon as we wire API integrations.
            </p>
          </div>
        ))}
      </section>
    </div>
  )
}

export default DashboardView
