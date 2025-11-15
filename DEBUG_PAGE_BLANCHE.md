# 🔍 Guide de Débogage - Page Blanche

Si vous voyez une page blanche après `npm run dev`, suivez ces étapes :

## 1. Vérifier la Console du Navigateur

1. Ouvrez les **Outils de développement** (F12)
2. Allez dans l'onglet **Console**
3. Cherchez les erreurs en rouge
4. Copiez les messages d'erreur

## 2. Vérifier l'Onglet Network

1. Dans les outils de développement, allez dans l'onglet **Network**
2. Rechargez la page (F5)
3. Vérifiez si des fichiers ne se chargent pas (en rouge)

## 3. Vérifier les Erreurs TypeScript

```bash
npm run build
```

Si des erreurs apparaissent, corrigez-les.

## 4. Vérifier les Variables d'Environnement

Assurez-vous que le fichier `.env` existe et contient :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle
VITE_OFFLINE_MODE=false
```

## 5. Nettoyer et Redémarrer

```bash
# Arrêter le serveur (Ctrl+C)
# Nettoyer le cache
rm -rf node_modules/.vite
# Ou sur Windows PowerShell:
Remove-Item -Recurse -Force node_modules\.vite

# Redémarrer
npm run dev
```

## 6. Vérifier les Imports

Vérifiez que tous les imports sont corrects :
- `@/lib/companyThemes` existe
- `@/hooks/useCompanyTheme` existe
- Les logos existent dans `public/logos/`

## 7. Erreurs Courantes

### "Cannot find module"
- Vérifiez que le fichier existe
- Vérifiez l'orthographe du chemin
- Redémarrez le serveur

### "window is not defined"
- Déjà corrigé dans Navbar.tsx avec la vérification `typeof window === "undefined"`

### Erreur de thème
- Vérifiez que `companyThemes.ts` exporte bien `cleanExpressTheme` et `luminaTheme`

## 8. Mode Débogage

Ajoutez des `console.log` dans `main.tsx` :

```typescript
console.log("🚀 Application démarrée");
console.log("📦 Thèmes disponibles:", { cleanExpressTheme, luminaTheme });
```

## 9. Vérifier ErrorBoundary

L'ErrorBoundary devrait afficher les erreurs. Si vous voyez une page blanche complète, l'erreur pourrait être dans :
- `main.tsx`
- `App.tsx`
- Un import manquant

## 10. Solution Rapide

Si rien ne fonctionne, essayez :

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run dev
```





