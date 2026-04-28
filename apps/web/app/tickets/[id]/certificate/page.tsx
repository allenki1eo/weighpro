import { notFound } from "next/navigation";
import { WeighCertificate } from "@/components/tickets/weigh-certificate";
import { tickets } from "@/lib/sample-data";

export default async function CertificatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { id } = await params;
  const { print } = await searchParams;
  const ticket = tickets.find((t) => t.id === decodeURIComponent(id));

  if (!ticket) notFound();

  return <WeighCertificate ticket={ticket} autoPrint={print === "1"} />;
}
