# 🌱 Guide de Seed des Données Supabase

## 📋 Vue d'Ensemble

Ce guide explique comment ajouter les données initiales (marques et catégories) dans votre base de données Supabase.

---

## 🚀 Instructions d'Installation

### Étape 1 : Accéder au SQL Editor

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor** dans le menu de gauche
3. Cliquez sur **New query**

### Étape 2 : Exécuter le Script

1. Ouvrez le fichier `supabase/seed_data.sql`
2. Copiez tout le contenu
3. Collez-le dans l'éditeur SQL de Supabase
4. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter`)

### Étape 3 : Vérifier les Données

Le script affiche automatiquement :
- Le nombre de marques ajoutées
- Le nombre de catégories ajoutées
- La liste complète des données

---

## 📊 Données Ajoutées

### Marques Principales (2)
- ✅ **CleanExpress**
- ✅ **Lumina Distribution**

### Marques de Produits - CleanExpress (25)
- ATLAS
- Clean Bag
- Dar Al Alwan
- Decoland
- Délicia
- Extra Clean
- Fibrax
- Forza Clean
- Frams
- GoldenDam
- Hachfa
- Isabel
- Louganet
- Luxabrosse
- MAMA menage
- Medinet
- Netsol
- Oriber
- PALC
- SpeedFire
- STERIMAX
- TECMECA
- Toma Net
- VDF Savon Liquide
- Vico

### Marques de Produits - Lumina Distribution (1)
- Force Xpress

### Catégories (67 catégories organisées en 12 groupes)

#### 🧹 1. Détergents ménagers (7 catégories)
- Détergents multi-usages
- Nettoyants sols (carrelage, marbre, parquet…)
- Nettoyants sanitaires (salle de bain, WC)
- Nettoyants cuisine
- Nettoyants vitres
- Désinfectants ménagers
- Produits d'entretien pour meubles et bois

#### 🧽 2. Lessives & soins du linge (7 catégories)
- Lessive liquide
- Lessive en poudre
- Lessive capsules
- Lessive spéciale teintures foncées / délicates
- Adoucissants / assouplissants
- Détachants textiles
- Désinfectants pour linge

#### 🚿 3. Produits d'hygiène corporelle (5 catégories)
- Savon liquide et solide
- Gel douche
- Shampooing / après-shampooing
- Crèmes lavantes pour mains
- Gel hydroalcoolique

#### 🧴 4. Produits pour vaisselle (4 catégories)
- Liquide vaisselle à la main
- Tablettes / gel pour lave-vaisselle
- Rinçage / sel régénérant
- Dégraissants vaisselle

#### 🧹 5. Désinfectants & assainissants (5 catégories)
- Désinfectants surfaces
- Désinfectants sols
- Aérosols désinfectants
- Désinfectants alimentaires (HACCP)
- Bactéricide, fongicide, virucide

#### 🧯 6. Dégraissants & décapants (5 catégories)
- Dégraissants industriels
- Dégraissants cuisine (four, plaque, hotte)
- Décapants sols
- Anti-calcaire
- Nettoyants pour acier inoxydable

#### 🚽 7. Produits sanitaires & WC (5 catégories)
- Gel WC
- Pastilles WC
- Blocs WC
- Désodorisants pour toilettes
- Nettoyants anti-calcaire WC

#### 🧴 8. Produits pour vitres & miroirs (3 catégories)
- Nettoyant vitres standard
- Nettoyant anti-buée
- Nettoyant vitres à base d'alcool

#### ☁️ 9. Déodorants & assainisseurs d'air (4 catégories)
- Aérosols parfumés
- Désodorisants textiles
- Neutraliseurs d'odeurs
- Diffuseurs automatiques ou manuels

#### 🏭 10. Produits industriels & professionnels (5 catégories)
- Détergents concentrés
- Détergents pour machines industrielles
- Produits pour lave-batterie
- Détergents pour sols d'entrepôts
- Nettoyants haute pression

#### 🌿 11. Gamme écologique / éco-responsable (5 catégories)
- Détergents écologiques certifiés
- Savon noir
- Bicarbonate de soude
- Vinaigre ménager
- Lessives sans phosphates

#### 🧰 12. Accessoires & consommables (5 catégories)
- Éponges, brosses, serpillières
- Sacs poubelle
- Gants ménagers
- Balais / raclettes
- Papiers essuie-tout / bobines

---

## 🎨 Système de Couleurs

Les catégories sont organisées par groupes de couleurs pour une meilleure visualisation :

- **Bleu** : Détergents ménagers
- **Violet** : Lessives & soins du linge
- **Vert** : Produits d'hygiène corporelle
- **Cyan** : Produits pour vaisselle
- **Cyan clair** : Désinfectants & assainissants
- **Ambre/Orange** : Dégraissants & décapants
- **Orange** : Produits sanitaires & WC
- **Rouge** : Produits pour vitres & miroirs
- **Rose** : Déodorants & assainisseurs d'air
- **Indigo** : Produits industriels & professionnels
- **Vert foncé** : Gamme écologique / éco-responsable
- **Gris** : Accessoires & consommables

---

## ⚠️ Notes Importantes

### Protection contre les Doublons

Le script utilise `ON CONFLICT DO NOTHING` pour éviter les doublons. Si vous exécutez le script plusieurs fois, il n'ajoutera pas de données en double.

### Nettoyage des Données

Si vous voulez réinitialiser les données, décommentez les lignes suivantes au début du script :

```sql
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE utility_categories CASCADE;
TRUNCATE TABLE brands CASCADE;
```

⚠️ **Attention** : Cela supprimera **TOUTES** les données existantes !

### Vérification

Après l'exécution du script, vérifiez les résultats :
- **Total marques** : 28 (2 principales + 25 CleanExpress + 1 Lumina Distribution)
- **Total catégories** : 67

---

## 🔍 Vérification dans l'Application

1. Démarrez l'application : `pnpm dev`
2. Allez sur `/admin/management`
3. Vérifiez que toutes les marques et catégories sont présentes
4. Testez l'ajout d'un produit avec ces nouvelles données

---

## 🐛 Dépannage

### Erreur "relation does not exist"

**Cause** : Les tables n'existent pas encore

**Solution** : Exécutez d'abord le script de création des tables (voir `README.md`)

### Données en double

**Cause** : Le script a été exécuté plusieurs fois avec des noms légèrement différents

**Solution** : Utilisez `TRUNCATE` pour nettoyer, puis ré-exécutez le script

### Couleurs non affichées

**Cause** : Les couleurs ne sont pas au bon format

**Solution** : Vérifiez que les couleurs sont au format hexadécimal (#RRGGBB)

---

## 📚 Références

- [Documentation Supabase SQL](https://supabase.com/docs/guides/database)
- [PostgreSQL INSERT](https://www.postgresql.org/docs/current/sql-insert.html)
- [ON CONFLICT](https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT)

---

**Date de création** : 2025-01-XX
**Version** : 1.0.0

