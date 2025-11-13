# ⚡ Démarrage Rapide - Base de Données

## 🎯 Installation en 3 Étapes

### Étape 1 : Ouvrir SQL Editor
1. Connectez-vous à Supabase
2. Cliquez sur **SQL Editor** dans le menu
3. Cliquez sur **New query**

### Étape 2 : Copier-Coller le Script
1. Ouvrez `supabase/seed_data.sql`
2. **Copiez tout le contenu** (Ctrl+A, Ctrl+C)
3. **Collez** dans l'éditeur SQL (Ctrl+V)

### Étape 3 : Exécuter
1. Cliquez sur **Run** (ou Ctrl+Enter)
2. Attendez quelques secondes
3. Vérifiez les résultats en bas de l'écran

## ✅ Résultats Attendus

Après l'exécution, vous devriez voir :
- ✅ **28 marques** créées
- ✅ **67 catégories** créées
- ✅ **3 tables** créées (brands, utility_categories, products)
- ✅ **RLS activé** (sécurité)

## 🔍 Vérification

Dans l'application :
```
http://localhost:5173/admin/management
```

Vous devriez voir toutes les marques et catégories !

## ⚠️ Important

- Le script fonctionne sur une **base vide**
- Il crée **automatiquement** toutes les tables
- Vous pouvez l'exécuter **plusieurs fois** sans problème
- Les doublons sont **automatiquement évités**

## 🐛 Problème ?

Si vous avez une erreur :
1. Vérifiez que vous êtes connecté à Supabase
2. Vérifiez que vous avez copié **tout** le script
3. Ré-exécutez depuis le début

---

**C'est tout ! 🎉**

