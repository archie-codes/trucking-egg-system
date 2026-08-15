import { getFarmFlockById } from "@/app/actions/farm-actions";
import { notFound } from "next/navigation";
import EditFlockForm from "./edit-form";

export default async function EditFlockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const flockId = Number(id);

  if (isNaN(flockId) || flockId <= 0) {
    notFound();
  }

  const response = await getFarmFlockById(flockId);

  if (!response.success || !response.data) {
    notFound();
  }

  return <EditFlockForm flock={response.data} />;
}
