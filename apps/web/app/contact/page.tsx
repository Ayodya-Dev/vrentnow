import type { Metadata } from "next";
import { SimplePage } from "@/components/layout/simple-page";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <SimplePage
      title="Contact"
      description="Have a question about a booking or vehicle? Reach out to our team — a full contact form is coming next."
    />
  );
}
