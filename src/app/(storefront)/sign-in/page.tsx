"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(params.get("from") ?? "/account");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="glass space-y-4 rounded-[var(--radius)] p-8">
      <div>
        <Label>Email</Label>
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div>
        <Label>Password</Label>
        <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted">
        No account?{" "}
        <Link href="/sign-up" className="text-[var(--accent)] hover:underline">Create one</Link>
      </p>
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]" /></div>
        <div className="relative flex justify-center text-xs text-muted"><span className="bg-[var(--surface)] px-2">or</span></div>
      </div>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/account" })}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--surface-3)]"
      >
        <GoogleIcon />
        Continue with Google
      </button>
      <p className="rounded-lg bg-[var(--surface-2)] p-3 text-center text-xs text-muted">
        Demo: customer@nova.test · Customer@12345
      </p>
    </form>
  );
}

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-2 text-center text-3xl font-bold tracking-tight">Welcome back</h1>
      <p className="mb-8 text-center text-muted">Sign in to your A Sports Zone account</p>
      <Suspense fallback={<div className="skeleton h-80 rounded-[var(--radius)]" />}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
