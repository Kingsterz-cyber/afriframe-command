import { createClient } from '@supabase/supabase-js';

// Afriframe Studio production database.
// The anon/publishable key is safe to ship in client code (RLS enforces access).
const SUPABASE_URL =
  import.meta.env.VITE_AFRIFRAME_SUPABASE_URL ?? 'https://cylydjfpqmhzkcsipvmm.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_AFRIFRAME_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5bHlkamZwcW1oemtjc2lwdm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1ODUzODYsImV4cCI6MjEwMTE2MTM4Nn0.dZWZ78kuYcJowPq7IhJ6XRmdz0vnI50ywDiw6CAxejA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
