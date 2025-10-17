import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';

const Login = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        toast.success(`Connexion réussie !`);
        navigate('/admin');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (session) {
    return <Navigate to="/admin" replace />;
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
        />
      </div>
    </div>
  );
};

export default Login;