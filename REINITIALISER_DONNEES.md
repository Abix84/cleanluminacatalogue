# 🔄 Réinitialisation des Données

## 🎯 Problème

Si vous ne voyez pas les **34 marques** et **52 catégories** dans l'interface de gestion, c'est probablement parce que vous avez déjà des données dans le `localStorage` de votre navigateur.

---

## ✅ Solution Rapide (30 secondes)

### Méthode 1 : Console du Navigateur

1. **Ouvrez la console** du navigateur (touche `F12`)
2. **Allez dans l'onglet "Console"**
3. **Copiez-collez cette commande** :
   ```javascript
   localStorage.clear();
   location.reload();
   ```
4. **Appuyez sur Entrée**
5. ✅ La page se recharge avec toutes les nouvelles données !

---

### Méthode 2 : Depuis les DevTools

1. **Ouvrez les DevTools** (touche `F12`)
2. **Allez dans l'onglet "Application"** (ou "Storage" selon le navigateur)
3. **Développez "Local Storage"** dans le menu de gauche
4. **Cliquez sur votre domaine** (`http://localhost:5173`)
5. **Cliquez droit** → **Clear**
6. **Rechargez la page** (F5)
7. ✅ Toutes les données sont réinitialisées !

---

### Méthode 3 : Code JavaScript Simple

Dans la console du navigateur, tapez chacune de ces lignes une par une :

```javascript
// Supprimer uniquement les données CleanExpress
localStorage.removeItem('cleanexpress_products');
localStorage.removeItem('cleanexpress_brands');
localStorage.removeItem('cleanexpress_categories');
localStorage.removeItem('cleanexpress_images');
localStorage.removeItem('cleanexpress_version');

// Recharger la page
location.reload();
```

---

## 📊 Vérification

Après la réinitialisation, vous devriez voir :

### Dans la Console
```
🎉 Initialisation du stockage local avec données de démonstration
✅ Stockage local déjà initialisé (version: 1.0.0)
```

### Dans l'Interface de Gestion (`/admin/management`)

**Onglet Marques :**
- ✅ 34 marques affichées
- AMBI FRESH, ATLAS, Clean Bag, etc.

**Onglet Catégories :**
- ✅ 52 catégories affichées avec couleurs
- Lessives liquides et en poudre, Assouplissants textiles, etc.

---

## 🔍 Diagnostic

Pour vérifier l'état actuel de vos données :

### Dans la Console (F12)
```javascript
// Vérifier le nombre de marques
JSON.parse(localStorage.getItem('cleanexpress_brands')).length

// Vérifier le nombre de catégories
JSON.parse(localStorage.getItem('cleanexpress_categories')).length

// Voir toutes les marques
console.table(JSON.parse(localStorage.getItem('cleanexpress_brands')))

// Voir toutes les catégories
console.table(JSON.parse(localStorage.getItem('cleanexpress_categories')))
```

---

## ⚠️ Important

### Sauvegarde des Données (Optionnel)

Si vous avez des données importantes, **exportez-les avant** de réinitialiser :

1. Allez dans le Dashboard Admin (`/admin`)
2. Cliquez sur le bouton **"Exporter"**
3. Un fichier JSON sera téléchargé avec toutes vos données
4. Réinitialisez ensuite avec les méthodes ci-dessus

### Ré-import (si nécessaire)

Après réinitialisation, vous pouvez ré-importer vos anciennes données :
- Cette fonctionnalité sera disponible prochainement
- Pour l'instant, vous devrez recréer manuellement les produits

---

## 🚀 Après la Réinitialisation

1. **Rechargez la page** : `F5` ou `Ctrl+R`
2. **Allez dans Admin** : `/admin`
3. **Cliquez sur "Gestion"**
4. **Vérifiez les onglets** :
   - Marques : Vous devriez voir 34 marques
   - Catégories : Vous devriez voir 52 catégories

---

## 🆘 Si Ça Ne Fonctionne Toujours Pas

### 1. Vérifier que le serveur est bien lancé
```bash
npm run dev
```

### 2. Vider le cache du navigateur
- `Ctrl + Shift + Suppr` (Windows/Linux)
- `Cmd + Shift + Delete` (Mac)
- Cocher "Cookies et données de site"
- Cliquer sur "Effacer les données"

### 3. Essayer un autre navigateur
- Testez dans Chrome, Firefox ou Edge
- Si ça fonctionne, le problème vient du cache du premier navigateur

### 4. Mode Incognito / Navigation Privée
- Ouvrez une fenêtre privée
- Allez sur `http://localhost:5173/admin/management`
- Si ça fonctionne ici, le problème est lié aux données stockées

---

## 📝 Notes Techniques

### Structure des Clés localStorage
```
cleanexpress_products      → Liste des produits
cleanexpress_brands        → Liste des 34 marques
cleanexpress_categories    → Liste des 52 catégories
cleanexpress_images        → Images en base64
cleanexpress_version       → Version actuelle (1.0.0)
```

### Initialisation Automatique
Le fichier `src/main.tsx` appelle `initializeStorage()` au démarrage.

Si la clé `cleanexpress_version` n'existe pas, le système créé automatiquement :
- 34 marques
- 52 catégories
- 5 produits de démonstration

---

## ✅ Checklist

Après réinitialisation, vérifiez :

- [ ] La console affiche le message d'initialisation
- [ ] `/admin/management` → Onglet Marques : 34 marques visibles
- [ ] `/admin/management` → Onglet Catégories : 52 catégories visibles
- [ ] Les catégories ont des couleurs différentes
- [ ] La recherche fonctionne dans les deux onglets
- [ ] Vous pouvez ajouter une nouvelle marque
- [ ] Vous pouvez ajouter une nouvelle catégorie

---

## 📞 Support

Si le problème persiste après avoir suivi ce guide :
1. Vérifiez la console pour les erreurs (F12 → Console)
2. Prenez une capture d'écran des erreurs
3. Vérifiez que vous êtes sur la dernière version du code

---

**Dernière mise à jour** : Janvier 2025  
**Version** : 1.1.0