import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { label: 'Home', to: '/', end: true },
  { label: 'City Overview', to: '/city', end: true },
  { label: 'About', to: '/about', end: true },
]

function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <NavLink className="text-lg font-semibold text-brand" to="/">
            UIS
          </NavLink>
          <nav aria-label="Main navigation" className="flex flex-wrap gap-x-5 gap-y-2">
            {navigation.map(({ label, to, end }) => (
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? 'rounded-control px-2 py-1 text-sm font-semibold text-brand transition-colors duration-150'
                    : 'rounded-control px-2 py-1 text-sm text-muted transition-colors duration-150 hover:bg-brand-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
                }
                end={end}
                key={label}
                to={to}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-5 text-sm text-muted sm:px-6">
          UIS · Urban Intelligence System
        </div>
      </footer>
    </div>
  )
}

export default DashboardLayout