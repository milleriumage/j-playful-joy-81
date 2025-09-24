import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔧 Fixing media_items RLS policies for public read access...')

    // Drop existing restrictive policy
    await supabaseClient.rpc('exec_sql', {
      sql: `DROP POLICY IF EXISTS "Users can view own media only" ON media_items;`
    })

    // Create public read policy
    await supabaseClient.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Public read access to media items" 
        ON media_items 
        FOR SELECT 
        USING (true);
      `
    })

    // Ensure proper write policies exist
    await supabaseClient.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can manage own media" ON media_items;
        CREATE POLICY "Users can manage own media" 
        ON media_items 
        FOR ALL
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
      `
    })

    console.log('✅ Media policies fixed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Media RLS policies fixed - visitors can now see creator media' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ Error fixing media policies:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})