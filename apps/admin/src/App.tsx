import React from 'react'
import { Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { Menu } from './pages/Menu'
import { Inventario } from './pages/Inventario'
import { Ventas } from './pages/Ventas'
import { Roles } from './pages/Roles'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/menu', label: 'Menú', icon: '🍽️' },
  { to: '/inventario', label: 'Inventario', icon: '📦' },
  { to: '/ventas', label: 'Ventas', icon: '💰' },
  { to: '/roles', label: 'Empleados', icon: '👥' },
]

export default function App() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-orange-400">POS Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/roles" element={<Roles />} />
        </Routes>
      </main>
    </div>
  )
}
