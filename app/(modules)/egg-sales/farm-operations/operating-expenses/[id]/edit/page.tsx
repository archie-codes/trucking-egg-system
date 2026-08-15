import { getFarmOperatingExpenseById } from "@/app/actions/farm-actions";
import { notFound } from "next/navigation";
import EditOperatingExpenseForm from "./edit-form";

export default async function EditOperatingExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recordId = Number(id);

  if (isNaN(recordId) || recordId <= 0) {
    notFound();
  }

  const response = await getFarmOperatingExpenseById(recordId);

  if (!response.success || !response.data) {
    notFound();
  }

  return <EditOperatingExpenseForm record={response.data} />;
}
