-- ==========================================
-- CORRECTION DE LA FONCTION get_users_with_profiles
-- ==========================================
-- 
-- Cette fonction doit être SECURITY DEFINER pour accéder à auth.users
-- ==========================================

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS get_users_with_profiles();

-- Recréer la fonction avec SECURITY DEFINER
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

-- Commentaire
COMMENT ON FUNCTION get_users_with_profiles() IS 'Récupère tous les utilisateurs avec leurs profils. Nécessite SECURITY DEFINER pour accéder à auth.users.';

