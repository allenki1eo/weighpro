import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const settings = [
  { name: "Supabase project", status: "Environment variables" },
  { name: "Order ingest token", status: "Required for API" },
  { name: "XK3190 serial port", status: "Station desktop" },
  { name: "ANPR provider", status: "Camera setup" },
  { name: "AMCOS fuel rates", status: "Finance setup" },
  { name: "User roles", status: "Auth setup" },
];

export default function SettingsPage() {
  return <AppShell><div className="mb-5"><h1 className="text-2xl font-semibold tracking-normal">Settings</h1><p className="mt-1 text-sm text-muted-foreground">System configuration for deployment, security, hardware, and integrations.</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{settings.map((setting) => <Card key={setting.name}><CardHeader><CardTitle>{setting.name}</CardTitle><CardDescription>{setting.status}</CardDescription></CardHeader><CardContent><Badge variant="outline">Configure</Badge></CardContent></Card>)}</div></AppShell>;
}
