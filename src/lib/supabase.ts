import { createClient } from '@supabase/supabase-js';

// Afriframe Studio production database.
// The anon/publishable key is safe to ship in client code (RLS enforces access).
const SUPABASE_URL =
  import.meta.env.VITE_AFRIFRAME_SUPABASE_URL ??
  import.meta.env.VITE_SUPABASE_URL;

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_AFRIFRAME_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
