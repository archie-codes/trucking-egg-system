// components/user-profile-menu.tsx
"use client";

import { useState } from "react";
import { User, LogOut, Settings, Mail } from "lucide-react";
import Image from "next/image";
import { logoutUser } from "@/app/actions/auth-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import your shiny new sheets!
import { ProfileSheet } from "./profile-sheet";
import { SettingsSheet } from "./settings-sheet";

interface UserProfileMenuProps {
  currentUser: {
    name: string;
    email: string;
    role: string;
    department: string;
    avatarUrl: string | null;
  } | null;
}

export function UserProfileMenu({ currentUser }: UserProfileMenuProps) {
  // State to control the slide-out sheets
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <ProfileSheet
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
      />

      <SettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-white leading-tight">
            {currentUser?.name || "Unknown User"}
          </p>
          <p className="text-xs font-medium text-slate-400 capitalize">
            {currentUser?.department === "all"
              ? "Master Admin"
              : currentUser?.role === "admin"
                ? "Dept Admin"
                : "Encoder"}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-md shrink-0 flex items-center justify-center hover:border-blue-500 transition-colors duration-300">
              {currentUser?.avatarUrl ? (
                <Image
                  src={currentUser.avatarUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <User className="w-5 h-5 text-slate-400" />
              )}
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 rounded-xl shadow-2xl border-slate-200 dark:border-slate-800 mt-2"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1 overflow-hidden">
                <p className="text-sm font-medium leading-none text-slate-900 dark:text-white truncate">
                  {currentUser?.name}
                </p>
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1 overflow-hidden">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{currentUser?.email}</span>
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

            {/* Using onSelect with preventDefault keeps the dropdown from stealing focus while the sheet opens */}
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setIsProfileOpen(true);
              }}
              className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <User className="mr-2 h-4 w-4 text-slate-500" />
              <span>My Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setIsSettingsOpen(true);
              }}
              className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Settings className="mr-2 h-4 w-4 text-slate-500" />
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

            <form action={logoutUser}>
              <button type="submit" className="w-full">
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 transition-colors rounded-lg">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
