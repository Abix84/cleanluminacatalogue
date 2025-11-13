# 📋 Installation Complète - Nouveau Projet Supabase

## 🎯 Vue d'ensemble

Ce guide vous permet de configurer un nouveau projet Supabase propre avec :
- Table `profiles` pour les rôles utilisateurs (admin, vendeur)
- Tables `products`, `brands`, `utility_categories`
- Row Level Security (RLS) policies
- Fonctions utilitaires pour la gestion des rôles
- Données initiales (marques et catégories)

## 📝 Étapes d'Installation

### Étape 1 : Créer le projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **Project URL** et votre **anon key** (Settings → API)

### Étape 2 : Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_anon
```

### Étape 3 : Exécuter les scripts SQL

Dans le **SQL Editor** de Supabase, exécutez les scripts **dans l'ordre** :

#### 3.1. Créer les tables
```sql
-- Copiez et exécutez le contenu de: supabase/01_create_tables.sql
```

#### 3.2. Créer les fonctions
```sql
-- Copiez et exécutez le contenu de: supabase/02_create_functions.sql
```

#### 3.3. Créer les policies RLS
```sql
-- Copiez et exécutez le contenu de: supabase/03_create_rls_policies.sql
```

#### 3.4. Insérer les données initiales
```sql
-- Copiez et exécutez le contenu de: supabase/04_seed_data.sql
```

### Étape 4 : Configurer le Storage

1. Allez dans **Storage** → **Create bucket**
2. Nom du bucket : `product-images`
3. **Public bucket** : ✅ OUI
4. File size limit : 5MB (ou selon vos besoins)
5. Allowed MIME types : `image/*`
6. Cliquez sur **Create bucket**

#### 4.1. Configurer les policies de storage

Allez dans **Storage** → **product-images** → **Policies** et créez :

**Policy 1 : Admins can upload images**
- Policy name: `Admins can upload images`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- USING expression: `is_admin(auth.uid())`
- WITH CHECK expression: `is_admin(auth.uid())`

**Policy 2 : Admins can delete images**
- Policy name: `Admins can delete images`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- USING expression: `is_admin(auth.uid())`

**Policy 3 : Public read access**
- Policy name: `Public read access`
- Allowed operation: `SELECT`
- Target roles: `anon`, `authenticated`
- USING expression: `true`

### Étape 5 : Créer votre premier utilisateur admin

1. Créez un compte dans votre application (page de login)
2. Une fois le compte créé, allez dans **SQL Editor** et exécutez :

```sql
-- Remplacer 'votre-email@example.com' par l'email de votre compte
SELECT create_admin_profile('votre-email@example.com', 'Votre Nom');
```

### Étape 6 : Configurer l'authentification

Dans **Authentication** → **Settings** :

1. **Site URL** : `http://localhost:8080` (ou votre URL de production)
2. **Redirect URLs** : Ajoutez :
   - `http://localhost:8080/**`
   - `https://votre-domaine.com/**` (si en production)

3. **Email confirmation** : 
   - Pour le développement : Désactivez temporairement
   - Pour la production : Activez

### Étape 7 : Vérifier l'installation

Exécutez ces requêtes dans le SQL Editor pour vérifier :

```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Vérifier les profils
SELECT * FROM profiles;

-- Vérifier les marques
SELECT COUNT(*) as total_brands FROM brands;

-- Vérifier les catégories
SELECT COUNT(*) as total_categories FROM utility_categories;

-- Vérifier les fonctions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';
```

## ✅ Vérification Finale

1. ✅ Tables créées : `profiles`, `products`, `brands`, `utility_categories`
2. ✅ Fonctions créées : `is_admin()`, `is_vendeur()`, `create_admin_profile()`, etc.
3. ✅ RLS activé sur toutes les tables
4. ✅ Bucket `product-images` créé et public
5. ✅ Premier utilisateur admin créé
6. ✅ Variables d'environnement configurées

## 🚀 Démarrer l'application

```bash
# Installer les dépendances (si pas déjà fait)
pnpm install

# Démarrer le serveur de développement
pnpm dev
```

## 📚 Scripts SQL Disponibles

- `01_create_tables.sql` : Crée toutes les tables
- `02_create_functions.sql` : Crée les fonctions utilitaires
- `03_create_rls_policies.sql` : Configure les policies RLS
- `04_seed_data.sql` : Insère les marques et catégories
- `05_setup_storage.sql` : Guide pour configurer le storage

## 🔧 Commandes Utiles

### Créer un admin
```sql
SELECT create_admin_profile('email@example.com', 'Nom Complet');
```

### Créer un vendeur
```sql
SELECT create_vendeur_profile('email@example.com', 'Nom Complet');
```

### Voir tous les utilisateurs avec leurs profils
```sql
SELECT * FROM get_users_with_profiles();
```

### Vérifier le rôle d'un utilisateur
```sql
SELECT get_user_role('user-id-here'::uuid);
```

## 🐛 Dépannage

### Erreur "relation does not exist"
- Vérifiez que vous avez exécuté `01_create_tables.sql` en premier

### Erreur "function does not exist"
- Vérifiez que vous avez exécuté `02_create_functions.sql`

### Erreur "permission denied"
- Vérifiez que les policies RLS sont créées (`03_create_rls_policies.sql`)
- Vérifiez que votre utilisateur a un profil avec le rôle `admin`

### Images ne s'affichent pas
- Vérifiez que le bucket `product-images` est public
- Vérifiez les policies de storage

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :
1. Les logs dans la console du navigateur
2. Les logs dans Supabase Dashboard → Logs
3. Les policies RLS dans Supabase Dashboard → Authentication → Policies

