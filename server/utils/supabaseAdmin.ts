import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdminClient() {
  const config = useRuntimeConfig()

  return createClient(
    config.supabaseUrl,
    config.supabaseSecretKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  )
}