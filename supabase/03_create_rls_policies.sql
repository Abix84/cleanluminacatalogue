-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- ==========================================
-- 1. ENABLE RLS SUR TOUTES LES TABLES
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_categories ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. POLICIES POUR PROFILES
-- ==========================================

-- Les utilisateurs peuvent voir leur propre profil
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Les admins peuvent voir tous les profils
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Les utilisateurs peuvent créer leur propre profil (lors de l'inscription)
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Les admins peuvent modifier tous les profils
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Les admins peuvent supprimer les profils
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- ==========================================
-- 3. POLICIES POUR PRODUCTS
-- ==========================================

-- Lecture publique (tous les utilisateurs authentifiés peuvent lire)
DROP POLICY IF EXISTS "Authenticated users can read products" ON products;
CREATE POLICY "Authenticated users can read products"
ON products FOR SELECT
TO authenticated
USING (true);

-- Seuls les admins peuvent créer/modifier/supprimer
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
ON products FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- ==========================================
-- 4. POLICIES POUR BRANDS
-- ==========================================

-- Lecture publique
DROP POLICY IF EXISTS "Authenticated users can read brands" ON brands;
CREATE POLICY "Authenticated users can read brands"
ON brands FOR SELECT
TO authenticated
USING (true);

-- Seuls les admins peuvent créer/modifier/supprimer
DROP POLICY IF EXISTS "Admins can manage brands" ON brands;
CREATE POLICY "Admins can manage brands"
ON brands FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- ==========================================
-- 5. POLICIES POUR UTILITY_CATEGORIES
-- ==========================================

-- Lecture publique
DROP POLICY IF EXISTS "Authenticated users can read categories" ON utility_categories;
CREATE POLICY "Authenticated users can read categories"
ON utility_categories FOR SELECT
TO authenticated
USING (true);

-- Seuls les admins peuvent créer/modifier/supprimer
DROP POLICY IF EXISTS "Admins can manage categories" ON utility_categories;
CREATE POLICY "Admins can manage categories"
ON utility_categories FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

