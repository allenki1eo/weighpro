import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="grid min-h-40 place-items-center p-6 text-center">
        <div className="max-w-md">
          <div className="font-medium">{title}</div>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
