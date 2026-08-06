import type { Metadata } from "next";
import { ServicesPageContent } from "@/components/services/services-page";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return <ServicesPageContent />;
}
