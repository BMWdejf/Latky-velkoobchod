import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Placeholder admin dashboard. Real admin features land in follow-up issues. */
export function AdminShell({ name }: { name?: string | null }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Administrace</h1>
        <p className="text-muted-foreground">
          Vítejte{name ? `, ${name}` : ""}. Toto je administrační panel.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Uživatelé", desc: "Správa a schvalování zákazníků." },
          { title: "Objednávky", desc: "Přehled objednávek." },
          { title: "Nastavení", desc: "Konfigurace systému." },
        ].map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.desc}</CardDescription>
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
