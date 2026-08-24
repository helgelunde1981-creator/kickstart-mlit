import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Klienten lages først når den brukes. Tidligere ble den laget på modulnivå med
// `process.env.X!`, som gjorde at en manglende variabel ga en ubrukelig
// "Invalid URL"-feil midt i en request i stedet for en tydelig melding.
let cached: SupabaseClient | null = null;

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} mangler. Kjør appen via Doppler (\`doppler run -- pnpm dev\`) — se AGENTS.md.`,
    );
  }
  return value;
}

export function supabaseAdmin(): SupabaseClient {
  if (!cached) {
    cached = createClient(
      required("NEXT_PUBLIC_SUPABASE_URL"),
      required("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }
  return cached;
}
