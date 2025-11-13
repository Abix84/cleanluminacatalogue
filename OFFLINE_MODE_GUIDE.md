# 🔌 Guide du Mode Offline - CleanExpress

## 📋 Vue d'Ensemble

Votre application **CleanExpress** fonctionne maintenant en **mode 100% offline** ! 

Toutes les données sont stockées localement dans votre navigateur (localStorage). Aucune connexion internet n'est requise.

---

## ✨ Fonctionnalités Disponibles en Mode Offline

### ✅ Ce qui Fonctionne

- ✅ **Gestion complète des produits** (CRUD)
  - Ajouter des produits
  - Modifier des produits
  - Supprimer des produits
  - Afficher le catalogue

- ✅ **Gestion des images**
  - Upload d'images (stockées en base64)
  - Affichage des images
  - Zoom sur les images

- ✅ **Gestion des catégories**
  - Ajouter/modifier/supprimer des catégories d'utilité
  - Assigner des couleurs

- ✅ **Gestion des marques**
  - Ajouter/modifier/supprimer des marques
  - Associer aux produits

- ✅ **Filtres et recherche**
  - Recherche par nom
  - Filtrage par catégorie
  - Filtrage par marque
  - Tri (prix, nom)

- ✅ **Export des données**
  - Téléchargement JSON de toutes vos données

### ❌ Ce qui Ne Fonctionne Pas

- ❌ **Authentification** (pas de login requis en mode offline)
- ❌ **Synchronisation multi-appareils**
- ❌ **Sauvegarde cloud**
- ❌ **Collaboration en temps réel**

---

## 🚀 Démarrage Rapide

### 1. Vérifier le Mode

Votre fichier `.env` doit contenir :

```env
VITE_OFFLINE_MODE=true
```

### 2. Démarrer l'Application

```bash
pnpm dev
```

### 3. Accéder à l'Application

Ouvrez votre navigateur sur : **http://localhost:5173**

### 4. Données de Démonstration

Au premier lancement, l'application crée automatiquement :
- 4 catégories d'utilité
- 3 marques
- 3 produits de démonstration

---

## 💾 Comment Fonctionne le Stockage

### localStorage

Toutes les données sont stockées dans le **localStorage** de votre navigateur :

```
localStorage
├── cleanexpress_products       → Liste des produits
├── cleanexpress_brands         → Liste des marques
├── cleanexpress_categories     → Liste des catégories
├── cleanexpress_images         → Images en base64
└── cleanexpress_version        → Version des données
```

### Capacité de Stockage

- **localStorage** : ~5-10 MB selon le navigateur
- **Recommandé** : Max 50-100 produits avec images
- **Attention** : Les images grandes tailles consomment beaucoup d'espace

### Persistance des Données

✅ **Les données PERSISTENT** :
- Entre les rechargements de page
- Entre les sessions de navigateur
- Après redémarrage de l'ordinateur

❌ **Les données DISPARAISSENT si** :
- Vous videz le cache du navigateur
- Vous utilisez le mode navigation privée
- Vous désinstallez le navigateur
- Vous changez de navigateur/ordinateur

---

## 🎯 Utilisation

### Accéder à l'Admin

En mode offline, **pas besoin de login** !

Accédez directement à : **http://localhost:5173/admin**

### Ajouter un Produit

1. Cliquez sur **"Ajouter"** dans le dashboard
2. Remplissez le formulaire
3. Uploadez une image (optionnel)
4. Sauvegardez

L'image sera convertie en **base64** et stockée localement.

### Gérer les Catégories et Marques

Dans le dashboard admin, utilisez les managers :
- **UtilityCategoryManager** : Gérer les catégories
- **BrandManager** : Gérer les marques

---

## 💡 Conseils d'Utilisation

### Images

**Optimisez vos images AVANT upload** :
- Taille recommandée : 800x800 pixels max
- Format : JPEG (plus léger que PNG)
- Compression : Qualité 70-80%
- Poids : < 200 KB par image

