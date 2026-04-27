"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setMessage(null);

    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      setLoading(false);
      setMessage("Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.");
      return;
    }

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("Account created. Check email confirmation if Supabase requires it.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === "signin" ? "Sign in" : "Create account"}</CardTitle>
        <CardDescription>Access WeighPro station, reports, admin, and remote clerk controls.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <label className="grid gap-2 text-sm">
          <span className="text-muted-foreground">Email</span>
          <div className="flex h-10 items-center gap-2 rounded-md border bg-background px-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <input className="min-w-0 flex-1 bg-transparent outline-none" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="clerk@company.com" />
          </div>
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-muted-foreground">Password</span>
          <div className="flex h-10 items-center gap-2 rounded-md border bg-background px-3">
            <LockKeyhole className="h-4 w-4 text-muted-foreground" />
            <input className="min-w-0 flex-1 bg-transparent outline-none" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
          </div>
        </label>
        {message ? <div className="rounded-md border bg-muted p-3 text-sm text-muted-foreground">{message}</div> : null}
        <Button onClick={submit} disabled={loading || !email || !password}>
          {loading ? "Please wait" : mode === "signin" ? "Sign in" : "Create account"}
        </Button>
        <Button variant="ghost" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          {mode === "signin" ? "Create a new account" : "Use existing account"}
        </Button>
      </CardContent>
    </Card>
  );
}
