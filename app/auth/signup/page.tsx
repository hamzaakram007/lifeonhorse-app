"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
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
      <h1 className="text-2xl font-bold">Create account</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <div><label className="label">Full name</label><input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        <div><label className="label">Email</label><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label">Password</label><input className="input" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? "Creating..." : "Sign up"}</button>
      </form>
      <p className="mt-4 text-sm">Have an account? <Link href="/auth/login">Log in</Link></p>
    </div>
  );
}
