-- ==========================================
-- SCRIPT COMPLET - INSTALLATION EN UNE FOIS
-- CleanExpress & Lumina Distribution
-- ==========================================
-- 
-- IMPORTANT: Exécutez ce script dans le SQL Editor de Supabase
-- Il contient TOUT ce qui est nécessaire pour démarrer
-- ==========================================

-- ==========================================
-- 1. TABLE PROFILES (Rôles utilisateurs)
-- ==========================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'vendeur', 'visiteur')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

COMMENT ON TABLE profiles IS 'Profils utilisateurs avec rôles (admin, vendeur, visiteur)';
COMMENT ON COLUMN profiles.role IS 'Rôle de l''utilisateur: admin (accès complet), vendeur (lecture seule) ou visiteur (accès catalogue)';

-- ==========================================
-- 2. TABLE UTILITY_CATEGORIES
-- ==========================================

CREATE TABLE IF NOT EXISTS utility_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_utility_categories_name ON utility_categories(name);

-- ==========================================
-- 3. TABLE BRANDS
-- ==========================================

CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);

-- ==========================================
-- 4. TABLE PRODUCTS
-- ==========================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  image_url TEXT,
  utility_category_id UUID REFERENCES utility_categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  company TEXT CHECK (company IN ('CleanExpress', 'Lumina Distribution')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(utility_category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company);

-- ==========================================
-- 5. FONCTION POUR METTRE À JOUR updated_at
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_utility_categories_updated_at
  BEFORE UPDATE ON utility_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 6. FONCTIONS UTILITAIRES POUR LES RÔLES
-- ==========================================

CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role = 'admin' FROM profiles WHERE id = user_uuid),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_vendeur(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role = 'vendeur' FROM profiles WHERE id = user_uuid),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_admin_profile(user_email TEXT, user_full_name TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur avec email % non trouvé', user_email;
  END IF;
  
  INSERT INTO profiles (id, full_name, role)
  VALUES (user_id, user_full_name, 'admin')
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin', full_name = COALESCE(user_full_name, profiles.full_name), updated_at = NOW();
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_vendeur_profile(user_email TEXT, user_full_name TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur avec email % non trouvé', user_email;
  END IF;
  
  INSERT INTO profiles (id, full_name, role)
  VALUES (user_id, user_full_name, 'vendeur')
  ON CONFLICT (id) DO UPDATE
  SET role = 'vendeur', full_name = COALESCE(user_full_name, profiles.full_name), updated_at = NOW();
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_users_with_profiles()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  avatar_url TEXT,
  user_created_at TIMESTAMP WITH TIME ZONE,
  profile_created_at TIMESTAMP WITH TIME ZONE,
  profile_updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id AS user_id,
    u.email::TEXT,
    p.full_name,
    p.role::TEXT,
    p.avatar_url,
    u.created_at AS user_created_at,
    p.created_at AS profile_created_at,
    p.updated_at AS profile_updated_at
  FROM auth.users u
  LEFT JOIN profiles p ON p.id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_users_with_profiles() TO authenticated;

-- ==========================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_categories ENABLE ROW LEVEL SECURITY;

-- Policies pour PROFILES
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Policies pour PRODUCTS
DROP POLICY IF EXISTS "Authenticated users can read products" ON products;
CREATE POLICY "Authenticated users can read products"
ON products FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
ON products FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Policies pour BRANDS
DROP POLICY IF EXISTS "Authenticated users can read brands" ON brands;
CREATE POLICY "Authenticated users can read brands"
ON brands FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage brands" ON brands;
CREATE POLICY "Admins can manage brands"
ON brands FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Policies pour UTILITY_CATEGORIES
DROP POLICY IF EXISTS "Authenticated users can read categories" ON utility_categories;
CREATE POLICY "Authenticated users can read categories"
ON utility_categories FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON utility_categories;
CREATE POLICY "Admins can manage categories"
ON utility_categories FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- ==========================================
-- 8. DONNÉES INITIALES (SEED DATA)
-- ==========================================

-- Marques CleanExpress
INSERT INTO brands (name) VALUES
  ('ATLAS'),
  ('Clean Bag'),
  ('Dar Al Alwan'),
  ('Decoland'),
  ('Délicia'),
  ('Extra Clean'),
  ('Fibrax'),
  ('Forza Clean'),
  ('Frams'),
  ('GoldenDam'),
  ('Hachfa'),
  ('Isabel'),
  ('Louganet'),
  ('Luxabrosse'),
  ('MAMA menage'),
  ('Medinet'),
  ('Netsol'),
  ('Oriber'),
  ('PALC'),
  ('SpeedFire'),
  ('STERIMAX'),
  ('TECMECA'),
  ('Toma Net'),
  ('VDF Savon Liquide'),
  ('Vico')
ON CONFLICT (name) DO NOTHING;

-- Marques Lumina Distribution
INSERT INTO brands (name) VALUES
  ('Force Xpress')
ON CONFLICT (name) DO NOTHING;

-- Catégories
INSERT INTO utility_categories (name, color) VALUES
  ('Détergents multi-usages', '#FF6B6B'),
  ('Nettoyants sols (carrelage, marbre, parquet…)', '#4ECDC4'),
  ('Nettoyants sanitaires (salle de bain, WC)', '#45B7D1'),
  ('Nettoyants cuisine', '#FFA07A'),
  ('Nettoyants vitres', '#98D8C8'),
  ('Désinfectants ménagers', '#F7DC6F'),
  ('Produits d''entretien pour meubles et bois', '#BB8FCE'),
  ('Lessive liquide', '#85C1E2'),
  ('Lessive en poudre', '#F8B739'),
  ('Lessive capsules', '#E74C3C'),
  ('Lessive spéciale teintures foncées / délicates', '#9B59B6'),
  ('Adoucissants / assouplissants', '#3498DB'),
  ('Détachants textiles', '#1ABC9C'),
  ('Désinfectants pour linge', '#E67E22'),
  ('Savon liquide et solide', '#16A085'),
  ('Gel douche', '#27AE60'),
  ('Shampooing / après-shampooing', '#2ECC71'),
  ('Crèmes lavantes pour mains', '#F39C12'),
  ('Gel hydroalcoolique', '#E74C3C'),
  ('Liquide vaisselle à la main', '#3498DB'),
  ('Tablettes / gel pour lave-vaisselle', '#9B59B6'),
  ('Rinçage / sel régénérant', '#34495E'),
  ('Dégraissants vaisselle', '#E67E22'),
  ('Désinfectants surfaces', '#C0392B'),
  ('Désinfectants sols', '#8E44AD'),
  ('Aérosols désinfectants', '#2980B9'),
  ('Désinfectants alimentaires (HACCP)', '#27AE60'),
  ('Bactéricide, fongicide, virucide', '#16A085'),
  ('Dégraissants industriels', '#F39C12'),
  ('Dégraissants cuisine (four, plaque, hotte)', '#E67E22'),
  ('Décapants sols', '#D35400'),
  ('Anti-calcaire', '#95A5A6'),
  ('Nettoyants pour acier inoxydable', '#7F8C8D'),
  ('Gel WC', '#3498DB'),
  ('Pastilles WC', '#2980B9'),
  ('Blocs WC', '#5DADE2'),
  ('Désodorisants pour toilettes', '#85C1E2'),
  ('Nettoyants anti-calcaire WC', '#AED6F1'),
  ('Nettoyant vitres standard', '#52BE80'),
  ('Nettoyant anti-buée', '#58D68D'),
  ('Nettoyant vitres à base d''alcool', '#82E0AA'),
  ('Aérosols parfumés', '#F1948A'),
  ('Désodorisants textiles', '#EC7063'),
  ('Neutraliseurs d''odeurs', '#E74C3C'),
  ('Diffuseurs automatiques ou manuels', '#CB4335'),
  ('Détergents concentrés', '#85929E'),
  ('Détergents pour machines industrielles', '#5D6D7E'),
  ('Produits pour lave-batterie', '#34495E'),
  ('Détergents pour sols d''entrepôts', '#2C3E50'),
  ('Nettoyants haute pression', '#1B2631'),
  ('Détergents écologiques certifiés', '#27AE60'),
  ('Savon noir', '#229954'),
  ('Bicarbonate de soude', '#52BE80'),
  ('Vinaigre ménager', '#58D68D'),
  ('Lessives sans phosphates', '#82E0AA'),
  ('Éponges, brosses, serpillières', '#95A5A6'),
  ('Sacs poubelle', '#7F8C8D'),
  ('Gants ménagers', '#566573'),
  ('Balais / raclettes', '#34495E'),
  ('Papiers essuie-tout / bobines', '#2C3E50')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- FIN DU SCRIPT
-- ==========================================
-- 
-- Prochaines étapes :
-- 1. Créer le bucket "product-images" dans Storage (public)
-- 2. Déployer la Edge Function "create-user" (voir 06_deploy_edge_function.md)
-- 3. Créer votre premier utilisateur admin :
--    SELECT create_admin_profile('votre-email@example.com', 'Votre Nom');
--    OU utilisez le dashboard /admin/users pour créer des utilisateurs
-- ==========================================

