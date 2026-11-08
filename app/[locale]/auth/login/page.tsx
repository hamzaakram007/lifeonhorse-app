"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const t = useTranslations("AuthPages");
  const tAuth = useTranslations("Auth");
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    window.location.href = redirectTo.startsWith("/") ? redirectTo : "/dashboard";
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-serif text-2xl font-bold">{t("loginTitle")}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <div>
          <label className="label">{t("email")}</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">{t("password")}</label>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? t("signingIn") : t("signIn")}
        </button>
      </form>
      <p className="mt-4 text-sm">
        {t("noAccount")}{" "}
        <Link href="/auth/signup">{tAuth("signUp")}</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  const t = useTranslations("AuthPages");
  return (
    <Suspense fallback={<div className="mx-auto max-w-md py-12 text-center text-[var(--color-muted)]">{t("loading")}</div>}>
      <LoginForm />
    </Suspense>
  );
}
