import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Vérifier les variables d'environnement
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables:', { supabaseUrl: !!supabaseUrl, serviceRoleKey: !!serviceRoleKey })
      return new Response(
        JSON.stringify({ error: 'Configuration error: Missing environment variables' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // Vérifier l'authentification de l'admin
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
    
    if (!authHeader) {
      console.error('Missing authorization header')
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    const token = authHeader.replace('Bearer ', '').trim()
    
    const { data: { user: adminUser }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !adminUser) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Vérifier que l'utilisateur est admin
    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', adminUser.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la vérification du profil admin' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    if (!adminProfile || adminProfile.role !== 'admin') {
      console.error('User is not admin:', { userId: adminUser.id, role: adminProfile?.role })
      return new Response(
        JSON.stringify({ error: 'Seuls les administrateurs peuvent créer des utilisateurs' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      )
    }

    // Récupérer les données de la requête
    let requestData
    try {
      requestData = await req.json()
    } catch (error) {
      console.error('JSON parse error:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const { email, password, full_name, role } = requestData

    if (!email || !password || !role) {
      return new Response(
        JSON.stringify({ error: 'Email, mot de passe et rôle sont requis' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    if (role !== 'admin' && role !== 'vendeur') {
      return new Response(
        JSON.stringify({ error: 'Le rôle doit être "admin" ou "vendeur"' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users.find(u => u.email === email.trim())

    if (existingUser) {
      // L'utilisateur existe déjà, vérifier s'il a un profil
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, role, full_name')
        .eq('id', existingUser.id)
        .single()

      if (existingProfile) {
        return new Response(
          JSON.stringify({ 
            error: `Un utilisateur avec l'email ${email} existe déjà avec le rôle ${existingProfile.role}. Utilisez "Modifier" pour changer son rôle.`,
            existingUserId: existingUser.id,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 409, // Conflict
          }
        )
      } else {
        // L'utilisateur existe mais n'a pas de profil, créer le profil
        const { error: profileInsertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: existingUser.id,
            full_name: full_name || null,
            role: role,
          })

        if (profileInsertError) {
          console.error('Profile creation error for existing user:', profileInsertError)
          return new Response(
            JSON.stringify({ error: profileInsertError.message || 'Erreur lors de la création du profil' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          )
        }

        // Mettre à jour le mot de passe si fourni
        if (password) {
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            password: password,
          })
        }

        return new Response(
          JSON.stringify({
            success: true,
            user: {
              id: existingUser.id,
              email: existingUser.email,
              role: role,
              full_name: full_name || null,
            },
            message: 'Profil créé pour l\'utilisateur existant',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }
    }

    // Créer l'utilisateur dans Supabase Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true, // Confirmer automatiquement l'email
    })

    if (createError) {
      console.error('User creation error:', createError)
      
      // Gérer l'erreur spécifique "email exists"
      if (createError.code === 'email_exists' || createError.message?.includes('already been registered')) {
        return new Response(
          JSON.stringify({ 
            error: `Un utilisateur avec l'email ${email} existe déjà. Utilisez "Modifier" pour changer son rôle ou utilisez un autre email.`,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 409, // Conflict
          }
        )
      }
      
      return new Response(
        JSON.stringify({ error: createError.message || 'Erreur lors de la création de l\'utilisateur' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    if (!newUser.user) {
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création de l\'utilisateur' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Créer le profil
    const { error: profileInsertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUser.user.id,
        full_name: full_name || null,
        role: role,
      })

    if (profileInsertError) {
      console.error('Profile creation error:', profileInsertError)
      // Si le profil échoue, supprimer l'utilisateur créé
      try {
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      } catch (deleteError) {
        console.error('Error deleting user after profile creation failure:', deleteError)
      }
      return new Response(
        JSON.stringify({ error: profileInsertError.message || 'Erreur lors de la création du profil' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          role: role,
          full_name: full_name || null,
        },
        message: 'Utilisateur créé avec succès',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Erreur inattendue lors de la création de l\'utilisateur',
        details: error.toString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

