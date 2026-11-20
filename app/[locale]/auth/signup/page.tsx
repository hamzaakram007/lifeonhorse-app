"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AuthAlert, AuthShell } from "@/components/auth/AuthShell";
import { authErrorKey } from "@/lib/auth-errors";
import { authCallbackUrl, localizedPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/client";

type Phase = "form" | "check-email";

export default function SignupPage() {
  const t = useTranslations("AuthPages");
  const tAuth = useTranslations("Auth");
  const locale = useLocale();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorKey(null);

    const supabase = createClient();
    const emailRedirectTo = authCallbackUrl(
      window.location.origin,
      "/dashboard",
      locale
    );

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo,
      },
    });

    if (error) {
      setErrorKey(authErrorKey(error.message));
      setLoading(false);
      return;
    }

    // Confirm-email off → session present → go in.
    // Confirm-email on → no session → show clear check-email UX (do NOT fake a login).
    if (data.session) {
      window.location.assign(localizedPath("/dashboard", locale));
      return;
    }

    setPhase("check-email");
    setLoading(false);
  }

  async function resend() {
    setResending(true);
    setResent(false);
    setErrorKey(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: authCallbackUrl(window.location.origin, "/dashboard", locale),
      },
    });
    setResending(false);
    if (error) {
      setErrorKey(authErrorKey(error.message));
      return;
    }
    setResent(true);
  }

  if (phase === "check-email") {
    return (
      <AuthShell
        title={t("checkEmailTitle")}
        subtitle={t("checkEmailSubtitle", { email })}
        footer={
          <p>
            {t("haveAccount")}{" "}
            <Link href="/auth/login" className="font-semibold text-[var(--color-primary)] hover:underline">
              {tAuth("logIn")}
            </Link>
          </p>
        }
      >
        <div className="space-y-4">
          <AuthAlert tone="info">{t("checkEmailHint")}</AuthAlert>
          {resent ? <AuthAlert tone="success">{t("confirmationResent")}</AuthAlert> : null}
          {errorKey ? <AuthAlert>{t(`errors.${errorKey}` as "errors.generic")}</AuthAlert> : null}
          <button
            type="button"
            className="btn btn-secondary w-full"
            onClick={resend}
            disabled={resending}
          >
            {resending ? t("resending") : t("resendConfirmation")}
          </button>
          <Link href="/auth/login" className="btn btn-primary w-full no-underline">
            {t("backToLogin")}
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t("signupTitle")}
      subtitle={t("signupSubtitle")}
      footer={
        <p>
          {t("haveAccount")}{" "}
          <Link href="/auth/login" className="font-semibold text-[var(--color-primary)] hover:underline">
            {tAuth("logIn")}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorKey ? (
          <AuthAlert>
            <p>{t(`errors.${errorKey}` as "errors.generic")}</p>
            {errorKey === "userAlreadyRegistered" ? (
              <Link href="/auth/login" className="mt-2 inline-block font-semibold underline">
                {tAuth("logIn")}
              </Link>
            ) : null}
          </AuthAlert>
        ) : null}
        <div>
          <label className="label" htmlFor="signup-name">
            {t("fullName")}
          </label>
          <input
            id="signup-name"
            className="input"
            autoComplete="name"
            required
            minLength={2}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="signup-email">
            {t("email")}
          </label>
          <input
            id="signup-email"
            className="input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="signup-password">
            {t("password")}
          </label>
          <input
            id="signup-password"
            className="input"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">{t("passwordHint")}</p>
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? t("creating") : tAuth("signUp")}
        </button>
      </form>
    </AuthShell>
  );
}
