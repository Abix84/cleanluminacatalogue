# 📋 Installation Supabase - Guide Rapide

## 🚀 Installation en 3 étapes

### Étape 1 : Exécuter le script SQL complet

1. Ouvrez **Supabase Dashboard** → **SQL Editor**
2. Copiez **TOUT** le contenu du fichier `00_COMPLETE_SETUP.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur **Run** (ou F5)

✅ Ce script crée :
- La table `profiles` (rôles utilisateurs)
- Les tables `products`, `brands`, `utility_categories`
- Les fonctions utilitaires (`is_admin`, `create_admin_profile`, etc.)
- Les policies RLS
- Les marques et catégories initiales

### Étape 2 : Créer le bucket Storage

1. Allez dans **Storage** → **Create bucket**
2. Nom : `product-images`
3. **Public bucket** : ✅ OUI
4. Cliquez sur **Create bucket**

### Étape 3 : Déployer la Edge Function (pour créer des utilisateurs)

**Option A : Via Supabase CLI** (Recommandé)
```bash
supabase functions deploy create-user
```

**Option B : Via le Dashboard**
1. Allez dans **Edge Functions** → **Create a new function**
2. Nom : `create-user`
3. Copiez le contenu de `supabase/functions/create-user/index.ts`
4. Déployez

Voir `06_deploy_edge_function.md` pour plus de détails.

### Étape 4 : Créer votre premier admin

**Option A : Via SQL** (méthode rapide)
```sql
-- Créez d'abord un compte dans l'application (page de login)
-- Puis exécutez :
SELECT create_admin_profile('votre-email@example.com', 'Votre Nom');
```

**Option B : Via le Dashboard** (après avoir créé votre compte admin)
1. Connectez-vous avec votre compte admin
2. Allez dans `/admin/users`
3. Cliquez sur "Ajouter un utilisateur"
4. Remplissez le formulaire et créez d'autres utilisateurs

## ✅ Vérification

Exécutez ces requêtes pour vérifier :

```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Vérifier les profils
SELECT * FROM profiles;

-- Vérifier les marques (devrait être 26)
SELECT COUNT(*) FROM brands;

-- Vérifier les catégories (devrait être 60)
SELECT COUNT(*) FROM utility_categories;
```

## 📚 Scripts Disponibles

- **`00_COMPLETE_SETUP.sql`** : Script complet (tout en un) ⭐ **UTILISEZ CELUI-CI**
- `01_create_tables.sql` : Création des tables uniquement
- `02_create_functions.sql` : Fonctions utilitaires
- `03_create_rls_policies.sql` : Policies RLS
- `04_seed_data.sql` : Données initiales
- `05_setup_storage.sql` : Guide pour le storage
- `06_deploy_edge_function.md` : Guide pour déployer la fonction create-user

## 🔧 Commandes Utiles

### Créer un admin
```sql
SELECT create_admin_profile('email@example.com', 'Nom Complet');
```

### Créer un vendeur
```sql
SELECT create_vendeur_profile('email@example.com', 'Nom Complet');
```

### Voir tous les utilisateurs
```sql
SELECT * FROM get_users_with_profiles();
```

## 📖 Documentation Complète

Voir `INSTALLATION_COMPLETE.md` pour plus de détails.

## 🔄 Migration : Ajouter le champ Company

Si votre table `products` existe déjà, exécutez le script `add_company_to_products.sql` pour ajouter la colonne `company`.

