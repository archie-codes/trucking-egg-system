// app/(modules)/layout.tsx
import { getSystemLockStatus } from "@/app/actions/admin-actions";
import { redirect } from "next/navigation";

// ✨ CRITICAL FIX: Forces Next.js to check the DB on every request, ignoring cache.
export const dynamic = "force-dynamic";

export default async function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = await getSystemLockStatus();

  // If the DB says it is locked, kick them out instantly.
  if (status.isLocked) {
    redirect("/system-locked");
  }

  // If unlocked, let them see the app.
  return <>{children}</>;
}
