import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';


/**
 * Supabase Client Configuration
 * 
 * Creates and exports Supabase client instance for storage operations:
 * - Image uploads for chat messages
 * - Profile picture storage
 * 
 * Auth settings disabled since Firebase handles authentication
 */
export const supabase = createClient(
  environment.supabase.url,
  environment.supabase.publicKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);