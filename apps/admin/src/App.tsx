import React from 'react'
import { Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { Menu } from './pages/Menu'
import { Inventario } from './pages/Inventario'
import { Ventas } from './pages/Ventas'
import { Roles } from './pages/Roles'
import { Promociones } from './pages/Promociones'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/menu', label: 'Menú', icon: '🍽️' },
  { to: '/inventario', label: 'Inventario', icon: '📦' },
  { to: '/promociones', label: 'Promociones', icon: '🎟️' },
  { to: '/ventas', label: 'Ventas', icon: '💰' },
  { to: '/roles', label: 'Empleados', icon: '👥' },
]

export default function App() {
  return (
    <div className="flex min-h-screen bg-sa-cream-paper">
      {/* Sidebar */}
      <aside className="w-64 bg-sa-green-deep text-sa-cream flex flex-col">
        <div className="px-6 pt-7 pb-6">
          <img
            src="/logo.png"
            alt="Shake Aholic"
            className="w-[140px] h-auto select-none"
            draggable={false}
          />
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-sa-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-sa-cream text-sa-green-ink font-semibold shadow-sa-sm'
                    : 'text-sa-cream/80 hover:text-sa-cream hover:bg-white/5 font-medium'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-5 border-t border-sa-cream/10">
          <p className="text-[11px] font-mono uppercase tracking-wider text-sa-cream/60">
            Shake Aholic · Admin
          </p>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 bg-sa-cream-paper">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/promociones" element={<Promociones />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/roles" element={<Roles />} />
        </Routes>
      </main>
    </div>
  )
}
