import { supabaseAdmin } from "@/lib/supabase";

export async function getPriorColors(): Promise<string[]> {
  const { data } = await supabaseAdmin()
    .from("kickstart_projects")
    .select("primary_color")
    .not("primary_color", "is", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!data) return [];

  const colors = data
    .map((r) => r.primary_color as string)
    .filter((c) => c && /^#[0-9a-fA-F]{6}$/.test(c));

  return [...new Set(colors)].slice(0, 10);
}
