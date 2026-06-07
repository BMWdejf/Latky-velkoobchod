import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Shown to approved `client` role users. Sections are placeholders — real
 * orders/invoices/prices data is wired up in follow-up issues.
 */
export function ClientDashboard({ name }: { name?: string | null }) {
  const sections = [
    { title: "Objednávky", desc: "Vaše aktuální i minulé objednávky." },
    { title: "Faktury", desc: "Vystavené faktury ke stažení." },
    { title: "Ceny", desc: "Vaše individuální ceník a podmínky." },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Vítejte{name ? `, ${name}` : ""}
        </h1>
        <p className="text-muted-foreground">Přehled vašeho účtu.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.desc}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Připravujeme.
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
