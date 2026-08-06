import type { Metadata } from "next";
import { SimplePage } from "@/components/layout/simple-page";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <SimplePage
      title="About Us"
      description="VRentNow helps you browse and book rental vehicles online — built for a simple, reliable booking experience."
    />
  );
}