**Outils de compression** :
- [TinyPNG](https://tinypng.com)
- [Squoosh](https://squoosh.app)
- Photoshop "Save for Web"

### Sauvegarde Régulière

**IMPORTANT** : Exportez vos données régulièrement !

1. Allez dans **Dashboard Admin**
2. Cliquez sur **"Exporter"**
3. Téléchargez le fichier JSON
4. Conservez-le en lieu sûr

**Fréquence recommandée** : Après chaque session de travail

### Limites

- **Max 50-100 produits** avec images
- **Ne pas uploader de vidéos** ou fichiers très lourds
- **Tester régulièrement** l'espace restant dans localStorage

---

## 🔄 Exporter / Importer des Données

### Exporter (Sauvegarde)

```bash
# Dans l'application :
1. /admin → Bouton "Exporter"
2. Fichier téléchargé : cleanexpress_backup_YYYY-MM-DD.json
```

Le fichier contient :
- Tous les produits
- Toutes les catégories
- Toutes les marques
- Version des données

**Note** : Les images en base64 sont incluses !

### Importer (Restauration)

**Actuellement** : Fonctionnalité à développer

**Workaround manuel** :
1. Ouvrez la console du navigateur (F12)
2. Allez dans l'onglet "Application" → "Local Storage"
3. Importez manuellement les données

---

## 🧹 Réinitialiser les Données

### Méthode 1 : Console du Navigateur

```javascript
// Ouvrir la console (F12)
localStorage.clear();
location.reload();
```

Les données de démonstration seront recréées.

### Méthode 2 : Supprimer Manuellement

1. F12 → Application → Local Storage
2. Supprimer toutes les clés `cleanexpress_*`
3. Recharger la page

---

## 📊 Voir les Statistiques

### Dans la Console

```javascript
// Ouvrir la console (F12)
console.log('Produits:', JSON.parse(localStorage.getItem('cleanexpress_products')));
console.log('Marques:', JSON.parse(localStorage.getItem('cleanexpress_brands')));
console.log('Catégories:', JSON.parse(localStorage.getItem('cleanexpress_categories')));

// Taille totale utilisée
const totalSize = JSON.stringify(localStorage).length;
console.log('Espace utilisé:', (totalSize / 1024).toFixed(2), 'KB');
```

---

## 🌐 Passer en Mode Online (Futur)

### Quand Sera-t-il Temps ?

Passez en mode online (Supabase) quand :
- Vous voulez accéder depuis plusieurs appareils
- Vous voulez collaborer avec d'autres utilisateurs
- Vous avez besoin de sauvegardes cloud
- Vous voulez publier sur internet

### Comment Basculer ?

**Étape 1 : Exporter vos données**
```bash
# Dans l'app : Dashboard → Exporter
# Conservez le fichier JSON !
```

**Étape 2 : Configurer Supabase**
1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Créer les tables et le bucket
4. Récupérer les clés API

**Étape 3 : Modifier .env**
```env
# Passer en mode online
VITE_OFFLINE_MODE=false

# Ajouter vos clés Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_anon
```

**Étape 4 : Redémarrer**
```bash
pnpm dev
```

**Étape 5 : Migration des données**
- Fonctionnalité d'import à développer
- Ou ajouter manuellement depuis l'admin

---

## 🐛 Problèmes Courants

### "localStorage is full"

**Cause** : Trop de données (surtout images)

**Solution** :
1. Supprimer des produits inutiles
2. Compresser les images existantes
3. Exporter et réinitialiser

### "Les données ont disparu"

**Cause** : Cache du navigateur vidé

**Solution** :
1. Importer votre dernière sauvegarde JSON
2. À l'avenir, exporter régulièrement

### "L'image ne s'affiche pas"

**Cause** : Image trop grande ou format non supporté

**Solution** :
1. Compresser l'image
2. Utiliser format JPEG
3. Taille max : 500 KB

---

## ✅ Checklist d'Utilisation

### Quotidien

- [ ] Ajouter/modifier des produits
- [ ] Tester l'affichage dans le catalogue
- [ ] Vérifier que tout fonctionne

### Hebdomadaire

- [ ] Exporter les données (backup)
- [ ] Nettoyer les produits de test
- [ ] Vérifier l'espace localStorage

### Mensuel

- [ ] Archiver les anciennes sauvegardes
- [ ] Optimiser les images si nécessaire
- [ ] Évaluer si passage au mode online nécessaire

---

## 📚 Documentation Technique

### Structure des Données

```typescript
// Produit
interface Product {
  id: string;              // UUID
  name: string;
  description: string | null;
  price: number;
  image_url: string | null; // base64 data URL
  utilityCategoryId: string | null;
  brandId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Catégorie
interface UtilityCategory {
  id: string;
  name: string;
  color: string;           // Hex color
  createdAt: string;
  updatedAt: string;
}

// Marque
interface Brand {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

### API localStorage

```typescript
import { 
  localStorageProducts,
  localStorageBrands,
  localStorageCategories,
  localStorageImages 
} from '@/lib/localStorage';

// Exemples
await localStorageProducts.getAll();
await localStorageProducts.create(newProduct);
await localStorageProducts.update(id, updates);
await localStorageProducts.delete(id);
```

---

## 🎓 Bonnes Pratiques

### 1. Sauvegardez Régulièrement

**Minimum** : Une fois par semaine
**Recommandé** : Après chaque session de travail

### 2. Optimisez les Images

- Redimensionnez avant upload
- Compressez avec des outils en ligne
- Utilisez JPEG pour les photos

### 3. Testez Avant de Valider

- Ajoutez un produit de test
- Vérifiez l'affichage
- Supprimez les tests après validation

### 4. Nommez Clairement

- Noms de produits descriptifs
- Catégories cohérentes
- Marques standardisées

### 5. Organisez Votre Catalogue

- Créez les catégories d'abord
- Puis les marques
- Enfin les produits

---

## 💬 FAQ

**Q: Puis-je utiliser sur mobile ?**
R: Oui, mais uniquement en localhost. Pour mobile, il faudra déployer (mode online requis).

**Q: Les données sont-elles sécurisées ?**
R: Elles sont stockées localement dans votre navigateur. Pas de transmission sur internet.

**Q: Combien de produits puis-je stocker ?**
R: ~50-100 avec images. Plus sans images.

**Q: Puis-je partager mon catalogue ?**
R: Exportez le JSON et partagez le fichier. Le destinataire devra l'importer manuellement.

**Q: Que se passe-t-il si je vide le cache ?**
R: Toutes les données sont perdues. D'où l'importance des sauvegardes !

**Q: Puis-je utiliser plusieurs navigateurs ?**
R: Chaque navigateur a son propre localStorage. Pas de synchronisation automatique.

---

## 🚀 Prochaines Étapes

1. **Maintenant** : Utilisez l'application en mode offline
2. **Cette semaine** : Ajoutez vos vrais produits
3. **Régulièrement** : Exportez vos données
4. **Plus tard** : Passez en mode online si besoin

---

## 🆘 Besoin d'Aide ?

1. **Console du navigateur** : F12 → Vérifiez les erreurs
2. **localStorage** : F12 → Application → Local Storage
3. **Documentation** : Lisez README.md pour plus de détails

---

**Mode Offline - Version 1.0**  
**Dernière mise à jour** : 2024-01-16

**🎉 Profitez de votre application CleanExpress en mode offline !**