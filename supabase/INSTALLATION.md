# 🚀 Installation Supabase - Guide Complet

## 📋 Vue d'ensemble

Ce guide vous permet de configurer votre projet Supabase avec :
- ✅ Table `profiles` pour les rôles utilisateurs (admin, vendeur)
- ✅ Tables `products`, `brands`, `utility_categories`
- ✅ Row Level Security (RLS) policies
- ✅ Fonctions utilitaires pour la gestion des rôles
- ✅ Données initiales (26 marques et 60 catégories)

## 🎯 Installation Rapide (Recommandée)

**Utilisez le script complet** : `00_COMPLETE_SETUP.sql`

1. Ouvrez **Supabase Dashboard** → **SQL Editor**
2. Copiez **TOUT** le contenu de `00_COMPLETE_SETUP.sql`
3. Collez et exécutez
4. Créez le bucket `product-images` (Storage → Create bucket → Public)
5. Créez votre premier admin : `SELECT create_admin_profile('votre-email@example.com');`

✅ **C'est tout !** Voir `README.md` pour plus de détails.

## 📝 Installation Étape par Étape

Si vous préférez exécuter les scripts séparément :

### Étape 1 : Créer les tables
Exécutez `01_create_tables.sql`

### Étape 2 : Créer les fonctions
Exécutez `02_create_functions.sql`

### Étape 3 : Créer les policies RLS
Exécutez `03_create_rls_policies.sql`

### Étape 4 : Insérer les données
Exécutez `04_seed_data.sql`

### Étape 5 : Configurer le storage
Suivez les instructions dans `05_setup_storage.sql`

## 📚 Documentation

- **`README.md`** : Guide rapide
- **`INSTALLATION_COMPLETE.md`** : Documentation détaillée complète
- **`00_COMPLETE_SETUP.sql`** : Script tout-en-un ⭐

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

## ✅ Vérification

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
