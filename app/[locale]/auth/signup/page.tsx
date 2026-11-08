"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const t = useTranslations("AuthPages");
  const tAuth = useTranslations("Auth");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    window.location.href = "/dashboard";
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">{t("signupTitle")}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <div>
          <label className="label">{t("fullName")}</label>
          <input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="label">{t("email")}</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">{t("password")}</label>
          <input className="input" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? t("creating") : tAuth("signUp")}
        </button>
      </form>
      <p className="mt-4 text-sm">
        {t("haveAccount")} <Link href="/auth/login">{tAuth("logIn")}</Link>
      </p>
    </div>
  );
}
