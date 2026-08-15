import { getFarmDailyRecordById } from "@/app/actions/farm-actions";
import { notFound } from "next/navigation";
import EditDailyRecordForm from "./edit-form";

export default async function EditDailyRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recordId = Number(id);

  if (isNaN(recordId) || recordId <= 0) {
    notFound();
  }

  const response = await getFarmDailyRecordById(recordId);

  if (!response.success || !response.data) {
    notFound();
  }

  return <EditDailyRecordForm record={response.data} />;
}
