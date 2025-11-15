-- ==========================================
-- TABLE USER_FAVORITES
-- Pour le système de favoris/bookmarks
-- ==========================================

CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_product_id ON user_favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_product ON user_favorites(user_id, product_id);

COMMENT ON TABLE user_favorites IS 'Favoris des utilisateurs - produits marqués comme favoris';
COMMENT ON COLUMN user_favorites.user_id IS 'ID de l''utilisateur qui a ajouté le favori';
COMMENT ON COLUMN user_favorites.product_id IS 'ID du produit favori';

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres favoris
DROP POLICY IF EXISTS "Users can view their own favorites" ON user_favorites;
CREATE POLICY "Users can view their own favorites"
ON user_favorites FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent ajouter leurs propres favoris
DROP POLICY IF EXISTS "Users can add their own favorites" ON user_favorites;
CREATE POLICY "Users can add their own favorites"
ON user_favorites FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent supprimer leurs propres favoris
DROP POLICY IF EXISTS "Users can delete their own favorites" ON user_favorites;
CREATE POLICY "Users can delete their own favorites"
ON user_favorites FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==========================================
-- FONCTION UTILITAIRE : Vérifier si un produit est en favoris
-- ==========================================

CREATE OR REPLACE FUNCTION is_product_favorite(user_uuid UUID, product_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_favorites
    WHERE user_id = user_uuid AND product_id = product_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- FIN DU SCRIPT
-- ==========================================

