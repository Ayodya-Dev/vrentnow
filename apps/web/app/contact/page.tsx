import type { Metadata } from "next";
import { ContactContent } from "@/components/contact/contact-content";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Have a question about a booking or vehicle? Reach out to our team — we're here to ensure your premium VR experience is seamless.",
};

export default function ContactPage() {
  return <ContactContent />;
}

