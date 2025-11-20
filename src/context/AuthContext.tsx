import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { UserRole, Profile } from '@/types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isVendeur: boolean;
  isVisiteur: boolean;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Crée un profil par défaut avec le rôle "visiteur" pour un nouvel utilisateur
   */
  const createDefaultProfile = useCallback(async (userId: string, userEmail: string) => {
    try {
      console.log('[AuthContext] Creating default profile for new user:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: userEmail.split('@')[0], // Utiliser la partie avant @ comme nom par défaut
          role: 'visiteur',
          avatar_url: null,
        })
        .select()
        .single();

      if (error) {
        console.error('[AuthContext] Error creating profile:', error);
        return null;
      }

      console.log('[AuthContext] Profile created successfully:', data);
      return data as Profile;
    } catch (error) {
      console.error('[AuthContext] Unexpected error creating profile:', error);
      return null;
    }
  }, []);

  /**
   * Récupère le profil de l'utilisateur depuis la base de données
   * Si aucun profil n'existe, en crée un avec le rôle "visiteur"
   */
  const fetchUserRole = useCallback(async (userId: string, userEmail?: string) => {
    try {
      console.log('[AuthContext] Fetching profile for user:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) {
        // Gestion spécifique des erreurs d'authentification (401)
        if (error.code === '401' || error.message?.includes('JWT')) {
          console.error('[AuthContext] 401 Unauthorized during profile fetch, signing out...');
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setRole(null);
          setProfile(null);
          return;
        }

        if (error.code === 'PGRST116') {
          // No rows returned - utilisateur sans profil, créer un profil par défaut
          console.log('[AuthContext] No profile found for user, creating default profile:', userId);

          if (userEmail) {
            const newProfile = await createDefaultProfile(userId, userEmail);
            if (newProfile) {
              setRole(newProfile.role as UserRole);
              setProfile(newProfile);
              return;
            }
          }

          // Si la création échoue, définir le rôle comme visiteur quand même
          setRole('visiteur');
          setProfile(null);
          return;
        }
        // Autre erreur
        console.error('[AuthContext] Error fetching profile:', error);
        console.error('[AuthContext] Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        setRole(null);
        setProfile(null);
        return;
      }

      if (data) {
        console.log('[AuthContext] Profile found:', data);
        setRole(data.role as UserRole);
        setProfile(data as Profile);
      } else {
        console.log('[AuthContext] No data returned');
        setRole(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('[AuthContext] Unexpected error fetching profile:', error);
      setRole(null);
      setProfile(null);
    }
  }, [createDefaultProfile]);

  /**
   * Rafraîchit le rôle de l'utilisateur
   */
  const refreshRole = useCallback(async () => {
    if (user?.id) {
      await fetchUserRole(user.id);
    }
  }, [user?.id, fetchUserRole]);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('Error getting session:', error);
          setSession(null);
          setUser(null);
          setRole(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        // Validation supplémentaire de la session côté serveur
        if (session) {
          const { error: userError } = await supabase.auth.getUser();

          if (userError) {
            console.error('[AuthContext] Session invalid (getUser failed), signing out:', userError);
            await supabase.auth.signOut();

            if (mounted) {
              setSession(null);
              setUser(null);
              setRole(null);
              setProfile(null);
              setLoading(false);
            }
            return;
          }
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user?.id) {
          console.log('[AuthContext] Initial session - User ID:', session.user.id);
          console.log('[AuthContext] Initial session - User email:', session.user.email);
          // Attendre fetchUserRole pour s'assurer que le rôle est chargé
          await fetchUserRole(session.user.id, session.user.email);
        } else {
          setRole(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Unexpected error in getInitialSession:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setRole(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      try {
        console.log('[AuthContext] Auth state change event:', _event);
        setSession(session);
        setUser(session?.user ?? null);

        // Mettre loading à false immédiatement pour permettre la navigation
        // Le rôle sera chargé en arrière-plan
        setLoading(false);

        if (session?.user?.id) {
          console.log('[AuthContext] Auth state change - User ID:', session.user.id);
          console.log('[AuthContext] Auth state change - User email:', session.user.email);
          // Charger le rôle en arrière-plan sans bloquer
          fetchUserRole(session.user.id, session.user.email).catch((error) => {
            console.error('[AuthContext] Error fetching user role:', error);
          });
        } else {
          console.log('[AuthContext] Auth state change - No session');
          setRole(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('[AuthContext] Error in auth state change:', error);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  const value = {
    session,
    user,
    role,
    profile,
    loading,
    isAdmin: role === 'admin',
    isVendeur: role === 'vendeur',
    isVisiteur: role === 'visiteur',
    refreshRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
