# 🔧 Dépannage CORS sur Vercel - Guide Complet

Guide étape par étape pour résoudre les problèmes CORS sur Vercel.

---

## 🚨 Symptômes

- Erreur dans la console : `Access to fetch at '...' has been blocked by CORS policy`
- Les requêtes vers Supabase échouent
- L'application ne charge pas les données
- Erreur : `No 'Access-Control-Allow-Origin' header is present`

---

## ✅ Checklist de Vérification

### 1. Redirect URLs dans Supabase

**Étape 1 : Accéder à la configuration**

1. Allez sur [supabase.com](https://supabase.com)
2. Ouvrez votre projet Supabase
3. Allez dans **Authentication** → **URL Configuration**

**Étape 2 : Configurer le Site URL**

```
Site URL: https://votre-app.vercel.app
```

**Étape 3 : Configurer les Redirect URLs**

Ajoutez **une URL par ligne** :

```
https://votre-app.vercel.app/**
https://votre-app.vercel.app/callback
https://votre-app.vercel.app/auth/callback
http://localhost:5173/**
http://localhost:8080/**
```

**Important :**
- Remplacez `votre-app.vercel.app` par votre URL Vercel réelle
- Le `**` à la fin permet toutes les sous-routes
- Cliquez sur **"Save"**
- Attendez 1-2 minutes pour que les changements prennent effet

---

### 2. Variables d'Environnement sur Vercel

**Étape 1 : Vérifier les variables**

1. Allez dans [vercel.com](https://vercel.com)
2. Ouvrez votre projet
3. Allez dans **Settings** → **Environment Variables**

**Étape 2 : Vérifier que vous avez ces 3 variables**

```
VITE_SUPABASE_URL = https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_OFFLINE_MODE = false
```

**Étape 3 : Vérifier les environnements**

- ✅ Cochez **Production**
- ✅ Cochez **Preview** (optionnel mais recommandé)
- ✅ Cochez **Development** (optionnel)

**Étape 4 : Redéployer**

Après avoir modifié les variables, **redéployez** :
- Allez dans **Deployments**
- Cliquez sur **"..."** → **"Redeploy"**

---

### 3. Vérifier le Projet Supabase

**Important :** Assurez-vous que :

1. **Le projet Supabase est actif** (pas en pause)
   - Si en pause, cliquez sur "Resume"

2. **Vous utilisez le bon projet**
   - Les variables sur Vercel doivent pointer vers le **même projet** que celui où vous avez configuré les Redirect URLs
   - Si vous avez un projet de production séparé, configurez les Redirect URLs dans **ce projet**

3. **Les clés API sont correctes**
   - `VITE_SUPABASE_URL` = Project URL (pas l'API URL)
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = anon public key (pas la service_role key)

---

### 4. Vérifier les Logs Vercel

**Étape 1 : Accéder aux logs**

1. Allez dans Vercel Dashboard → Votre projet
2. Cliquez sur **Deployments**
3. Cliquez sur le dernier déploiement

**Étape 2 : Vérifier**

- ✅ Le build a réussi
- ✅ Aucune erreur dans les logs
- ✅ Les variables d'environnement sont bien chargées

---

### 5. Tester la Configuration

**Étape 1 : Ouvrir la console du navigateur**

1. Ouvrez votre site Vercel
2. Appuyez sur **F12** pour ouvrir les DevTools
3. Allez dans l'onglet **Console**

**Étape 2 : Vérifier les erreurs**

- ❌ Si vous voyez des erreurs CORS → Continuez avec les étapes suivantes
- ✅ Si pas d'erreurs CORS → Le problème est ailleurs

**Étape 3 : Vérifier les requêtes réseau**

1. Allez dans l'onglet **Network**
2. Rechargez la page
3. Cherchez les requêtes vers Supabase (filtrez par "supabase")
4. Vérifiez :
   - ✅ Status code : 200 ou 201 (succès)
   - ❌ Status code : CORS error ou 403 → Problème de configuration

---

## 🔍 Diagnostic Avancé

### Vérifier l'URL Supabase dans le Build

Les variables d'environnement sont intégrées au moment du build. Vérifiez qu'elles sont correctes :

1. **Dans Vercel** → **Deployments** → Cliquez sur un déploiement
2. **Vérifiez les logs de build** pour voir si les variables sont chargées
3. **Ouvrez votre site** → Console → Vérifiez les logs :
   ```
   ✅ Mode ONLINE : Connexion à Supabase https://...
   ```

### Tester avec curl

Testez si Supabase répond correctement :

```bash
curl -I https://votre-projet.supabase.co/rest/v1/products
```

Vous devriez voir des headers CORS dans la réponse.

---

## 🛠️ Solutions Spécifiques

### Solution 1 : Projet Supabase en Pause

**Symptôme :** Toutes les requêtes échouent

**Solution :**
1. Allez dans Supabase Dashboard
2. Si vous voyez "Project paused", cliquez sur **"Resume"**
3. Attendez que le projet redémarre
4. Testez à nouveau

### Solution 2 : Mauvais Projet Supabase

**Symptôme :** Les Redirect URLs sont configurées mais ça ne fonctionne pas

**Solution :**
1. Vérifiez que `VITE_SUPABASE_URL` sur Vercel correspond au projet où vous avez configuré les Redirect URLs
2. Si vous utilisez un projet de production, configurez les Redirect URLs dans **ce projet**

### Solution 3 : Variables d'Environnement Non Chargées

**Symptôme :** Erreur "Missing Supabase environment variables"

**Solution :**
1. Vérifiez que les variables sont bien définies sur Vercel
2. Vérifiez qu'elles sont activées pour "Production"
3. Redéployez après avoir modifié les variables

### Solution 4 : Redirect URLs Mal Configurées

**Symptôme :** Erreur CORS uniquement pour l'authentification

**Solution :**
1. Vérifiez que l'URL Vercel est exactement la même dans :
   - Site URL
   - Redirect URLs
   - Variables d'environnement
2. Utilisez `https://` (pas `http://`) pour la production
3. Ajoutez les variantes avec et sans trailing slash

---

## 📝 Exemple de Configuration Correcte

### Dans Supabase (Authentication → URL Configuration)

```
Site URL:
https://cleanexpress.vercel.app

Redirect URLs:
https://cleanexpress.vercel.app/**
https://cleanexpress.vercel.app/callback
https://cleanexpress.vercel.app/auth/callback
http://localhost:5173/**
http://localhost:8080/**
```

### Dans Vercel (Settings → Environment Variables)

```
VITE_SUPABASE_URL = https://fjfdcxviqmimxavqawoy.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_OFFLINE_MODE = false
```

**Environnements :** ✅ Production, ✅ Preview, ✅ Development

---

## 🚀 Après Avoir Corrigé

1. **Sauvegardez** les changements dans Supabase
2. **Attendez 1-2 minutes** pour que les changements prennent effet
3. **Redéployez** sur Vercel (si vous avez modifié les variables)
4. **Testez** votre site
5. **Vérifiez la console** pour confirmer qu'il n'y a plus d'erreurs CORS

---

## ❓ Questions Fréquentes

**Q : Dois-je configurer quelque chose dans Vercel pour le CORS ?**

R : Non, Vercel gère le CORS automatiquement. Le problème vient de la configuration Supabase.

**Q : Pourquoi ça fonctionne en local mais pas sur Vercel ?**

R : Parce que l'URL est différente. Vous devez ajouter l'URL Vercel dans les Redirect URLs de Supabase.

**Q : Combien de temps faut-il attendre après avoir modifié les Redirect URLs ?**

R : Généralement 1-2 minutes, mais parfois jusqu'à 5 minutes.

**Q : Dois-je redéployer sur Vercel après avoir modifié les Redirect URLs ?**

R : Non, pas nécessaire. Mais si vous avez modifié les variables d'environnement, oui.

---

## 🆘 Si Rien Ne Fonctionne

1. **Vérifiez les logs Vercel** pour voir les erreurs exactes
2. **Vérifiez la console du navigateur** pour voir les erreurs CORS détaillées
3. **Contactez le support Supabase** si le problème persiste
4. **Vérifiez la documentation Supabase** : [supabase.com/docs](https://supabase.com/docs)

---

**Dernière mise à jour** : 2024-01-16

