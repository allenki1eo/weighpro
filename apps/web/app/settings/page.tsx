import { CheckCircle2, CircleDashed, Settings } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const settingGroups = [
  {
    group: "Infrastructure",
    items: [
      {
        name: "Supabase project",
        description: "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.",
        status: "required",
      },
      {
        name: "Order ingest token",
        description: "Set ORDER_INGEST_TOKEN — used as Bearer token for POST /api/order-notes.",
        status: "required",
      },
    ],
  },
  {
    group: "Hardware",
    items: [
      {
        name: "XK3190-DS1 serial port",
        description: "Configured in the Electron station desktop app. Default: COM3, 9600 baud.",
        status: "station",
      },
      {
        name: "ANPR camera provider",
        description: "Set camera IP and RTSP stream URL in the Admin › Station devices section.",
        status: "optional",
      },
    ],
  },
  {
    group: "Operations",
    items: [
      {
        name: "AMCOS fuel rates",
        description: "Set per-km fuel rates for each AMCOS group under Admin › AMCOS rates.",
        status: "finance",
      },
      {
        name: "User roles & access",
        description: "Assign clerk, supervisor, and admin roles via Supabase Auth dashboard.",
        status: "auth",
      },
      {
        name: "Movement type rules",
        description: "Configure required fields per movement type under Admin › Movement rules.",
        status: "admin",
      },
    ],
  },
];

function statusVariant(status: string) {
  if (status === "required") return "destructive";
  if (status === "optional") return "outline";
  return "secondary";
}

function statusIcon(status: string) {
  if (status === "required") return <CircleDashed className="h-4 w-4 text-destructive" />;
  return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
}

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          System configuration for deployment, security, hardware, and integrations.
        </p>
      </div>

      <div className="grid gap-6">
        {settingGroups.map((group) => (
          <Card key={group.group}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                {group.group}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-0">
              {group.items.map((item, idx) => (
                <div key={item.name}>
                  <div className="flex flex-wrap items-start justify-between gap-3 py-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 shrink-0">{statusIcon(item.status)}</div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Badge variant={statusVariant(item.status) as any} className="shrink-0">
                      {item.status}
                    </Badge>
                  </div>
                  {idx < group.items.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
