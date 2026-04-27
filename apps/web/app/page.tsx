import Link from "next/link";
import { PackageCheck, RefreshCcw, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { WeighWorkbench } from "@/components/station/weigh-workbench";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function Home() {
  return (
    <AppShell>
      <div className="mb-5 flex items-start justify-between gap-4 max-md:flex-col">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Weighbridge control</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real station weighing, movement matching, hardware capture, audit, and remote clerk controls.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className={buttonVariants({ variant: "outline" })} href="/tickets">
            <Search />
            Search ticket
          </Link>
          <Button variant="outline">
            <RefreshCcw />
            Refresh
          </Button>
          <Link className={buttonVariants()} href="/tickets">
            <PackageCheck />
            New weigh
          </Link>
        </div>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardDescription>Pending movement notes</CardDescription><CardTitle className="text-2xl">0</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Second weighs waiting</CardDescription><CardTitle className="text-2xl">0</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Completed today</CardDescription><CardTitle className="text-2xl">0</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>AMCOS fuel payable</CardDescription><CardTitle className="text-2xl">0 TZS</CardTitle></CardHeader></Card>
      </div>

      <div className="mb-4">
        <WeighWorkbench devices={[]} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <EmptyState
          title="No real tickets yet"
          description="Open a ticket above, capture the first stable weight, then save the second weigh when the vehicle returns. The app no longer displays dummy tickets."
        />
        <EmptyState
          title="Connect your integrations"
          description="Use /api/order-notes for request notes and /api/camera-reads for ANPR reads. Both write real Supabase records when your environment variables are configured."
        />
      </div>
    </AppShell>
  );
}
