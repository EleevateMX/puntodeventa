import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessionActual, buscarClientePorEmail, crearCliente, isSupabaseConfigured } from '@pos/supabase'
import { useCarrito } from '@/store/carritoStore'

export function AuthCallback() {
  const navigate = useNavigate()
  const { setUsuario } = useCarrito()
  const [estado, setEstado] = useState('Verificando tu cuenta…')

  useEffect(() => {
    async function resolver() {
      if (!isSupabaseConfigured) {
        navigate('/pago', { replace: true })
        return
      }

      // Give Supabase a moment to exchange the token from URL hash
      await new Promise((r) => setTimeout(r, 800))

      const session = await getSessionActual()
      const user = session?.user

      if (!user || !user.email) {
        navigate('/pago', { replace: true })
        return
      }

      setEstado('Buscando tu cuenta…')

      // Look for existing loyalty account by email
      let clienteId: string | null = null
      try {
        let cliente = await buscarClientePorEmail(user.email)
        if (!cliente) {
          setEstado('Creando tu cuenta de lealtad…')
          cliente = await crearCliente({
            nombre: user.user_metadata?.full_name ?? user.email.split('@')[0] ?? 'Cliente',
            email: user.email,
            telefono: null,
          })
        }
        clienteId = cliente?.id ?? null
      } catch (e) {
        console.error('[AuthCallback] Error lealtad:', e)
      }

      setUsuario({
        authId: user.id,
        nombre: user.user_metadata?.full_name ?? user.email.split('@')[0] ?? 'Cliente',
        email: user.email,
        clienteId,
      })

      navigate('/pago', { replace: true })
    }

    resolver().catch((e) => {
      console.error('[AuthCallback]', e)
      navigate('/pago', { replace: true })
    })
  }, [navigate, setUsuario])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-sa-green-deep text-sa-cream gap-6">
      <div className="w-12 h-12 border-4 border-sa-cream/30 border-t-sa-cream rounded-full animate-spin" />
      <p className="font-display text-2xl">{estado}</p>
    </div>
  )
}
