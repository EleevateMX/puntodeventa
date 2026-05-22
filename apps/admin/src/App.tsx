import React, { useState } from 'react'
import { Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { isSupabaseConfigured } from '@pos/supabase'
import { Dashboard } from './pages/Dashboard'
import { Menu } from './pages/Menu'
import { Inventario } from './pages/Inventario'
import { Ventas } from './pages/Ventas'
import { Roles } from './pages/Roles'
import { Promociones } from './pages/Promociones'
import { Lealtad } from './pages/Lealtad'

const DEMO_KEY = 'shake-demo-mode'

function getDemoMode(): boolean {
  return !isSupabaseConfigured || localStorage.getItem(DEMO_KEY) === 'true'
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/menu', label: 'Menú', icon: '🍽️' },
  { to: '/inventario', label: 'Inventario', icon: '📦' },
  { to: '/promociones', label: 'Promociones', icon: '🎟️' },
  { to: '/lealtad', label: 'Lealtad', icon: '⭐' },
  { to: '/ventas', label: 'Ventas', icon: '💰' },
  { to: '/roles', label: 'Empleados', icon: '👥' },
]

export default function App() {
  const [demoMode] = useState(getDemoMode)

  function toggleDemo() {
    if (!isSupabaseConfigured) return
    const next = !demoMode
    localStorage.setItem(DEMO_KEY, String(next))
    window.location.reload()
  }

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
        <div className="px-4 py-4 border-t border-sa-cream/10 space-y-3">
          {/* Demo mode toggle */}
          {isSupabaseConfigured ? (
            <button
              onClick={toggleDemo}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-sa text-xs font-mono uppercase tracking-wide transition-colors ${
                demoMode
                  ? 'bg-sa-banana/20 text-sa-banana hover:bg-sa-banana/30'
                  : 'bg-sa-cream/10 text-sa-cream/70 hover:bg-sa-cream/20'
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${demoMode ? 'bg-sa-banana' : 'bg-emerald-400'}`} />
              {demoMode ? 'Modo DEMO · Usar datos reales' : 'Datos reales · Habilitar DEMO'}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-sa bg-sa-banana/20 text-sa-banana text-xs font-mono uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-sa-banana flex-shrink-0" />
              Modo DEMO
            </div>
          )}
          <p className="text-[11px] font-mono uppercase tracking-wider text-sa-cream/40 px-1">
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
          <Route path="/lealtad" element={<Lealtad />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/roles" element={<Roles />} />
        </Routes>
      </main>
    </div>
  )
}
