"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ClipboardCheck,
  FileCheck2,
  Fuel,
  History,
  Link2,
  Package,
  ReceiptText,
  Scale,
  Settings,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/auth/sign-out-button";

const nav = [
  { label: "Station", href: "/", icon: Scale },
  { label: "Movements", href: "/movements", icon: ClipboardCheck },
  { label: "Raw cotton", href: "/raw-cotton", icon: Fuel },
  { label: "Tickets", href: "/tickets", icon: FileCheck2 },
  { label: "Vehicles & Drivers", href: "/vehicles", icon: Truck },
  { label: "Customers / Suppliers / AMCOS", href: "/counterparties", icon: Users },
  { label: "Materials & Products", href: "/materials", icon: Boxes },
  { label: "Orders / Integrations", href: "/integrations", icon: Link2 },
  { label: "Approvals", href: "/approvals", icon: ShieldCheck },
  { label: "Audit Logs", href: "/audit-logs", icon: History },
  { label: "Reports", href: "/reports", icon: ReceiptText },
  { label: "Admin", href: "/admin", icon: Package },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-[260px_1fr] max-lg:grid-cols-1">
        <aside className="flex flex-col border-r bg-card/70 px-4 py-5 max-lg:border-b max-lg:border-r-0">
          <Link className="mb-7 flex items-center gap-3" href="/">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">WeighPro</div>
              <div className="text-xs text-muted-foreground">Full weighbridge system</div>
            </div>
          </Link>
          <nav className="grid gap-1 max-lg:flex max-lg:overflow-x-auto max-lg:pb-2" aria-label="Main navigation">
            {nav.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  className={cn(
                    "flex min-h-10 items-center gap-2 rounded-md px-3 text-sm transition-colors max-lg:shrink-0",
                    active ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-secondary/60",
                  )}
                  href={item.href}
                  key={item.href}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto pt-6 max-lg:hidden">
            <SignOutButton />
          </div>
        </aside>
        <section className="min-w-0 p-5 lg:p-6">{children}</section>
      </div>
    </main>
  );
}
