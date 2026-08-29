import { db } from "@/db";
import { eggSales } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { PrintControls } from "./print-controls";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ invoiceId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const invoiceId = (await params).invoiceId;
  const resolvedSearchParams = await searchParams;
  const fromParam = resolvedSearchParams.from;
  const backHref =
    fromParam === "history"
      ? "/egg-sales/sales/history"
      : fromParam === "summary"
        ? "/egg-sales/sales/summary"
        : "/egg-sales/sales/new-sale";

  const backLabel =
    fromParam === "history"
      ? "Back to Sales History"
      : fromParam === "summary"
        ? "Back to Summary"
        : "Back to Sales";

  const items = await db
    .select()
    .from(eggSales)
    .where(eq(eggSales.invoiceId, invoiceId));
  if (!items || items.length === 0) notFound();

  const customerName = items[0].customerId;
  const saleDate = items[0].saleDate;
  const preparedBy = items[0].preparedBy || "System";
  const grandTotal = items.reduce(
    (sum, item) => sum + Number(item.totalAmount),
    0,
  );
  const totalPaid = items.reduce(
    (sum, item) => sum + Number(item.amountPaid),
    0,
  );
  const balance = grandTotal - totalPaid;
  const isFullyPaid = balance <= 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-8 print:bg-white print:p-0 print:min-h-0">
      <style>{`
        @media print {
          #invoice-receipt {
            zoom: var(--print-scale, 1);
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Top Bar (Navigation & Print Controls) */}
      <div className="max-w-2xl mx-auto mb-3 flex flex-wrap justify-between items-center gap-3 print:hidden">
        <Link href={backHref}>
          <Button
            variant="outline"
            className="rounded-xl h-10 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> {backLabel}
          </Button>
        </Link>
        <PrintControls itemCount={items.length} />
      </div>

      {/* Printable Invoice Card */}
      <div
        id="invoice-receipt"
        className="max-w-2xl mx-auto bg-white border border-slate-200 shadow-xl rounded-xl p-8 print:shadow-none print:border-2 print:border-slate-800 print:rounded-xl print:p-5 print:max-w-none print:w-full print-page-fit text-slate-900"
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6 print:pb-2.5 print:mb-2.5">
          <div>
            <h1 className="text-3xl print:text-2xl font-black uppercase tracking-tight text-slate-900">
              Otso Dragon Corp
            </h1>
            <p className="text-sm print:text-xs font-medium text-slate-500 uppercase tracking-widest mt-1 print:mt-0.5">
              Egg Delivery Receipt
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs print:text-[10px] font-bold text-slate-500 uppercase mb-1 print:mb-0">
              Invoice No.
            </p>
            <p className="font-mono font-bold text-lg print:text-base">
              {invoiceId}
            </p>
          </div>
        </div>

        {/* Customer & Date Delivered */}
        <div className="grid grid-cols-2 gap-8 mb-8 print:gap-3 print:mb-2.5">
          <div>
            <p className="text-[10px] print:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 print:mb-0">
              Billed To
            </p>
            <p className="text-lg print:text-base font-black uppercase text-slate-900">
              {customerName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] print:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 print:mb-0">
              Date Delivered
            </p>
            <p className="text-base print:text-sm font-bold text-slate-900">
              {format(new Date(saleDate), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-8 print:mb-2.5">
          <thead>
            <tr className="border-b-2 border-slate-200 text-left">
              <th className="py-3 print:py-1 text-xs print:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Item / Size
              </th>
              <th className="py-3 print:py-1 text-xs print:text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                Qty (Trays + Pcs)
              </th>
              <th className="py-3 print:py-1 text-xs print:text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                Price
              </th>
              <th className="py-3 print:py-1 text-xs print:text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="py-3 print:py-1 text-sm print:text-xs font-bold uppercase">
                  {item.classification}
                </td>
                <td className="py-3 print:py-1 text-sm print:text-xs font-mono text-center">
                  {item.quantityTrays}{" "}
                  {item.quantityTrays === 1 ? "tray" : "trays"}
                  {item.quantityPieces > 0 && (
                    <span className="text-xs print:text-[10px] text-slate-500 ml-1">
                      (+{item.quantityPieces} pcs)
                    </span>
                  )}
                  {item.palitBasag > 0 && (
                    <span className="text-xs print:text-[10px] text-purple-600 dark:text-purple-400 font-bold ml-1">
                      (+{item.palitBasag} free)
                    </span>
                  )}
                </td>
                <td className="py-3 print:py-1 text-sm print:text-xs font-mono text-right">
                  ₱{Number(item.pricePerTray).toLocaleString()}
                </td>
                <td className="py-3 print:py-1 text-sm print:text-xs font-mono font-bold text-right">
                  ₱{Number(item.totalAmount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Financial Summary */}
        <div className="w-full max-w-xs ml-auto space-y-2 print:space-y-1">
          <div className="flex justify-between items-center text-sm print:text-xs">
            <span className="font-bold text-slate-500 uppercase">
              Grand Total
            </span>
            <span className="font-mono font-black text-lg print:text-sm">
              ₱{grandTotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm print:text-xs border-b border-slate-200 pb-2 print:pb-1">
            <span className="font-bold text-slate-500 uppercase">
              Amount Paid
            </span>
            <span className="font-mono font-bold">
              ₱{totalPaid.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1 print:pt-0.5">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-sm print:text-xs">
              Balance Due
            </span>
            <span className="font-mono font-black text-xl print:text-base">
              ₱{balance > 0 ? balance.toLocaleString() : "0.00"}
            </span>
          </div>
        </div>

        {/* Signatures & Stamp */}
        <div className="mt-12 print:mt-3 flex flex-wrap justify-between items-end gap-6 print:gap-3 pt-6 print:pt-2.5 border-t border-slate-200">
          <div className="text-sm font-medium text-slate-700">
            <p className="text-[10px] print:text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Prepared / Released By:
            </p>
            <p className="text-sm print:text-xs font-bold text-slate-900 mt-1 print:mt-0.5 capitalize">
              {preparedBy}
            </p>
            <div className="mt-8 print:mt-3.5 border-t border-slate-400 w-44 print:w-36 pt-1 text-center text-xs print:text-[9px] text-slate-400 uppercase">
              Authorized Signature
            </div>
          </div>

          <div className="text-sm font-medium text-slate-700">
            <p className="text-[10px] print:text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Received By:
            </p>
            <div className="mt-12 print:mt-5.5 border-t border-slate-400 w-44 print:w-36 pt-1 text-center text-xs print:text-[9px] text-slate-400 uppercase">
              Signature over printed name
            </div>
          </div>

          {isFullyPaid && (
            <div className="border-4 print:border-2 border-emerald-500 text-emerald-500 p-3 print:p-1.5 print:px-2.5 rounded-xl transform -rotate-6 print:rotate-0 opacity-80 print:opacity-100 print:border-slate-900 print:text-slate-900">
              <p className="text-2xl print:text-xs font-black uppercase tracking-widest flex items-center gap-2 print:gap-1">
                <CheckCircle2 className="w-6 h-6 print:w-3.5 print:h-3.5" />{" "}
                Paid in Full
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
