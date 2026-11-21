"use client";

import { Suspense, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { AuthAlert, AuthShell } from "@/components/auth/AuthShell";
import { authErrorKey } from "@/lib/auth-errors";
import {
  authCallbackUrl,
  localizedPath,
  safeInternalPath,
  setAuthNextCookie,
} from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const t = useTranslations("AuthPages");
  const tAuth = useTranslations("Auth");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const redirectTo = safeInternalPath(
    searchParams.get("redirect"),
    localizedPath("/dashboard", locale)
  );
  const confirmed = searchParams.get("confirmed") === "1";
  const resetSent = searchParams.get("reset") === "1";
  const linkError = searchParams.get("error") === "link";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(
    linkError ? "linkExpired" : null
  );
  const [info, setInfo] = useState<string | null>(
    confirmed ? t("emailConfirmed") : resetSent ? t("passwordUpdated") : null
  );
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorKey(null);
    setInfo(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorKey(authErrorKey(error.message));
      setLoading(false);
      return;
    }
    window.location.assign(redirectTo);
  }

  async function resendConfirmation() {
    if (!email) {
      setErrorKey("generic");
      setInfo(t("enterEmailFirst"));
      return;
    }
    setResending(true);
    setErrorKey(null);
    const supabase = createClient();
    setAuthNextCookie(redirectTo, locale);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: authCallbackUrl(window.location.origin, redirectTo, locale),
      },
    });
    setResending(false);
    if (error) {
      setErrorKey(authErrorKey(error.message));
      return;
    }
    setInfo(t("confirmationResent"));
  }

  return (
    <AuthShell
      title={t("loginTitle")}
      subtitle={t("loginSubtitle")}
      footer={
        <p>
          {t("noAccount")}{" "}
          <Link href="/auth/signup" className="font-semibold text-[var(--color-primary)] hover:underline">
            {tAuth("signUp")}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {info ? <AuthAlert tone="success">{info}</AuthAlert> : null}
        {errorKey ? (
          <AuthAlert>
            <p>{t(`errors.${errorKey}` as "errors.generic")}</p>
            {errorKey === "emailNotConfirmed" ? (
              <button
                type="button"
                onClick={resendConfirmation}
                disabled={resending}
                className="mt-2 font-semibold underline underline-offset-2"
              >
                {resending ? t("resending") : t("resendConfirmation")}
              </button>
            ) : null}
          </AuthAlert>
        ) : null}

        <div>
          <label className="label" htmlFor="login-email">
            {t("email")}
          </label>
          <input
            id="login-email"
            className="input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between gap-3">
            <label className="label mb-0" htmlFor="login-password">
              {t("password")}
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-primary)]"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <input
            id="login-password"
            className="input"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? t("signingIn") : t("signIn")}
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  const t = useTranslations("AuthPages");
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md py-16 text-center text-[var(--color-muted)]">
          {t("loading")}
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
