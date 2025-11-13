# 📸 Guide de l'Éditeur d'Images

## Vue d'ensemble

L'éditeur d'images intégré permet de recadrer, ajuster et optimiser les photos de produits directement dans l'interface d'administration, avec un fond blanc professionnel par défaut.

---

## ✨ Fonctionnalités principales

### 🎯 Recadrage intelligent
- **Recadrage libre** : Ajustez manuellement la zone de recadrage
- **Formats prédéfinis** :
  - Carré (1:1) - Recommandé pour les produits
  - 4:3 - Format classique
  - 16:9 - Format panoramique
  - 3:2 - Format photo standard
  - Portrait (3:4)
  - Libre - Sans contrainte de ratio

### 🔍 Zoom et positionnement
- **Zoom de 100% à 300%** avec curseur fluide
- Boutons rapides +/- pour ajustements précis
- Déplacement de l'image par glisser-déposer
- Zoom à la molette de la souris

### 🔄 Rotation
- **Rotation de -180° à +180°** avec curseur
- Boutons rapides +45° / -45°
- Rotation fluide en temps réel

### 🎨 Gestion de l'arrière-plan
- **Fond blanc par défaut** (recommandé)
- Options de couleurs :
  - Blanc (#ffffff)
  - Gris clair (#f5f5f5)
  - Crème (#faf9f6)
  - Bleu clair (#e3f2fd)
  - Transparent (pour PNG)

### 📐 Centrage automatique
- Le produit est automatiquement centré dans la zone de recadrage
- Ajustement facile pour optimiser le cadrage

---

## 🚀 Comment utiliser l'éditeur

### 1. Ajouter une image

#### Méthode 1 : Glisser-Déposer
1. Glissez votre image depuis votre explorateur de fichiers
2. Déposez-la dans la zone d'upload
3. L'aperçu s'affiche automatiquement

#### Méthode 2 : Parcourir
1. Cliquez sur la zone d'upload
2. Sélectionnez votre image depuis le navigateur de fichiers
3. L'aperçu s'affiche automatiquement

### 2. Éditer l'image

1. **Survolez l'image** pour afficher les options
2. Cliquez sur **"Éditer"** (icône crayon)
3. L'éditeur s'ouvre dans une modale plein écran

### 3. Ajuster l'image dans l'éditeur

#### Recadrage
- Glissez l'image pour la positionner
- Utilisez les poignées pour ajuster la zone de recadrage
- Sélectionnez un format prédéfini pour contraindre les proportions

#### Zoom
- Utilisez le curseur pour zoomer
- Ou utilisez les boutons +/- pour un contrôle précis
- La molette de la souris fonctionne aussi

#### Rotation
- Déplacez le curseur de rotation
- Ou cliquez sur +45° / -45° pour des rotations rapides
- Idéal pour redresser une photo prise de travers

#### Arrière-plan
1. Activez "Fond blanc" avec le switch
2. Choisissez une couleur parmi les 5 options
3. Pour un PNG transparent, désactivez le fond blanc

### 4. Enregistrer

1. Vérifiez le résultat dans la zone de prévisualisation
2. Cliquez sur **"Enregistrer"**
3. L'image optimisée remplace l'originale
4. La modale se ferme automatiquement

---

## 💡 Bonnes pratiques

### ✅ Recommandations

1. **Format de l'image**
   - Privilégiez le format carré (1:1) pour une cohérence visuelle
   - Format recommandé : 800x800px minimum
   - Type de fichier : JPEG pour les photos, PNG pour transparence

2. **Fond blanc**
   - Activez toujours le fond blanc pour un rendu professionnel
   - Centrez bien le produit dans le cadre
   - Laissez un peu d'espace autour du produit (padding)

3. **Éclairage et qualité**
   - Utilisez des photos bien éclairées
   - Évitez les images floues ou pixelisées
   - Le produit doit être net et bien visible

4. **Optimisation**
   - Les images sont automatiquement converties en PNG optimisé
   - La qualité est préservée
   - Le poids du fichier est optimisé pour le web

### ❌ À éviter

- Images de moins de 400x400px (trop petites)
- Photos floues ou mal éclairées
- Produits coupés ou mal cadrés
- Fonds encombrés ou distrayants
- Rotation excessive (gardez le produit droit)

---

## 🎨 Design et interface

### Style moderne et épuré
- **Coins arrondis** (rounded-3xl, rounded-2xl)
- **Ombres douces** pour la profondeur
- **Animations fluides** sur toutes les interactions
- **Design responsive** : fonctionne sur tous les écrans

### Palette de couleurs
- En-tête avec dégradé primary
- Contrôles avec icônes colorées
- Feedback visuel sur les actions
- Boutons avec états hover/active

### Expérience utilisateur
- Instructions contextuelles
- Feedback en temps réel
- Raccourcis clavier (molette pour zoom)
- Transitions fluides

---

## 🔧 Détails techniques

### Formats acceptés
- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **WebP** (.webp)

### Limites
- Taille maximale : **5 MB**
- Résolution recommandée : 800x800px à 2000x2000px
- Format de sortie : PNG optimisé

### Traitement de l'image
1. L'image originale est chargée dans le canvas
2. Le recadrage est appliqué selon les paramètres
3. Le fond blanc est ajouté si activé
4. La rotation est appliquée
5. L'image est optimisée et convertie en Blob
6. Le fichier final est généré en PNG

### Performance
- Traitement côté client (pas de serveur requis)
- Canvas HTML5 pour les transformations
- Optimisation automatique du poids
- Rendu en temps réel

---

## 📱 Responsive Design

### Desktop
- Modale plein écran avec deux colonnes
- Zone de prévisualisation à gauche (large)
- Panneau de contrôles à droite (320px)
- Interface optimale pour l'édition précise

### Tablette
- Mise en page adaptée
- Contrôles accessibles
- Zone de prévisualisation redimensionnée

### Mobile
- Interface simplifiée
- Contrôles empilés verticalement
- Gestes tactiles supportés (pinch to zoom)

---

## 🐛 Dépannage

### L'image ne se charge pas
- Vérifiez que le fichier fait moins de 5 MB
- Assurez-vous que le format est supporté (JPEG, PNG, WebP)
- Essayez de recharger la page

### L'éditeur ne s'ouvre pas
- Vérifiez que l'image est bien chargée en aperçu
- Essayez de supprimer et recharger l'image
- Vérifiez la console du navigateur pour les erreurs

### L'image finale est de mauvaise qualité
- Utilisez une image source de meilleure résolution
- Évitez de trop zoomer (> 200%)
- Ne partez pas d'une image déjà compressée

### Le fond blanc ne s'applique pas
- Vérifiez que le switch "Fond blanc" est activé
- Essayez de changer de couleur de fond
- Réinitialisez les paramètres

---

## 🔄 Workflow recommandé

1. **Préparation** (avant upload)
   - Photographiez le produit sur fond neutre
   - Éclairage uniforme et naturel
   - Résolution minimale : 800x800px

2. **Upload**
   - Glissez-déposez l'image dans la zone d'upload
   - Vérifiez l'aperçu

3. **Édition**
   - Ouvrez l'éditeur (bouton "Éditer")
   - Sélectionnez le format carré (1:1)
   - Centrez le produit
   - Ajustez le zoom pour remplir le cadre
   - Activez le fond blanc
   - Rotation si nécessaire

4. **Validation**
   - Vérifiez le rendu final
   - Enregistrez
   - Le produit est prêt à être publié

---

## 🎯 Exemples d'utilisation

### Produit détergent en bouteille
```
Format : Carré (1:1)
Zoom : 120-150%
Fond : Blanc (#ffffff)
Rotation : 0°
Padding : Laissez 10-15% d'espace autour
```

### Produit en spray
```
Format : Portrait (3:4)
Zoom : 130-160%
Fond : Blanc (#ffffff)
Rotation : 0°
Centrage : Vertical et horizontal
```

### Pack de produits
```
Format : 16:9 ou Libre
Zoom : 100-120%
Fond : Blanc (#ffffff)
Rotation : Ajuster si nécessaire
Note : Gardez tous les produits visibles
```

---

## 📚 Bibliothèques utilisées

- **react-easy-crop** : Composant de recadrage d'images
- **Canvas API** : Traitement et manipulation d'images
- **Radix UI** : Composants d'interface accessibles
- **Framer Motion** : Animations fluides

---

## 🆘 Support

Pour toute question ou problème :
1. Consultez cette documentation
2. Vérifiez les bonnes pratiques
3. Testez avec une image différente
4. Contactez le support technique

---

## 🚀 Prochaines améliorations

### En cours de développement
- [ ] Filtres de couleur (luminosité, contraste, saturation)
- [ ] Suppression automatique de l'arrière-plan (IA)
- [ ] Redimensionnement automatique aux dimensions recommandées
- [ ] Préréglages sauvegardés
- [ ] Historique des modifications (undo/redo)
- [ ] Comparaison avant/après

### Suggestions bienvenues
N'hésitez pas à proposer de nouvelles fonctionnalités !

---

## 📄 Licence

Intégré dans le système de gestion de catalogue CleanExpress.
Tous droits réservés © 2024