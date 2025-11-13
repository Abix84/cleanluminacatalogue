# 🔧 Ajouter le rôle "Visiteur" dans Supabase

Ce guide explique comment ajouter le rôle "visiteur" à votre base de données Supabase.

## 📋 Prérequis

- Accès au dashboard Supabase
- Accès au SQL Editor de votre projet

## 🚀 Étapes

### Option 1 : Script automatique (Recommandé)

1. **Ouvrez le SQL Editor** dans votre projet Supabase
2. **Copiez-collez** le contenu du fichier `supabase/add_visiteur_role.sql`
3. **Exécutez** le script
4. **Vérifiez** que la migration s'est bien passée

### Option 2 : Commande manuelle

Si vous préférez exécuter les commandes manuellement :

```sql
-- 1. Trouver et supprimer l'ancienne contrainte
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'profiles'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%role%IN%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE profiles DROP CONSTRAINT IF EXISTS %I', constraint_name);
    END IF;
END $$;

-- 2. Ajouter la nouvelle contrainte avec 'visiteur'
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'vendeur', 'visiteur'));

-- 3. Mettre à jour les commentaires
COMMENT ON TABLE profiles IS 'Profils utilisateurs avec rôles (admin, vendeur, visiteur)';
COMMENT ON COLUMN profiles.role IS 'Rôle de l''utilisateur: admin (accès complet), vendeur (lecture seule) ou visiteur (accès catalogue)';
```

## ✅ Vérification

Après avoir exécuté le script, vérifiez que tout fonctionne :

```sql
-- Vérifier que la contrainte accepte 'visiteur'
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
  AND contype = 'c'
  AND conname LIKE '%role%';
```

Vous devriez voir une contrainte qui inclut `('admin', 'vendeur', 'visiteur')`.

## 🧪 Test

Testez en créant un profil avec le rôle visiteur :

```sql
-- Exemple (remplacez l'UUID par un ID utilisateur valide)
UPDATE profiles 
SET role = 'visiteur' 
WHERE id = 'votre-user-id-ici';
```

## ⚠️ Important

- **Sauvegardez** votre base de données avant d'exécuter la migration
- Cette migration est **rétrocompatible** : les rôles existants (admin, vendeur) continueront de fonctionner
- Les nouveaux utilisateurs qui s'inscrivent obtiendront automatiquement le rôle "visiteur" grâce au code de l'application

## 📝 Notes

- Si vous avez des données existantes, elles ne seront pas affectées
- La contrainte CHECK empêchera l'insertion de rôles invalides
- Le code de l'application a déjà été mis à jour pour supporter le rôle "visiteur"

