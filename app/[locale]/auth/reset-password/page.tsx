"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AuthAlert, AuthShell } from "@/components/auth/AuthShell";
import { authErrorKey } from "@/lib/auth-errors";
import { localizedPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const t = useTranslations("AuthPages");
  const locale = useLocale();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (!cancelled) {
        setHasSession(!!data.session);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setErrorKey(null);

    if (password.length < 8) {
      setFormError(t("passwordHint"));
      return;
    }
    if (password !== confirm) {
      setFormError(t("passwordMismatch"));
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setErrorKey(authErrorKey(error.message));
      return;
    }

    window.location.assign(
      `${localizedPath("/auth/login", locale)}?reset=1`
    );
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-[var(--color-muted)]">
        {t("loading")}
      </div>
    );
  }

  if (!hasSession) {
    return (
      <AuthShell title={t("resetTitle")} subtitle={t("resetInvalidLink")}>
        <div className="space-y-4">
          <AuthAlert>{t("errors.sessionExpired")}</AuthAlert>
          <Link href="/auth/forgot-password" className="btn btn-primary w-full no-underline">
            {t("sendResetLink")}
          </Link>
          <Link href="/auth/login" className="btn btn-secondary w-full no-underline">
            {t("backToLogin")}
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("resetTitle")} subtitle={t("resetSubtitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError ? <AuthAlert>{formError}</AuthAlert> : null}
        {errorKey ? <AuthAlert>{t(`errors.${errorKey}` as "errors.generic")}</AuthAlert> : null}
        <div>
          <label className="label" htmlFor="reset-password">
            {t("newPassword")}
          </label>
          <input
            id="reset-password"
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
        <div>
          <label className="label" htmlFor="reset-confirm">
            {t("confirmPassword")}
          </label>
          <input
            id="reset-confirm"
            className="input"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? t("updatingPassword") : t("updatePassword")}
        </button>
      </form>
    </AuthShell>
  );
}
