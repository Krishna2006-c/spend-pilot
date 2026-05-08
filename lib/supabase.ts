import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  "https://xxiwgfcavgazvobpindm.supabase.co"

const supabaseAnonKey =
  "sb_publishable_22wtPc-T48v6xPwqnzV8_g_m_m-fdPS"

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)