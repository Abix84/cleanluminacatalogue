# 🎨 Configuration des Logos et Thèmes

## 📁 Emplacement des Logos

Placez les logos des entreprises dans le dossier `public/logos/` :

```
public/
  logos/
    cleanexpress-logo.png         ← Logo CleanExpress (mode clair)
    cleanexpress-logo-dark.png    ← Logo CleanExpress (mode sombre)
    lumina-logo.png               ← Logo Lumina Distribution (mode clair)
    lumina-logo-dark.png          ← Logo Lumina Distribution (mode sombre)
```

## 🖼️ Format des Logos

### Recommandations
- **Format** : PNG avec transparence (fond transparent)
- **Taille minimale** : 400x400px pour une bonne qualité
- **Ratio** : 1:1 (carré) ou adapté au logo original
- **Fond** : Transparent de préférence

### Noms de fichiers
Les fichiers doivent être nommés exactement :
- `cleanexpress-logo.png` pour CleanExpress (mode clair)
- `cleanexpress-logo-dark.png` pour CleanExpress (mode sombre) - **Optionnel**
- `lumina-logo.png` pour Lumina Distribution (mode clair)
- `lumina-logo-dark.png` pour Lumina Distribution (mode sombre) - **Optionnel**

### Logos Dark Mode
Les logos dark sont utilisés automatiquement en mode sombre. Si un logo dark n'est pas disponible, le logo normal sera utilisé.

## 🎨 Palettes de Couleurs

### CleanExpress
- **Black** : `#000000`
- **Deutsch Orange** : `#FF3300`
- **Sunny Yellow** : `#FFCA00`
- **Pink Lemonade** : `#FFCCFF`
- **Golden Rush** : `#826E50`
- **Ocean Blue** : `#0A66DD` (Primary)
- **Sky Blue** : `#ABEEFE` (Accent)
- **Sand Off-White** : `#F8F8F2` (Background)
- **White** : `#FFFFFF`

### Lumina Distribution
- **Bleu** : `#2300c8` (Primary)
- **Blanc** : `#FFFFFF`
- **Jaune** : `#ffc200` (Secondary)
- **Rose** : `#ec9abf`
- **Rouge** : `#fc5c47` (Destructive)
- **Vert** : `#00bd9e`
- **Bleu clair** : `#51bfff` (Accent)

## ✅ Vérification

Une fois les logos ajoutés, vérifiez que :
1. Les logos s'affichent sur la page d'accueil
2. Les logos s'affichent dans la navbar selon l'entreprise
3. Les couleurs sont appliquées correctement dans les catalogues

## 🔄 Fallback

Si les logos ne sont pas disponibles, l'application affichera :
- Un texte avec le nom de l'entreprise sur la page d'accueil
- Le logo par défaut dans la navbar

