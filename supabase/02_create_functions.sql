-- ==========================================
-- FONCTIONS UTILITAIRES POUR LES RÔLES
-- ==========================================

-- Fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role = 'admin' FROM profiles WHERE id = user_uuid),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur est vendeur
CREATE OR REPLACE FUNCTION is_vendeur(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role = 'vendeur' FROM profiles WHERE id = user_uuid),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer un profil admin
CREATE OR REPLACE FUNCTION create_admin_profile(user_email TEXT, user_full_name TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Trouver l'ID de l'utilisateur par email
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur avec email % non trouvé', user_email;
  END IF;
  
  -- Créer ou mettre à jour le profil
  INSERT INTO profiles (id, full_name, role)
  VALUES (user_id, user_full_name, 'admin')
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin', full_name = COALESCE(user_full_name, profiles.full_name), updated_at = NOW();
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer un profil vendeur
CREATE OR REPLACE FUNCTION create_vendeur_profile(user_email TEXT, user_full_name TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Trouver l'ID de l'utilisateur par email
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur avec email % non trouvé', user_email;
  END IF;
  
  -- Créer ou mettre à jour le profil
  INSERT INTO profiles (id, full_name, role)
  VALUES (user_id, user_full_name, 'vendeur')
  ON CONFLICT (id) DO UPDATE
  SET role = 'vendeur', full_name = COALESCE(user_full_name, profiles.full_name), updated_at = NOW();
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir tous les utilisateurs avec leurs profils
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

-- Donner les permissions d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION get_users_with_profiles() TO authenticated;

