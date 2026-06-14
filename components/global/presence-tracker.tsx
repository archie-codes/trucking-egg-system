"use client";

import { useEffect } from "react";
import { pingUserPresence } from "@/app/actions/user-actions";

export function PresenceTracker() {
  useEffect(() => {
    // Ping immediately on mount
    pingUserPresence();

    // Then ping every 2 minutes (120,000 ms)
    const intervalId = setInterval(() => {
      pingUserPresence();
    }, 2 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return null; // This component doesn't render anything
}
