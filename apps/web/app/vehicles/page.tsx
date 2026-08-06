import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { formatPricePerDay, listVehicles } from "@/lib/api/vehicles";

export const metadata: Metadata = { title: "Vehicles" };

export default async function VehiclesPage() {
  const { items } = await listVehicles();

  return (
    <Container className="py-16">
      <h1 className="mb-2 font-heading text-3xl font-semibold tracking-tight">Vehicles</h1>
      <p className="mb-8 text-muted-foreground">Browse cars available to rent.</p>

      {items.length === 0 ? (
        <p className="text-muted-foreground">No vehicles available right now.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((vehicle) => (
            <Link key={vehicle.id} href={`/vehicles/${vehicle.slug}`} className="group">
              <Card className="h-full transition-colors group-hover:border-foreground/20">
                <CardHeader>
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {vehicle.category.name}
                  </p>
                  <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {vehicle.brand} {vehicle.model} · {vehicle.year}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.seats} seats · {vehicle.transmission} · {vehicle.fuel}
                  </p>
                  <p className="pt-1 text-base font-semibold">
                    {formatPricePerDay(vehicle.pricePerDay)}
                    <span className="text-sm font-normal text-muted-foreground"> / day</span>
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
