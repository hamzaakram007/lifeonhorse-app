"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AuthAlert, AuthShell } from "@/components/auth/AuthShell";
import { authErrorKey } from "@/lib/auth-errors";
import { authCallbackUrl, setAuthNextCookie } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const t = useTranslations("AuthPages");
  const tAuth = useTranslations("Auth");
  const locale = useLocale();

  const [email, setEmail] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorKey(null);

    const supabase = createClient();
    // Cookie backup if GoTrue strips ?next= or falls back toward Site URL.
    setAuthNextCookie("/auth/reset-password", locale);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: authCallbackUrl(window.location.origin, "/auth/reset-password", locale),
    });

    setLoading(false);
    if (error) {
      setErrorKey(authErrorKey(error.message));
      return;
    }
    // Always show success to avoid email enumeration.
    setSent(true);
  }

  return (
    <AuthShell
      title={t("forgotTitle")}
      subtitle={t("forgotSubtitle")}
      footer={
        <p>
          <Link href="/auth/login" className="font-semibold text-[var(--color-primary)] hover:underline">
            {t("backToLogin")}
          </Link>
          {" · "}
          <Link href="/auth/signup" className="font-semibold text-[var(--color-primary)] hover:underline">
            {tAuth("signUp")}
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="space-y-4">
          <AuthAlert tone="success">{t("forgotSent", { email })}</AuthAlert>
          <AuthAlert tone="info">{t("forgotHint")}</AuthAlert>
          <Link href="/auth/login" className="btn btn-primary w-full no-underline">
            {t("backToLogin")}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorKey ? <AuthAlert>{t(`errors.${errorKey}` as "errors.generic")}</AuthAlert> : null}
          <div>
            <label className="label" htmlFor="forgot-email">
              {t("email")}
            </label>
            <input
              id="forgot-email"
              className="input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? t("sendingReset") : t("sendResetLink")}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
