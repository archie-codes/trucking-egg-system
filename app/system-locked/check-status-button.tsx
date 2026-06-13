"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { getSystemLockStatus } from "@/app/actions/admin-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CheckStatusButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleCheckStatus() {
    setIsLoading(true);
    try {
      const status = await getSystemLockStatus();
      if (status.isLocked) {
        toast.error(
          "The database is still locked due to not paying the annual fee.",
        );
      } else {
        toast.success("System unlocked! Redirecting...");
        router.push("/");
      }
    } catch {
      toast.error("Failed to check status.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
      onClick={handleCheckStatus}
      disabled={isLoading}
    >
      <RefreshCw
        className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
      />
      {isLoading ? "Checking Status..." : "Check Status Again"}
    </Button>
  );
}
