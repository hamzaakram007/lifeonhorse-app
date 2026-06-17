import { createClient } from "@/lib/supabase/server";

export async function checkRateLimit(
  action: string,
  max = 10,
  windowMinutes = 60
): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const identifier = user?.id ?? "anonymous";
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_identifier: identifier,
    p_action: action,
    p_max: max,
    p_window_minutes: windowMinutes,
  });
  if (error) return true;
  return Boolean(data);
}
