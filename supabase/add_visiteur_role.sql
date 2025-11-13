-- ==========================================
-- MIGRATION : Ajouter le rôle "visiteur"
-- ==========================================
-- 
-- Ce script ajoute le rôle "visiteur" à la table profiles
-- Exécutez ce script dans le SQL Editor de Supabase
-- ==========================================

-- Étape 1 : Supprimer toutes les contraintes CHECK existantes sur la colonne role
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Trouver toutes les contraintes CHECK sur la colonne role
    FOR constraint_record IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'profiles'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) LIKE '%role%IN%'
    LOOP
        EXECUTE format('ALTER TABLE profiles DROP CONSTRAINT IF EXISTS %I', constraint_record.conname);
        RAISE NOTICE 'Contrainte % supprimée', constraint_record.conname;
    END LOOP;
END $$;

-- Étape 2 : Supprimer explicitement la contrainte si elle existe avec ce nom exact
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Étape 3 : Ajouter la nouvelle contrainte CHECK avec 'visiteur'
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'vendeur', 'visiteur'));

-- Étape 4 : Mettre à jour les commentaires
COMMENT ON TABLE profiles IS 'Profils utilisateurs avec rôles (admin, vendeur, visiteur)';
COMMENT ON COLUMN profiles.role IS 'Rôle de l''utilisateur: admin (accès complet), vendeur (lecture seule) ou visiteur (accès catalogue)';

-- Vérification : Afficher la structure mise à jour
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name = 'role';

-- Afficher les contraintes
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
  AND contype = 'c'
  AND conname LIKE '%role%';

