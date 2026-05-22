# POS Kiosko — Sistema de Autoservicio para Restaurante

Sistema de punto de venta tipo kiosko de autoservicio para restaurantes. El cliente realiza su pedido desde una pantalla táctil, paga con terminal bancaria y las comandas llegan en tiempo real a las cocinas correspondientes.

## Apps

| App | Descripción |
|-----|-------------|
| `apps/kiosko` | Kiosko táctil (React + Electron) |
| `apps/cocina-alimentos` | Pantalla de cocina — Alimentos |
| `apps/cocina-bebidas` | Pantalla de cocina — Bebidas |
| `apps/admin` | Panel de administración |

## Paquetes

| Paquete | Descripción |
|---------|-------------|
| `packages/ui` | Componentes React compartidos |
| `packages/supabase` | Cliente Supabase, tipos y queries |
| `packages/config` | TypeScript y ESLint compartidos |

## Comandos

```bash
npm install          # Instalar dependencias
npm run dev          # Todas las apps en paralelo
npm run build        # Build de producción
npm run type-check   # Verificar tipos
```

## Variables de entorno

Copiar `.env.example` a `.env` y completar las credenciales.
