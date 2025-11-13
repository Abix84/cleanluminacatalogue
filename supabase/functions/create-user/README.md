# Edge Function : create-user

Cette fonction permet aux administrateurs de créer des comptes utilisateurs (admin ou vendeur) directement depuis le dashboard.

## 🚀 Déploiement

### Option 1 : Via Supabase CLI (Recommandé)

```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Se connecter à votre projet
supabase login

# Lier votre projet
supabase link --project-ref votre-project-ref

# Déployer la fonction
supabase functions deploy create-user
```

### Option 2 : Via le Dashboard Supabase

1. Allez dans **Edge Functions** → **Create a new function**
2. Nom : `create-user`
3. Copiez le contenu de `index.ts` dans l'éditeur
4. Cliquez sur **Deploy**

## 🔧 Configuration

La fonction utilise automatiquement les variables d'environnement de Supabase :
- `SUPABASE_URL` : URL de votre projet
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role (automatiquement disponible)

## ✅ Vérification

Après le déploiement, testez la fonction :

```bash
# Via curl (remplacez les valeurs)
curl -X POST https://votre-projet.supabase.co/functions/v1/create-user \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "role": "vendeur"
  }'
```

## 🔒 Sécurité

- ✅ Vérifie que l'utilisateur est authentifié
- ✅ Vérifie que l'utilisateur est admin
- ✅ Valide les données d'entrée
- ✅ Confirme automatiquement l'email de l'utilisateur créé

