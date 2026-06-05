// import { db } from "@/db";
// import { eggSales } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import { notFound } from "next/navigation";
// import { format } from "date-fns";
// import { ArrowLeft, CheckCircle2 } from "lucide-react";
// import { PrintButton } from "./print-button";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";

// export default async function ReceiptPage({
//   params,
// }: {
//   params: Promise<{ invoiceId: string }>;
// }) {
//   const invoiceId = (await params).invoiceId;

//   const items = await db
//     .select()
//     .from(eggSales)
//     .where(eq(eggSales.invoiceId, invoiceId));
//   if (!items || items.length === 0) notFound();

//   const customerName = items[0].customerId;
//   const saleDate = items[0].saleDate;
//   const grandTotal = items.reduce(
//     (sum, item) => sum + Number(item.totalAmount),
//     0,
//   );
//   const totalPaid = items.reduce(
//     (sum, item) => sum + Number(item.amountPaid),
//     0,
//   );
//   const balance = grandTotal - totalPaid;
//   const isFullyPaid = balance <= 0;

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-8 print:bg-white print:p-0">
//       <div className="max-w-2xl mx-auto mb-6 flex justify-between items-center print:hidden">
//         <Link href="/egg-sales/sales/new-sale">
//           <Button variant="outline" className="rounded-xl border-slate-200">
//             <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sales
//           </Button>
//         </Link>
//         <PrintButton />
//       </div>

//       <div className="max-w-2xl mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl p-8 print:shadow-none print:border-none print:rounded-none print:p-4 text-slate-900">
//         <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
//           <div>
//             <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">
//               Otso Dragon Corp
//             </h1>
//             <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">
//               Egg Delivery Receipt
//             </p>
//           </div>
//           <div className="text-right">
//             <p className="text-xs font-bold text-slate-500 uppercase mb-1">
//               Invoice No.
//             </p>
//             <p className="font-mono font-bold text-lg">{invoiceId}</p>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-8 mb-8">
//           <div>
//             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
//               Billed To
//             </p>
//             <p className="text-lg font-black uppercase text-slate-900">
//               {customerName}
//             </p>
//           </div>
//           <div className="text-right">
//             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
//               Date Delivered
//             </p>
//             <p className="text-base font-bold text-slate-900">
//               {format(new Date(saleDate), "MMMM dd, yyyy")}
//             </p>
//           </div>
//         </div>

//         <table className="w-full mb-8">
//           <thead>
//             <tr className="border-b-2 border-slate-200 text-left">
//               <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
//                 Item / Size
//               </th>
//               <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
//                 Qty (Trays)
//               </th>
//               <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
//                 Price
//               </th>
//               <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
//                 Amount
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {items.map((item) => (
//               <tr key={item.id}>
//                 <td className="py-3 font-bold uppercase">
//                   {item.classification}
//                 </td>
//                 <td className="py-3 font-mono text-center">
//                   {item.quantityTrays}
//                 </td>
//                 <td className="py-3 font-mono text-right">
//                   ₱{Number(item.pricePerTray).toLocaleString()}
//                 </td>
//                 <td className="py-3 font-mono font-bold text-right">
//                   ₱{Number(item.totalAmount).toLocaleString()}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <div className="w-full max-w-xs ml-auto space-y-2">
//           <div className="flex justify-between items-center text-sm">
//             <span className="font-bold text-slate-500 uppercase">
//               Grand Total
//             </span>
//             <span className="font-mono font-black text-lg">
//               ₱{grandTotal.toLocaleString()}
//             </span>
//           </div>
//           <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
//             <span className="font-bold text-slate-500 uppercase">
//               Amount Paid
//             </span>
//             <span className="font-mono font-bold">
//               ₱{totalPaid.toLocaleString()}
//             </span>
//           </div>
//           <div className="flex justify-between items-center pt-1">
//             <span className="font-bold text-slate-800 uppercase tracking-wider">
//               Balance Due
//             </span>
//             <span className="font-mono font-black text-xl">
//               ₱{balance > 0 ? balance.toLocaleString() : "0.00"}
//             </span>
//           </div>
//         </div>

//         <div className="mt-12 flex justify-between items-end">
//           <div className="text-sm font-medium text-slate-400">
//             <p>Received by:</p>
//             <div className="mt-8 border-t border-slate-400 w-48 pt-1 text-center text-xs uppercase">
//               Signature over printed name
//             </div>
//           </div>
//           {isFullyPaid && (
//             <div className="border-4 border-emerald-500 text-emerald-500 p-3 rounded-xl transform -rotate-6 opacity-80 print:border-black print:text-black">
//               <p className="text-2xl font-black uppercase tracking-widest flex items-center gap-2">
//                 <CheckCircle2 className="w-6 h-6" /> Paid in Full
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import { db } from "@/db";
import { eggSales } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { PrintButton } from "./print-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const invoiceId = (await params).invoiceId;

  const items = await db
    .select()
    .from(eggSales)
    .where(eq(eggSales.invoiceId, invoiceId));
  if (!items || items.length === 0) notFound();

  const customerName = items[0].customerId;
  const saleDate = items[0].saleDate;
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-8 print:bg-white print:p-0">
      <div className="max-w-2xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link href="/egg-sales/sales/new-sale">
          <Button variant="outline" className="rounded-xl border-slate-200">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sales
          </Button>
        </Link>
        <PrintButton />
      </div>

      <div className="max-w-2xl mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl p-8 print:shadow-none print:border-none print:rounded-none print:p-4 text-slate-900">
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">
              Otso Dragon Corp
            </h1>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">
              Egg Delivery Receipt
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">
              Invoice No.
            </p>
            <p className="font-mono font-bold text-lg">{invoiceId}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Billed To
            </p>
            <p className="text-lg font-black uppercase text-slate-900">
              {customerName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Date Delivered
            </p>
            <p className="text-base font-bold text-slate-900">
              {format(new Date(saleDate), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-slate-200 text-left">
              <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Item / Size
              </th>
              <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                Qty (Trays)
              </th>
              <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                Price
              </th>
              <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="py-3 font-bold uppercase">
                  {item.classification}
                </td>
                <td className="py-3 font-mono text-center">
                  {item.quantityTrays}
                </td>
                <td className="py-3 font-mono text-right">
                  ₱{Number(item.pricePerTray).toLocaleString()}
                </td>
                <td className="py-3 font-mono font-bold text-right">
                  ₱{Number(item.totalAmount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="w-full max-w-xs ml-auto space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-slate-500 uppercase">
              Grand Total
            </span>
            <span className="font-mono font-black text-lg">
              ₱{grandTotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-500 uppercase">
              Amount Paid
            </span>
            <span className="font-mono font-bold">
              ₱{totalPaid.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="font-bold text-slate-800 uppercase tracking-wider">
              Balance Due
            </span>
            <span className="font-mono font-black text-xl">
              ₱{balance > 0 ? balance.toLocaleString() : "0.00"}
            </span>
          </div>
        </div>

        <div className="mt-12 flex justify-between items-end">
          <div className="text-sm font-medium text-slate-400">
            <p>Received by:</p>
            <div className="mt-8 border-t border-slate-400 w-48 pt-1 text-center text-xs uppercase">
              Signature over printed name
            </div>
          </div>
          {isFullyPaid && (
            <div className="border-4 border-emerald-500 text-emerald-500 p-3 rounded-xl transform -rotate-6 opacity-80 print:border-black print:text-black">
              <p className="text-2xl font-black uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" /> Paid in Full
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
