# 🖼️ Guide de Dépannage - Images Produits

## 🔍 Problème Identifié

**Symptômes :**
- Les produits s'ajoutent correctement dans la base de données
- Les images ne s'affichent pas sur les cartes produits
- Le clic sur l'image ne l'agrandit pas
- L'image placeholder est affichée à la place

---

## 🎯 Solution Rapide

### Étape 1 : Utiliser l'Outil de Diagnostic

Nous avons créé un outil de diagnostic automatique pour identifier le problème :

1. **Connectez-vous à l'admin** : `/login`
2. **Allez sur le dashboard** : `/admin`
3. **Cliquez sur le bouton "Diagnostic"** (icône stéthoscope) en haut à droite
4. **Lancez le diagnostic complet**

L'outil va vérifier automatiquement :
- ✅ Connexion à Supabase
- ✅ Existence du bucket `product-images`
- ✅ Visibilité du bucket (public/privé)
- ✅ Permissions d'upload
- ✅ Test d'upload réel

### Étape 2 : Suivre les Instructions

L'outil de diagnostic vous donnera des instructions précises selon le problème détecté.

---

## 🛠️ Résolution Manuelle

### Problème 1 : Le bucket `product-images` n'existe pas

**Solution :**

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Sélectionnez votre projet
3. Cliquez sur **Storage** dans le menu latéral
4. Cliquez sur **"Create a new bucket"**
5. Configurez le bucket :
   ```
   Name: product-images
   ☑️ Public bucket
   ```
6. Cliquez sur **"Create bucket"**

---

### Problème 2 : Le bucket existe mais n'est pas public

**Solution :**

1. Dans Storage, cliquez sur le bucket `product-images`
2. Cliquez sur l'icône **Settings** (⚙️)
3. Activez **"Public bucket"**
4. Cliquez sur **"Save"**

---

### Problème 3 : Les permissions RLS bloquent l'upload

**Solution A : Désactiver RLS sur le Storage (Développement uniquement)**

1. Allez dans **Storage → Policies**
2. Pour le bucket `product-images`, vérifiez qu'il n'y a pas de policies restrictives

**Solution B : Configurer les bonnes policies (Production)**

Exécutez dans **SQL Editor** :

```sql
-- Permettre à tous de lire les images (bucket public)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Permettre aux utilisateurs authentifiés d'uploader
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Permettre aux utilisateurs authentifiés de mettre à jour
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- Permettre aux utilisateurs authentifiés de supprimer
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

---

### Problème 4 : Les variables d'environnement sont incorrectes

**Vérification :**

1. Vérifiez que le fichier `.env` existe à la racine du projet
2. Vérifiez que les variables sont correctes :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **Important** : Redémarrez le serveur après modification du `.env`

```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
pnpm dev
```

---

## 🔬 Tests Manuels

### Test 1 : Vérifier l'URL d'une image

1. Ajoutez un produit avec une image
2. Ouvrez la console du navigateur (F12)
3. Regardez les erreurs réseau (onglet Network)
4. Cherchez les requêtes d'images qui échouent (404, 403, etc.)

### Test 2 : Vérifier l'upload dans Supabase

1. Allez dans Supabase → Storage → product-images
2. Vérifiez si les fichiers apparaissent après l'ajout d'un produit
3. Si oui, le problème est avec l'affichage
4. Si non, le problème est avec l'upload

### Test 3 : Tester une URL d'image directement

1. Dans Supabase Storage, copiez l'URL publique d'une image
2. Collez-la dans un nouvel onglet du navigateur
3. Si l'image ne s'affiche pas, le bucket n'est pas public ou l'URL est incorrecte

---

## 📊 Checklist Complète

### Configuration Supabase

- [ ] Le projet Supabase existe et est accessible
- [ ] Le bucket `product-images` est créé
- [ ] Le bucket est marqué comme **Public**
- [ ] Les policies RLS permettent l'upload aux utilisateurs authentifiés
- [ ] Les policies RLS permettent la lecture publique

### Configuration Application

- [ ] Le fichier `.env` existe
- [ ] Les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` sont définies
- [ ] Le serveur de développement a été redémarré après modification de `.env`
- [ ] L'authentification fonctionne (vous pouvez vous connecter à `/login`)

### Tests Fonctionnels

- [ ] L'outil de diagnostic passe tous les tests
- [ ] Un produit peut être ajouté
- [ ] L'image apparaît dans Supabase Storage
- [ ] L'URL publique de l'image est accessible dans le navigateur
- [ ] L'image s'affiche sur la carte produit
- [ ] Le clic sur l'image l'agrandit en modal

---

## 🐛 Problèmes Communs et Solutions

### "Bucket not found"

**Cause :** Le bucket `product-images` n'existe pas

**Solution :** Créez le bucket (voir Problème 1 ci-dessus)

---

### "403 Forbidden"

