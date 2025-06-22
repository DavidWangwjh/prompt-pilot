import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { Database } from '@/lib/database.types'

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieStore
    }
  )
} 