"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Shown to `customer` role users — registered & verified but not yet approved.
 * They see only this notice and nothing else.
 */
export function PendingApproval() {
  useEffect(() => {
    toast.info("Váš účet zatím nebyl schválen.");
  }, []);

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Účet čeká na schválení</CardTitle>
        <CardDescription>
          Váš účet byl vytvořen a e-mail ověřen.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Než vám správce schválí přístup, nemáte k dispozici žádné další funkce.
        Jakmile bude účet schválen, uvidíte zde své objednávky, faktury a ceny.
      </CardContent>
    </Card>
  );
}
