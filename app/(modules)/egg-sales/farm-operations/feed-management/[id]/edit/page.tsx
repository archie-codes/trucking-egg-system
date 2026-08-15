import { getFarmFeedConsumptionById } from "@/app/actions/farm-actions";
import { notFound } from "next/navigation";
import EditFeedRecordForm from "./edit-form";

export default async function EditFeedRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recordId = Number(id);

  if (isNaN(recordId) || recordId <= 0) {
    notFound();
  }

  const response = await getFarmFeedConsumptionById(recordId);

  if (!response.success || !response.data) {
    notFound();
  }

  return <EditFeedRecordForm record={response.data} />;
}
