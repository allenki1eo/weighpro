"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ClipboardCheck,
  FileCheck2,
  Fuel,
  History,
  Link2,
  Menu,
  Package,
  ReceiptText,
  Scale,
  Settings,
  ShieldCheck,
  Truck,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/auth/sign-out-button";

const nav = [
  { label: "Station", href: "/", icon: Scale },
  { label: "Movements", href: "/movements", icon: ClipboardCheck },
  { label: "Raw Cotton", href: "/raw-cotton", icon: Fuel },
  { label: "Tickets", href: "/tickets", icon: FileCheck2 },
  { label: "Vehicles & Drivers", href: "/vehicles", icon: Truck },
  { label: "Counterparties", href: "/counterparties", icon: Users },
  { label: "Materials", href: "/materials", icon: Boxes },
  { label: "Integrations", href: "/integrations", icon: Link2 },
  { label: "Approvals", href: "/approvals", icon: ShieldCheck },
  { label: "Audit Logs", href: "/audit-logs", icon: History },
  { label: "Reports", href: "/reports", icon: ReceiptText },
  { label: "Admin", href: "/admin", icon: Package },
  { label: "Settings", href: "/settings", icon: Settings },
];

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col px-4 py-5">
      <Link className="mb-6 flex items-center gap-3" href="/" onClick={onLinkClick}>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Scale className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">WeighPro</div>
          <div className="text-xs text-muted-foreground">Full weighbridge system</div>
        </div>
      </Link>

      <nav className="grid flex-1 gap-0.5" aria-label="Main navigation">
        {nav.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex h-9 items-center gap-2.5 rounded-md px-3 text-sm transition-colors",
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t pt-4">
        <SignOutButton />
      </div>
    </div>
  );
}

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Desktop sidebar ───────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-card/60 backdrop-blur-sm lg:block">
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay backdrop ────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Mobile sidebar drawer ─────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r bg-card transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Mobile navigation"
      >
        <button
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent onLinkClick={() => setMobileOpen(false)} />
      </aside>

      {/* ── Main content area ─────────────────────────────────── */}
      <div className="lg:pl-64">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur-sm lg:hidden">
          <button
            className="grid h-9 w-9 place-items-center rounded-md border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <Scale className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold">WeighPro</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
