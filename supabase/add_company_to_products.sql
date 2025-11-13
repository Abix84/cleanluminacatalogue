-- ==========================================
-- AJOUT DE LA COLONNE COMPANY À LA TABLE PRODUCTS
-- ==========================================

-- Ajouter la colonne company si elle n'existe pas
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS company TEXT CHECK (company IN ('CleanExpress', 'Lumina Distribution'));

-- Créer un index pour améliorer les performances des requêtes par entreprise
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company);

-- Commentaire
COMMENT ON COLUMN products.company IS 'Entreprise propriétaire du produit: CleanExpress ou Lumina Distribution';

