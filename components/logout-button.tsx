// components/logout-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { logoutUser } from "@/app/actions/auth-actions";

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Call the server action directly
    await logoutUser();
    // (We don't need to set isLoggingOut to false because the page will redirect)
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
    >
      {isLoggingOut ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin text-red-500" />
      ) : (
        <LogOut className="w-4 h-4 mr-2" />
      )}
      {isLoggingOut ? "Signing Out..." : "Sign Out"}
    </Button>
  );
}
