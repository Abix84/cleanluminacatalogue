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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) {
      throw new Error('Invalid JWT')
    }

    const { imageUrl } = await req.json()

    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.includes('placeholder.svg')) {
      return new Response(JSON.stringify({ message: 'No valid image URL provided or it is a placeholder.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const urlParts = imageUrl.split('/')
    const filePath = urlParts.slice(urlParts.indexOf('product-images') + 1).join('/')

    if (!filePath) {
      throw new Error('Could not parse file path from URL')
    }

    const { error } = await supabaseAdmin.storage
      .from('product-images')
      .remove([filePath])

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ message: 'Image deleted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})