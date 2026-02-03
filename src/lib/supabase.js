import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug: Log if env vars are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Export a function to check connection status
export const checkSupabaseConnection = async () => {
  if (!supabase) {
    return { connected: false, error: 'Supabase client not initialized - environment variables missing' }
  }

  try {
    const { error } = await supabase.from('projects').select('count', { count: 'exact', head: true })
    if (error) {
      return { connected: false, error: error.message }
    }
    return { connected: true, error: null }
  } catch (err) {
    return { connected: false, error: err.message }
  }
}
