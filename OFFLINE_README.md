# 🔌 Mode Offline - CleanExpress

## ✨ Votre application fonctionne maintenant 100% OFFLINE !

Toutes vos données sont stockées localement dans votre navigateur. **Aucune connexion internet requise.**

---

## 🚀 Démarrage Ultra-Rapide

### 1. Vérifier le Mode

Votre fichier `.env` doit contenir :

```env
VITE_OFFLINE_MODE=true
```

✅ **C'est déjà configuré !**

### 2. Démarrer l'Application

```bash
pnpm dev
```

### 3. Accéder à l'Application

Ouvrez : **http://localhost:5173**

### 4. Accéder à l'Admin

**Pas de login en mode offline !**

Allez directement sur : **http://localhost:5173/admin**

---

## ✅ Ce qui Fonctionne

- ✅ Ajouter/modifier/supprimer des produits
- ✅ Upload d'images (stockées en base64)
- ✅ Gérer les catégories et marques
- ✅ Filtres et recherche
- ✅ Export des données en JSON
- ✅ Données persistantes (ne disparaissent pas au rechargement)

## ❌ Ce qui Ne Fonctionne Pas

- ❌ Authentification (désactivée)
- ❌ Synchronisation multi-appareils
- ❌ Sauvegarde cloud
- ❌ Accès depuis internet

---

## 💾 Stockage des Données

### Où sont mes données ?

Dans le **localStorage** de votre navigateur (Chrome, Firefox, etc.)

### Capacité

- **~5-10 MB** selon le navigateur
- **Recommandé** : Max 50-100 produits avec images

### Les données persistent si...

- ✅ Vous rechargez la page
- ✅ Vous fermez/rouvrez le navigateur
- ✅ Vous redémarrez l'ordinateur

### Les données DISPARAISSENT si...

- ❌ Vous videz le cache du navigateur
- ❌ Vous utilisez la navigation privée
- ❌ Vous changez de navigateur

**🔥 IMPORTANT : SAUVEGARDEZ VOS DONNÉES RÉGULIÈREMENT !**

---

## 💡 Utilisation

### Ajouter un Produit

1. `/admin` → Bouton **"Ajouter"**
2. Remplir le formulaire
3. Uploader une image (optionnel)
4. Sauvegarder

### Sauvegarder vos Données

1. `/admin` → Bouton **"Exporter"**
2. Téléchargez le fichier JSON
3. **Conservez-le précieusement !**

**Fréquence recommandée** : Après chaque session de travail

### Optimiser les Images

**Avant upload** :
- Redimensionner : 800x800 px max
- Compresser : Qualité 70-80%
- Format : JPEG
- Poids : < 200 KB

**Outils** : [TinyPNG](https://tinypng.com), [Squoosh](https://squoosh.app)

---

## 🔄 Passer en Mode Online (Plus Tard)

Quand vous serez prêt à utiliser Supabase :

### 1. Exporter vos données
```bash
/admin → Exporter → Sauvegarder le JSON
```

### 2. Modifier .env
```env
# Désactiver le mode offline
VITE_OFFLINE_MODE=false

# Ajouter vos clés Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle
```

### 3. Redémarrer
```bash
pnpm dev
```

### 4. Configurer Supabase
- Créer le bucket `product-images`
- Activer RLS
- Importer vos données (manuellement pour l'instant)

**Guide complet** : Voir `HYBRID_MODE_QUICKSTART.md`

---

## 🐛 Problèmes Courants

### "localStorage is full"

**Solution** :
- Supprimer des produits inutiles
- Compresser les images
- Réinitialiser les données

### "Mes données ont disparu"

**Cause** : Cache vidé

**Solution** :
- Importer votre dernière sauvegarde JSON
- Exporter plus régulièrement à l'avenir

### "L'image ne s'affiche pas"

**Solution** :
- Compresser l'image (< 200 KB)
- Utiliser format JPEG
- Redimensionner (800x800 max)

---

## 🧹 Réinitialiser l'Application

### Console du navigateur (F12)

```javascript
localStorage.clear();
location.reload();
```

Les données de démonstration seront recréées.

---

## 📚 Documentation Complète

- **OFFLINE_MODE_GUIDE.md** : Guide détaillé (469 lignes)
- **README.md** : Documentation générale
- **HYBRID_MODE_QUICKSTART.md** : Basculer vers le mode online

---

## ✅ Checklist

### Avant de Commencer
- [x] Mode offline activé dans `.env`
- [x] Application démarre avec `pnpm dev`
- [x] Accès à `/admin` sans login

### Utilisation Quotidienne
- [ ] Ajouter vos produits
- [ ] Tester l'affichage
- [ ] Exporter vos données (backup)

### Avant de Fermer
- [ ] Exporter les données
- [ ] Vérifier que tout est sauvegardé
- [ ] Conserver le fichier JSON

---

## 🎉 C'est Tout !

Vous êtes prêt à utiliser CleanExpress en mode offline !

**Commandes** :
```bash
pnpm dev              # Démarrer
```

**URLs** :
- Catalogue : http://localhost:5173
- Admin : http://localhost:5173/admin

**N'oubliez pas** : Exportez vos données régulièrement ! 💾

---

**Version** : Mode Offline 1.0  
**Dernière mise à jour** : 2024-01-16

**🔌 Profitez de votre application 100% offline !**