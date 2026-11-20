/**
 * Map Supabase AuthApiError messages to stable translation keys under AuthPages.errors.*
 * Never expose raw provider noise when we have a clearer UX message.
 */
export type AuthErrorKey =
  | "invalidCredentials"
  | "emailNotConfirmed"
  | "userAlreadyRegistered"
  | "weakPassword"
  | "rateLimited"
  | "samePassword"
  | "sessionExpired"
  | "linkExpired"
  | "generic";

export function authErrorKey(message: string | null | undefined): AuthErrorKey {
  const m = (message ?? "").toLowerCase();
  if (!m) return "generic";
  if (m.includes("email not confirmed") || m.includes("email_not_confirmed")) {
    return "emailNotConfirmed";
  }
  if (
    m.includes("invalid login credentials") ||
    m.includes("invalid credentials") ||
    m.includes("invalid_credentials")
  ) {
    return "invalidCredentials";
  }
  if (
    m.includes("user already registered") ||
    m.includes("already been registered") ||
    m.includes("already registered")
  ) {
    return "userAlreadyRegistered";
  }
  if (m.includes("password") && (m.includes("weak") || m.includes("least"))) {
    return "weakPassword";
  }
  if (m.includes("rate") || m.includes("too many") || m.includes("security purposes")) {
    return "rateLimited";
  }
  if (m.includes("same password") || m.includes("different from the old")) {
    return "samePassword";
  }
  if (m.includes("session") && (m.includes("expired") || m.includes("missing"))) {
    return "sessionExpired";
  }
  return "generic";
}
