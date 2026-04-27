import { Scale } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
      <div className="grid w-full max-w-md gap-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">WeighPro</div>
            <div className="text-sm text-muted-foreground">Secure weighbridge access</div>
          </div>
        </div>
        <AuthForm />
      </div>
    </main>
  );
}
