// components/profile-sheet.tsx
"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Camera,
  Lock,
  User as UserIcon,
  Calendar,
  Mail,
  Shield,
} from "lucide-react";
import Image from "next/image";

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export function ProfileSheet({
  isOpen,
  onClose,
  currentUser,
}: ProfileSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-hidden w-full sm:max-w-md bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl border-l border-white/20 dark:border-slate-800/50 shadow-2xl p-0 flex flex-col h-full">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500 opacity-90 z-10" />

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar space-y-8">
          <SheetHeader className="mt-2">
            <SheetTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-blue-500" />
              My Profile
            </SheetTitle>
            <SheetDescription className="text-slate-500 dark:text-slate-400">
              Manage your personal information and security.
            </SheetDescription>
          </SheetHeader>

          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-5 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="relative w-18 h-18 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-950 shadow-lg group shrink-0">
              {currentUser?.avatarUrl ? (
                <Image
                  src={currentUser.avatarUrl}
                  alt="Avatar"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-7 h-7 text-slate-400" />
                </div>
              )}
              <button className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight truncate">
                {currentUser?.name || "Unknown User"}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-[13px] text-slate-500 font-medium">
                <Mail className="w-3.5 h-3.5 shrink-0" /> 
                <span className="truncate">{currentUser?.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Shield className="w-3 h-3" /> {currentUser?.role}
                </span>
              </div>
            </div>
          </div>
          {/* Read-Only Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Department
              </p>
              <p className="font-bold text-slate-700 dark:text-slate-300 capitalize">
                {currentUser?.department}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Joined Date
              </p>
              <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" /> 2024
              </p>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800/60" />

          {/* Change Password Form */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" /> Security
            </h4>
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Current Password"
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
              <Input
                type="password"
                placeholder="New Password"
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
              <Button className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 font-bold">
                Update Password
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
