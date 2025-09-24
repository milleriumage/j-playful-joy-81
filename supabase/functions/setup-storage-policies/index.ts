import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create the media bucket if it doesn't exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      throw listError;
    }

    const mediaBucket = buckets?.find(bucket => bucket.name === 'media');
    
    if (!mediaBucket) {
      console.log('Creating media bucket...');
      const { error: createError } = await supabase.storage.createBucket('media', {
        public: true,
        allowedMimeTypes: [
          'image/jpeg',
          'image/png', 
          'image/gif',
          'image/webp',
          'video/mp4',
          'video/webm',
          'video/ogg'
        ],
        fileSizeLimit: 52428800 // 50MB
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        throw createError;
      }
    }

    // Create RLS policy for public read access to media bucket
    const { error: policyError } = await supabase.rpc('create_storage_policy', {
      policy_name: 'Public read access for media',
      bucket_name: 'media',
      policy_definition: "true",
      policy_command: 'SELECT'
    });

    if (policyError) {
      console.log('Policy may already exist or RPC not available, trying direct SQL...');
      
      // Try direct SQL approach with correct USING clause
      const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE POLICY IF NOT EXISTS "Public read access for media" 
          ON storage.objects 
          FOR SELECT 
          USING (true);
        `
      });

      if (sqlError) {
        console.error('SQL policy creation error:', sqlError);
        throw sqlError; // É importante lançar o erro aqui para saber se a política falhou
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Storage bucket and policies configured successfully",
        bucket_exists: true,
        policy_configured: true
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Setup error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});