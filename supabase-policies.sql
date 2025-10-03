-- ===================================================================
-- CONFIGURACIÓN DE POLÍTICAS PARA SUPABASE STORAGE - IMG-BILLETES BUCKET
-- ===================================================================
-- 🚨 EJECUTA ESTOS COMANDOS EN EL SQL EDITOR DE SUPABASE DASHBOARD

-- PASO 1: Verificar/crear bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('img-billetes', 'img-billetes', true)
ON CONFLICT (id) DO NOTHING;

-- PASO 2: Eliminar políticas existentes si hay conflictos
DROP POLICY IF EXISTS "Allow uploads to img-billetes bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes from profile images" ON storage.objects;

-- PASO 3: Crear políticas permisivas para desarrollo
CREATE POLICY "Allow all operations on img-billetes" ON storage.objects
FOR ALL USING (bucket_id = 'img-billetes')
WITH CHECK (bucket_id = 'img-billetes');

-- ALTERNATIVA: Si sigue fallando, deshabilitar RLS temporalmente
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
-- ⚠️ Solo para desarrollo, NO usar en producción

-- ===================================================================
-- NOTAS IMPORTANTES:
-- ===================================================================
-- 1. ✅ Bucket configurado: 'img-billetes'
-- 2. Estas políticas permiten acceso público - ajústalas según tus necesidades
-- 3. Si quieres mayor seguridad, puedes agregar condiciones auth.uid()
-- ===================================================================