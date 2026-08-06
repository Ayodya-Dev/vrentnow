import { HomeHero } from "@/components/home/home-hero";
import { HomeHowItWorks } from "@/components/home/home-how-it-works";
import { HomeCollection } from "@/components/home/home-collection";
import { HomeWhyChooseUs } from "@/components/home/home-why-choose-us";
import { listVehicles } from "@/lib/api/vehicles";
import { listCategories } from "@/lib/api/categories";

export default async function HomePage() {
  const [vehiclesPage, categoriesPage] = await Promise.all([
    listVehicles({ page: 1 }).catch(() => ({ items: [], meta: { total: 0, page: 1, limit: 12, totalPages: 0 } })),
    listCategories(1).catch(() => ({
      items: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    })),
  ]);

  return (
    <div className="bg-[#F6F7F9]">
      <HomeHero />
      <HomeHowItWorks />
      <HomeCollection vehicles={vehiclesPage.items} categories={categoriesPage.items} />
      <HomeWhyChooseUs />
    </div>
  );
}
