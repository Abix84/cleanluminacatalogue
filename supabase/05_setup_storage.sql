-- ==========================================
-- CONFIGURATION STORAGE
-- ==========================================
-- 
-- Note: La création du bucket doit être faite manuellement dans le Dashboard Supabase
-- Ce script configure uniquement les policies RLS pour le storage
-- ==========================================

-- Créer le bucket "product-images" (à faire manuellement dans le Dashboard)
-- 1. Allez dans Storage → Create bucket
-- 2. Nom: product-images
-- 3. Public bucket: OUI
-- 4. File size limit: 5MB (ou selon vos besoins)
-- 5. Allowed MIME types: image/*

-- Policies pour le bucket product-images
-- (Ces policies seront créées automatiquement si le bucket est public,
-- mais vous pouvez les personnaliser ici)

-- Policy: Lecture publique des images
-- (Automatique si le bucket est public)

-- Policy: Upload réservé aux admins
-- Note: Les policies de storage doivent être créées via l'interface Supabase
-- ou via l'API, pas via SQL directement

-- Pour créer les policies de storage, utilisez le Dashboard Supabase :
-- 1. Allez dans Storage → product-images → Policies
-- 2. Créez une policy "Admins can upload images" :
--    - Policy name: Admins can upload images
--    - Allowed operation: INSERT
--    - Target roles: authenticated
--    - USING expression: is_admin(auth.uid())
--    - WITH CHECK expression: is_admin(auth.uid())
--
-- 3. Créez une policy "Admins can delete images" :
--    - Policy name: Admins can delete images
--    - Allowed operation: DELETE
--    - Target roles: authenticated
--    - USING expression: is_admin(auth.uid())

