# CAPTARQR

Plataforma SaaS multi-tenant de captación y fidelización de clientes mediante formularios inteligentes, QR dinámicos y ruletas de premios.

## Stack

- **Frontend:** Next.js 15 (App Router) + React 19 + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + RLS + Storage)
- **Hosting:** Vercel

## Instalación rápida

### 1. Clonar / descomprimir

```bash
cd captarqr
npm install
```

### 2. Configurar variables de entorno

Copia `.env.local.example` a `.env.local` y rellena:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Base de datos

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor**
3. Ejecuta el archivo `supabase/schema.sql` (schema completo + RLS + datos iniciales)

### 4. Crear Super Admin

1. En Supabase → Authentication → Users → Add user (email + password)
2. Copia el UUID del usuario
3. Ejecuta en SQL Editor:

```sql
INSERT INTO profiles (id, email, full_name, role, is_active)
VALUES (
  'UUID-DEL-USUARIO',
  'tu@email.com',
  'Administrador',
  'super_admin',
  true
);
```

### 5. Arrancar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Estructura principal

```
app/
  (auth)/          → Login / Register
  (dashboard)/
    admin/         → Panel Super Admin
    partner/       → Panel Partner
    business/      → Panel Negocio
  q/[slug]/        → Landing pública del QR
  api/public/      → APIs de captación, ruleta, enlaces
components/
lib/
types/
```

## Módulos incluidos

- Autenticación multi-rol
- Panel Administrador
- Panel Partner
- Panel Negocio (Dashboard, Clientes, Ruleta, QR)
- Landing pública + Formulario + Ruleta
- APIs públicas de captación

## Próximos módulos

- Gestión completa de Enlaces
- Campañas
- Pagos (Stripe / Revolut)
- Edge Functions de notificaciones y métricas

## Identidad visual

- Verde principal: `#25D366`
- Verde secundario: `#128C7E`
- Fondo: `#111827`
- Texto: `#FFFFFF`
