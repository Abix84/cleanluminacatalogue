# 🔐 Système de Rôles - CleanExpress

## 📋 Vue d'Ensemble

Le système de rôles permet de contrôler les accès à l'administration de l'application. Deux types de rôles sont disponibles :

- **ADMIN** : Accès complet à toutes les fonctionnalités
- **VENDEUR** : Accès en lecture seule (consultation uniquement)

---

## 🎯 Types de Rôles

### 1. ADMIN (Super-Administrateur)

**Permissions** :
- ✅ Accès complet à toutes les fonctionnalités
- ✅ Gérer les utilisateurs (créer, modifier, supprimer des rôles)
- ✅ Gérer les deux entreprises (CleanExpress et Lumina Distribution)
- ✅ Créer, modifier, supprimer des produits
- ✅ Gérer les marques et catégories
- ✅ Exporter les données
- ✅ Accès au diagnostic
- ✅ Tout modifier/supprimer

### 2. VENDEUR

**Permissions** :
- ✅ Accès en lecture seule
- ✅ Consulter le dashboard et les statistiques
- ✅ Voir les produits
- ✅ Voir les marques et catégories
- ❌ Ne peut rien modifier
- ❌ Ne peut pas ajouter/supprimer de produits
- ❌ Ne peut pas gérer les utilisateurs

---

## 🗄️ Structure de la Base de Données

### Table `user_roles`

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('ADMIN', 'VENDEUR')),
  company TEXT CHECK (company IN ('CleanExpress', 'Lumina Distribution', NULL)),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Champs

- `user_id` : ID de l'utilisateur (référence à `auth.users`)
- `role` : Rôle de l'utilisateur (`ADMIN` ou `VENDEUR`)
- `company` : Entreprise associée (optionnel, NULL = accès aux deux)

---

## 🚀 Installation

### Étape 1 : Créer la Structure

1. Exécutez le script `supabase/create_roles.sql` dans le SQL Editor de Supabase
2. Cela crée :
   - La table `user_roles`
   - Les fonctions helper (`get_user_role`, `is_admin`, `is_vendeur`)
   - Les policies RLS
   - Les fonctions de création (`create_admin`, `create_vendeur`)

### Étape 2 : Assigner des Rôles

Utilisez le script `supabase/assign_roles.sql` pour assigner des rôles aux utilisateurs.

**Exemples** :

```sql
-- Créer un admin pour CleanExpress
SELECT create_admin('admin@cleanexpress.com', 'CleanExpress');

-- Créer un vendeur pour Lumina Distribution
SELECT create_vendeur('vendeur@lumina.com', 'Lumina Distribution');
```

---

## 💻 Utilisation dans le Code

### Vérifier le Rôle d'un Utilisateur

```typescript
import { useAuth } from "@/context/AuthContext";

const MyComponent = () => {
  const { isAdmin, isVendeur, role, company } = useAuth();

  if (isAdmin) {
    // Code pour les admins
  }

  if (isVendeur) {
    // Code pour les vendeurs (lecture seule)
  }
};
```

### Protéger une Route

```typescript
import { RequireAdmin } from "@/components/admin/RequireAdmin";

const MyComponent = () => {
  return (
    <RequireAdmin>
      {/* Contenu visible uniquement par les admins */}
    </RequireAdmin>
  );
};
```

### Protéger une Action

```typescript
import { useAuth } from "@/context/AuthContext";

const handleAction = () => {
  const { isAdmin } = useAuth();
  
  if (!isAdmin) {
    toast.error("Vous n'avez pas les permissions nécessaires");
    return;
  }

  // Action réservée aux admins
};
```

---

## 🔒 Sécurité (RLS)

### Policies Automatiques

Les policies RLS sont configurées automatiquement :

- **Lecture publique** : Tous les utilisateurs authentifiés peuvent lire les produits, marques, catégories
- **Écriture** : Seuls les admins peuvent créer/modifier/supprimer

### Vérification Côté Client

La vérification côté client est effectuée dans :
- `AuthContext` : Récupération du rôle
- `RequireAdmin` : Composant de protection
- `AdminLayout` : Masquage des liens selon le rôle
- `Dashboard` : Masquage des boutons selon le rôle

### Vérification Côté Serveur

Les policies RLS garantissent que même si un utilisateur contourne le frontend, il ne peut pas modifier les données sans être admin.

---

## 📱 Interface Utilisateur

### Badge de Rôle

Le badge de rôle s'affiche dans la sidebar :
- 🔵 **ADMIN** : Badge bleu avec icône Shield
- 🟢 **VENDEUR** : Badge vert avec icône Eye

### Menu de Navigation

- **Dashboard** : Accessible à tous (Admin + Vendeur)
- **Gestion** : Admin uniquement
- **Utilisateurs** : Admin uniquement
- **Diagnostic** : Admin uniquement

### Actions

- **Boutons d'ajout/modification** : Masqués pour les vendeurs
- **Boutons de suppression** : Masqués pour les vendeurs
- **Export** : Admin uniquement

---

## 🔧 Gestion des Utilisateurs

### Interface Admin (`/admin/users`)

Les administrateurs peuvent :
- Voir tous les utilisateurs et leurs rôles
- Modifier le rôle d'un utilisateur
- Modifier l'entreprise associée
- Supprimer un rôle

### Fonctions SQL

#### Créer un Admin

```sql
SELECT create_admin('email@example.com', 'CleanExpress');
```

#### Créer un Vendeur

```sql
SELECT create_vendeur('email@example.com', 'Lumina Distribution');
```

#### Modifier un Rôle

```sql
UPDATE user_roles 
SET role = 'ADMIN', company = 'CleanExpress', updated_at = NOW()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'email@example.com');
```

#### Supprimer un Rôle

```sql
DELETE FROM user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'email@example.com');
```

---

## ⚠️ Mode Offline

En mode offline (`VITE_OFFLINE_MODE=true`) :
- ❌ Les rôles ne sont pas vérifiés
- ✅ Tous les utilisateurs ont accès complet (comme des admins)
- ✅ C'est normal car il n'y a pas de base de données

---

## 🐛 Dépannage

### L'utilisateur n'a pas de rôle

**Cause** : L'utilisateur n'a pas de rôle assigné dans la table `user_roles`

**Solution** : Assignez un rôle avec `create_admin()` ou `create_vendeur()`

### L'utilisateur ne peut pas accéder à l'admin

**Cause** : L'utilisateur n'est pas authentifié ou n'a pas de rôle

**Solution** :
1. Vérifiez que l'utilisateur est authentifié
2. Vérifiez qu'un rôle est assigné dans `user_roles`

### Les policies RLS bloquent les modifications

**Cause** : L'utilisateur n'est pas admin

**Solution** : Vérifiez que le rôle est bien `ADMIN` dans la table `user_roles`

---

## 📚 Références

- `supabase/create_roles.sql` : Script de création de la structure
- `supabase/assign_roles.sql` : Script pour assigner des rôles
- `src/context/AuthContext.tsx` : Gestion des rôles côté client
- `src/components/admin/RequireAdmin.tsx` : Composant de protection
- `src/pages/admin/Users.tsx` : Interface de gestion des utilisateurs

---

**Date de création** : 2025-01-XX
**Version** : 1.0.0

