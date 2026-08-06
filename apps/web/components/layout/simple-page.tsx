import { Container } from "@/components/layout/container";

export function SimplePage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Container className="max-w-3xl py-20">
      <h1 className="mb-4 font-heading text-4xl font-bold tracking-tight text-[#1D1F23]">
        {title}
      </h1>
      <p className="text-lg leading-relaxed text-[#6B7280]">{description}</p>
    </Container>
  );
}
