# 🚀 Déploiement de la Edge Function create-user

## 📋 Vue d'ensemble

La fonction `create-user` permet aux administrateurs de créer des comptes utilisateurs directement depuis le dashboard.

## 🎯 Méthode 1 : Via Supabase CLI (Recommandé)

### Étape 1 : Installer Supabase CLI

```bash
npm install -g supabase
```

### Étape 2 : Se connecter

```bash
supabase login
```

### Étape 3 : Lier votre projet

```bash
# Trouvez votre project ref dans Supabase Dashboard → Settings → General
supabase link --project-ref votre-project-ref
```

### Étape 4 : Déployer la fonction

```bash
supabase functions deploy create-user
```

## 🎯 Méthode 2 : Via le Dashboard Supabase

1. Allez dans **Edge Functions** dans le menu de gauche
2. Cliquez sur **Create a new function**
3. Nom : `create-user`
4. Copiez le contenu de `supabase/functions/create-user/index.ts`
5. Collez dans l'éditeur
6. Cliquez sur **Deploy**

## ✅ Vérification

Après le déploiement, la fonction devrait être disponible à :
```
https://votre-projet.supabase.co/functions/v1/create-user
```

## 🔧 Variables d'environnement

La fonction utilise automatiquement :
- `SUPABASE_URL` : Disponible automatiquement
- `SUPABASE_SERVICE_ROLE_KEY` : Disponible automatiquement

Aucune configuration supplémentaire n'est nécessaire.

## 🧪 Test

Une fois déployée, testez depuis le dashboard :
1. Allez dans `/admin/users`
2. Cliquez sur "Ajouter un utilisateur"
3. Remplissez le formulaire
4. Cliquez sur "Ajouter"

Si tout fonctionne, vous verrez un message de succès et l'utilisateur apparaîtra dans la liste.

## 🐛 Dépannage

### Erreur "Edge Function returned a non-2xx status code"

Cette erreur peut avoir plusieurs causes. **Consultez le guide complet** : `supabase/functions/create-user/TROUBLESHOOTING.md`

**Vérifications rapides** :

1. **Vérifiez les logs** : Dashboard → Edge Functions → create-user → Logs
2. **Vérifiez que vous êtes admin** :
   ```sql
   SELECT * FROM profiles WHERE id = auth.uid();
   ```
3. **Testez manuellement** dans la console du navigateur (voir TROUBLESHOOTING.md)

### Erreur "Function not found"
- Vérifiez que la fonction est bien déployée
- Vérifiez le nom de la fonction (doit être exactement `create-user`)

### Erreur "Permission denied" ou 403
- Vérifiez que vous êtes connecté en tant qu'admin
- Vérifiez que votre profil a le rôle `admin` :
  ```sql
  SELECT create_admin_profile('votre-email@example.com', 'Votre Nom');
  ```

### Erreur "Invalid JWT" ou 401
- Vérifiez que vous êtes bien connecté
- Reconnectez-vous si nécessaire
- Vérifiez que le token est bien envoyé (normalement automatique)

