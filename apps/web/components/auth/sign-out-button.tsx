"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase?.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={signOut}>
      <LogOut />
      Sign out
    </Button>
  );
}
