# Instrucciones de Base de Datos CAPTARQR

## Orden de ejecución en Supabase SQL Editor

1. Ejecuta el schema completo (tablas, constraints, índices, triggers)
2. Ejecuta las políticas RLS
3. Ejecuta los datos iniciales (planes, countries, platform_settings)

El schema completo y las políticas RLS se generaron en la conversación de arquitectura.
Debido al tamaño, se recomienda copiarlos desde el historial de la conversación o solicitarlos de nuevo.

## Crear Super Admin

1. Authentication → Users → Add user
2. Copia el UUID
3. Ejecuta:

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
