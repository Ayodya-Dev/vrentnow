import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { CustomerDetail } from "@/features/customers/customer-detail";

export const metadata: Metadata = { title: "Customer" };

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const roles = session?.user?.roles ?? [];

  return <CustomerDetail id={id} roles={roles} />;
}
