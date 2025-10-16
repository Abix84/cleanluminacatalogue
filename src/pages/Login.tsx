import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/admin");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">CleanExpress</h1>
            <p className="mt-2 text-sm text-gray-600">Connexion au panneau d'administration</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="light"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Adresse e-mail',
                password_label: 'Mot de passe',
                button_label: 'Se connecter',
                loading_button_label: 'Connexion en cours ...',
                social_provider_text: 'Se connecter avec {{provider}}',
                link_text: 'Vous avez déjà un compte ? Connectez-vous',
              },
              sign_up: {
                email_label: 'Adresse e-mail',
                password_label: 'Mot de passe',
                button_label: 'S\'inscrire',
                loading_button_label: 'Inscription en cours ...',
                social_provider_text: 'S\'inscrire avec {{provider}}',
                link_text: 'Vous n\'avez pas de compte ? Inscrivez-vous',
              },
              forgotten_password: {
                email_label: 'Adresse e-mail',
                password_label: 'Votre mot de passe',
                button_label: 'Envoyer les instructions',
                loading_button_label: 'Envoi en cours ...',
                link_text: 'Mot de passe oublié ?',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;