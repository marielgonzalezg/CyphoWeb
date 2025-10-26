import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('no url')
}

if(!supabaseAnonKey){
    throw new Error('no key')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
