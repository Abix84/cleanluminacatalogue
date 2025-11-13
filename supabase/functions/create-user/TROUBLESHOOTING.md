# 🔧 Dépannage - Edge Function create-user

## ❌ Erreur : "Edge Function returned a non-2xx status code"

Cette erreur indique que la fonction retourne un code d'erreur (400, 401, 403, 500, etc.). Suivez ces étapes pour identifier le problème :

## 🔍 Étapes de Diagnostic

### 1. Vérifier les logs de la fonction

1. Allez dans **Supabase Dashboard** → **Edge Functions** → **create-user**
2. Cliquez sur **Logs**
3. Regardez les erreurs récentes

Les logs vous indiqueront exactement où le problème se situe.

### 2. Vérifier que vous êtes connecté en tant qu'admin

**Dans la console du navigateur (F12)**, vérifiez :
```javascript
// Vérifiez votre session
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)

// Vérifiez votre profil
const { data: { user } } = await supabase.auth.getUser()
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()
console.log('Profile:', profile)
```

**Votre profil doit avoir `role: 'admin'`**

### 3. Vérifier que la fonction est bien déployée

1. Allez dans **Edge Functions** dans le Dashboard
2. Vérifiez que `create-user` apparaît dans la liste
3. Vérifiez que le statut est "Active"

### 4. Tester la fonction manuellement

**Dans la console du navigateur (F12)**, exécutez :

```javascript
const { data: { session } } = await supabase.auth.getSession()

const response = await fetch('https://VOTRE-PROJET.supabase.co/functions/v1/create-user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123456',
    full_name: 'Test User',
    role: 'vendeur'
  })
})

const data = await response.json()
console.log('Response status:', response.status)
console.log('Response data:', data)
```

## 🐛 Erreurs Courantes et Solutions

### Erreur 401 : "Missing authorization header" ou "Invalid token"

**Cause** : Le token d'authentification n'est pas envoyé correctement.

**Solution** :
- Vérifiez que vous êtes bien connecté
- Reconnectez-vous si nécessaire
- Vérifiez que `supabase.functions.invoke()` envoie automatiquement le token (c'est normalement le cas)

### Erreur 403 : "Seuls les administrateurs peuvent créer des utilisateurs"

**Cause** : Votre compte n'a pas le rôle `admin`.

**Solution** :
1. Vérifiez votre profil dans la base de données :
```sql
SELECT * FROM profiles WHERE id = 'VOTRE-USER-ID';
```

2. Si le rôle n'est pas `admin`, créez un admin :
```sql
-- Remplacez par votre email
SELECT create_admin_profile('votre-email@example.com', 'Votre Nom');
```

### Erreur 400 : "Email, mot de passe et rôle sont requis"

**Cause** : Les données ne sont pas envoyées correctement.

**Solution** :
- Vérifiez que tous les champs sont remplis dans le formulaire
- Vérifiez les logs dans la console du navigateur

### Erreur 400 : "User already registered"

**Cause** : L'email existe déjà dans Supabase Auth.

**Solution** :
- Utilisez un email différent
- Ou supprimez l'utilisateur existant dans **Authentication** → **Users**

### Erreur 500 : "Configuration error: Missing environment variables"

**Cause** : Les variables d'environnement ne sont pas configurées dans Supabase.

**Solution** :
- Les variables `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont normalement automatiques
- Si le problème persiste, redéployez la fonction

### Erreur 400 : "Erreur lors de la création du profil"

**Cause** : Problème avec la table `profiles` ou les policies RLS.

**Solution** :
1. Vérifiez que la table `profiles` existe :
```sql
SELECT * FROM profiles LIMIT 1;
```

2. Vérifiez les policies RLS :
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

3. Si nécessaire, réexécutez le script `03_create_rls_policies.sql`

## 📋 Checklist de Vérification

- [ ] La fonction `create-user` est déployée et active
- [ ] Vous êtes connecté en tant qu'admin (vérifiez dans `/admin/users`)
- [ ] Votre profil a le rôle `admin` dans la table `profiles`
- [ ] La table `profiles` existe et a les bonnes colonnes
- [ ] Les policies RLS sont configurées correctement
- [ ] L'email que vous essayez de créer n'existe pas déjà
- [ ] Le mot de passe fait au moins 6 caractères

## 🔄 Redéployer la Fonction

Si le problème persiste, redéployez la fonction :

**Via CLI** :
```bash
supabase functions deploy create-user
```

**Via Dashboard** :
1. Allez dans **Edge Functions** → **create-user**
2. Cliquez sur **Edit**
3. Vérifiez le code
4. Cliquez sur **Deploy**

## 📞 Obtenir Plus d'Aide

Si le problème persiste :

1. **Vérifiez les logs** dans Supabase Dashboard → Edge Functions → create-user → Logs
2. **Vérifiez la console du navigateur** (F12) pour les erreurs côté client
3. **Testez manuellement** avec la commande `fetch()` ci-dessus
4. **Vérifiez votre profil admin** avec la requête SQL ci-dessus

Les logs vous donneront le message d'erreur exact qui vous aidera à identifier le problème.

