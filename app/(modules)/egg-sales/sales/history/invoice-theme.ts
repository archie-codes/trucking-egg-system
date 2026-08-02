export interface InvoiceTheme {
  border: string; // Left border accent class
  borderTop: string; // Top border divider class
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardBorder: string;
  cardHeaderBg: string;
  accentHex: string;
}

export const INVOICE_THEMES: InvoiceTheme[] = [
  {
    border: "border-l-blue-500",
    borderTop: "border-t-blue-200 dark:border-t-blue-900/60",
    badgeBg: "bg-blue-50 dark:bg-blue-950/50",
    badgeText: "text-blue-700 dark:text-blue-300",
    badgeBorder: "border-blue-200 dark:border-blue-800/60",
    cardBorder: "border-blue-200 dark:border-blue-900/50",
    cardHeaderBg: "bg-blue-50/60 dark:bg-blue-950/30",
    accentHex: "#3b82f6",
  },
  {
    border: "border-l-emerald-500",
    borderTop: "border-t-emerald-200 dark:border-t-emerald-900/60",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/50",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    badgeBorder: "border-emerald-200 dark:border-emerald-800/60",
    cardBorder: "border-emerald-200 dark:border-emerald-900/50",
    cardHeaderBg: "bg-emerald-50/60 dark:bg-emerald-950/30",
    accentHex: "#10b981",
  },
  {
    border: "border-l-purple-500",
    borderTop: "border-t-purple-200 dark:border-t-purple-900/60",
    badgeBg: "bg-purple-50 dark:bg-purple-950/50",
    badgeText: "text-purple-700 dark:text-purple-300",
    badgeBorder: "border-purple-200 dark:border-purple-800/60",
    cardBorder: "border-purple-200 dark:border-purple-900/50",
    cardHeaderBg: "bg-purple-50/60 dark:bg-purple-950/30",
    accentHex: "#a855f7",
  },
  {
    border: "border-l-amber-500",
    borderTop: "border-t-amber-200 dark:border-t-amber-900/60",
    badgeBg: "bg-amber-50 dark:bg-amber-950/50",
    badgeText: "text-amber-700 dark:text-amber-300",
    badgeBorder: "border-amber-200 dark:border-amber-800/60",
    cardBorder: "border-amber-200 dark:border-amber-900/50",
    cardHeaderBg: "bg-amber-50/60 dark:bg-amber-950/30",
    accentHex: "#f59e0b",
  },
  {
    border: "border-l-indigo-500",
    borderTop: "border-t-indigo-200 dark:border-t-indigo-900/60",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/50",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    badgeBorder: "border-indigo-200 dark:border-indigo-800/60",
    cardBorder: "border-indigo-200 dark:border-indigo-900/50",
    cardHeaderBg: "bg-indigo-50/60 dark:bg-indigo-950/30",
    accentHex: "#6366f1",
  },
  {
    border: "border-l-teal-500",
    borderTop: "border-t-teal-200 dark:border-t-teal-900/60",
    badgeBg: "bg-teal-50 dark:bg-teal-950/50",
    badgeText: "text-teal-700 dark:text-teal-300",
    badgeBorder: "border-teal-200 dark:border-teal-800/60",
    cardBorder: "border-teal-200 dark:border-teal-900/50",
    cardHeaderBg: "bg-teal-50/60 dark:bg-teal-950/30",
    accentHex: "#14b8a6",
  },
  {
    border: "border-l-rose-500",
    borderTop: "border-t-rose-200 dark:border-t-rose-900/60",
    badgeBg: "bg-rose-50 dark:bg-rose-950/50",
    badgeText: "text-rose-700 dark:text-rose-300",
    badgeBorder: "border-rose-200 dark:border-rose-800/60",
    cardBorder: "border-rose-200 dark:border-rose-900/50",
    cardHeaderBg: "bg-rose-50/60 dark:bg-rose-950/30",
    accentHex: "#f43f5e",
  },
  {
    border: "border-l-cyan-500",
    borderTop: "border-t-cyan-200 dark:border-t-cyan-900/60",
    badgeBg: "bg-cyan-50 dark:bg-cyan-950/50",
    badgeText: "text-cyan-700 dark:text-cyan-300",
    badgeBorder: "border-cyan-200 dark:border-cyan-800/60",
    cardBorder: "border-cyan-200 dark:border-cyan-900/50",
    cardHeaderBg: "bg-cyan-50/60 dark:bg-cyan-950/30",
    accentHex: "#06b6d4",
  },
];

export function getInvoiceTheme(invoiceId?: string | null): InvoiceTheme {
  if (!invoiceId) return INVOICE_THEMES[0];
  let hash = 0;
  for (let i = 0; i < invoiceId.length; i++) {
    hash = invoiceId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % INVOICE_THEMES.length;
  return INVOICE_THEMES[index];
}