**Cause :** Le bucket existe mais n'est pas public, ou les permissions RLS bloquent l'accès

**Solution :** 
1. Rendez le bucket public (voir Problème 2)
2. Configurez les policies RLS (voir Problème 3)

---

### "The resource you are looking for could not be found"

**Cause :** L'URL de l'image est incorrecte

**Solution :**
1. Vérifiez que le bucket s'appelle exactement `product-images` (sans majuscule, avec tiret)
2. Vérifiez dans le code que `BUCKET_NAME` est correct :

```typescript
// src/context/ProductContext.tsx
const BUCKET_NAME = "product-images"; // Doit correspondre exactement au nom du bucket
```

---

### "Invalid JWT" ou "Missing Authorization"

**Cause :** Les variables d'environnement sont incorrectes ou le serveur n'a pas été redémarré

**Solution :**
1. Vérifiez le fichier `.env`
2. Vérifiez que les variables commencent par `VITE_`
3. Redémarrez le serveur : `pnpm dev`

---

### Les images s'uploadent mais ne s'affichent pas

**Cause :** Le bucket n'est pas public

**Solution :**
1. Rendez le bucket public dans Supabase
2. Pour les images déjà uploadées, elles seront automatiquement accessibles une fois le bucket public

---

## 📸 Exemple de Configuration Correcte

### Structure Supabase Storage

```
Storage
└── product-images (Public)
    ├── abc123-produit1.jpg
    ├── def456-produit2.png
    └── ghi789-produit3.webp
```

### Exemple d'URL Publique

```
https://fjfdcxviqmimxavqawoy.supabase.co/storage/v1/object/public/product-images/abc123-produit1.jpg
```

L'URL doit contenir :
- Votre URL Supabase
- `/storage/v1/object/public/`
- Le nom du bucket (`product-images`)
- Le nom du fichier

---

## 🔄 Workflow Complet d'Upload

Voici ce qui se passe quand vous ajoutez un produit avec une image :

1. **Frontend** : L'utilisateur sélectionne un fichier dans le formulaire
2. **ProductContext** : La fonction `addProduct()` est appelée
3. **Upload** : Si `image_url` est un `File`, `uploadImage()` est appelée
4. **Supabase Storage** : Le fichier est uploadé dans le bucket `product-images`
5. **URL Publique** : Supabase génère l'URL publique du fichier
6. **Base de données** : Le produit est inséré avec l'URL de l'image
7. **Affichage** : Le produit apparaît dans la liste avec son image

### Points de Vérification

À chaque étape, vous pouvez vérifier :

**Étape 1-2** : Console du navigateur (logs)
```javascript
console.log("File selected:", file);
```

**Étape 3-4** : Network tab (F12) → Vérifiez la requête POST vers Storage

**Étape 5** : Console → Vérifiez l'URL générée
```javascript
console.log("Public URL:", publicUrl);
```

**Étape 6** : Supabase Dashboard → Table `products` → Vérifiez `image_url`

**Étape 7** : Inspectez l'élément `<img>` dans le navigateur

---

## 💡 Astuce : Activer les Logs

Pour débugger plus facilement, ajoutez des logs dans `ProductContext.tsx` :

```typescript
const uploadImage = async (file: File): Promise<string | null> => {
  try {
    console.log("📤 Upload started:", file.name);
    const fileName = `${uuidv4()}-${file.name}`;
    console.log("📝 Generated filename:", fileName);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file);

    if (uploadError) {
      console.error("❌ Upload error:", uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    console.log("✅ Public URL:", data.publicUrl);
    return data.publicUrl;
  } catch (err) {
    console.error("💥 Upload failed:", err);
    // ...
  }
};
```

---

## 🎓 Ressources

- [Documentation Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Debugging Storage Issues](https://supabase.com/docs/guides/storage/debugging)

---

## ✅ Validation Finale

Une fois tout configuré, testez avec cette checklist :

1. **Ajout** : Ajoutez un nouveau produit avec une image
2. **Vérification Supabase** : L'image apparaît dans Storage
3. **Vérification URL** : L'URL publique fonctionne dans le navigateur
4. **Affichage** : L'image s'affiche sur la carte produit
5. **Modal** : Le clic agrandit l'image
6. **Modification** : Modifier le produit et changer l'image fonctionne
7. **Suppression** : L'image est supprimée de Storage quand le produit est supprimé

---

## 🆘 Besoin d'Aide ?

Si le problème persiste après avoir suivi ce guide :

1. **Utilisez l'outil de diagnostic** : `/admin/diagnostic`
2. **Vérifiez la console** : F12 → Console (pour les erreurs JS)
3. **Vérifiez le network** : F12 → Network (pour les erreurs HTTP)
4. **Vérifiez Supabase Dashboard** : Storage et Logs

---

**Dernière mise à jour** : 2024-01-16  
**Version** : 2.0.0