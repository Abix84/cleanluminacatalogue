import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';

const Login = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Login] Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('[Login] User signed in:', session.user.email);
        toast.success('Connexion réussie !');
        // Naviguer vers la page d'accueil après la connexion
        // Utiliser un petit délai pour s'assurer que le contexte est mis à jour
        setTimeout(() => {
          console.log('[Login] Navigating to / after sign in');
          navigate('/', { replace: true });
        }, 100);
      } else if (event === 'SIGNED_OUT') {
        console.log('[Login] User signed out');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('[Login] Token refreshed');
      } else if (event === 'USER_UPDATED') {
        console.log('[Login] User updated');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    // Si on a une session et que le chargement est terminé, naviguer vers la page d'accueil
    if (session && !loading) {
      console.log('[Login] Session exists, navigating to /');
      console.log('[Login] Session details:', { 
        user: session.user?.email, 
        loading 
      });
      navigate('/', { replace: true });
    }
  }, [session, loading, navigate]);

  // Si on a une session, rediriger immédiatement vers la page d'accueil
  if (session && !loading) {
    console.log('[Login] Redirecting to / (session exists)');
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
            <img src="/logo.png" alt="CleanExpress Logo" className="mx-auto h-16 w-auto block dark:hidden" />
            <img src="/logo_darkmode.png" alt="CleanExpress Logo" className="mx-auto h-16 w-auto hidden dark:block" />
          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
            Espace Administrateur
          </h2>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          onlyThirdPartyProviders={false}
          magicLink={false}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Adresse e-mail',
                password_label: 'Mot de passe',
                email_input_placeholder: 'Votre adresse e-mail',
                password_input_placeholder: 'Votre mot de passe',
                button_label: 'Se connecter',
                loading_button_label: 'Connexion en cours ...',
              },
              sign_up: {
                email_label: 'Adresse e-mail',
                password_label: 'Mot de passe',
                email_input_placeholder: 'Votre adresse e-mail',
                password_input_placeholder: 'Votre mot de passe',
                button_label: 'Créer un compte',
                loading_button_label: 'Création en cours ...',
                link_text: 'Vous n\'avez pas de compte ? Créez-en un',
                confirmation_text: 'Un lien de confirmation a été envoyé à votre adresse e-mail.'
              },
              forgotten_password: {
                email_label: 'Adresse e-mail',
                email_input_placeholder: 'Votre adresse e-mail',
                button_label: 'Réinitialiser le mot de passe',
                loading_button_label: 'Envoi en cours ...',
                link_text: 'Mot de passe oublié ?',
                confirmation_text: 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.'
              },
            },
          }}
          theme="default"
          showLinks={true}
          view="sign_in"
        />
      </div>
    </div>
  );
};

export default Login;