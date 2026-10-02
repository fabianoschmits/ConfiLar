import { supabase } from "@/lib/supabase";

/** Sensitive details never travel with public discovery/profile queries. */
export async function withPrivateProfile<T extends { id: string }>(
  profile: T,
): Promise<T> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return profile;
  const { data, error } = await supabase.rpc("get_private_profile", {
    p_user_id: profile.id,
  });
  if (error) throw error;
  return { ...profile, ...(data || {}) };
}
