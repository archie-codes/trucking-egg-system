"use client";

import { useState, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Camera,
  Lock,
  User as UserIcon,
  Calendar,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Loader2,
  Building2,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

// Import your server actions
import { updateUserPassword } from "@/app/actions/user-actions";
import { updateUserAvatar } from "@/app/actions/user-actions";
import { uploadFiles } from "@/lib/uploadthing"; // ✨ Make sure it says @/lib/uploadthing

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentUser: any;
}

// ── Section divider ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-border/40" />
    </div>
  );
}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          iconColor || "text-muted-foreground",
        )}
      />
      <span className="text-[13px] text-muted-foreground flex-1">{label}</span>
      <span className="text-[13px] font-medium text-foreground text-right truncate max-w-[160px]">
        {value || "—"}
      </span>
    </div>
  );
}

// ── Password input ────────────────────────────────────────────────────────────
function PasswordInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 pr-10 rounded-lg text-sm bg-muted/40 border-border/50 focus-visible:ring-1 focus-visible:ring-blue-500/40 focus-visible:border-blue-500/40 placeholder:text-muted-foreground/40"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
        {show ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role?: string }) {
  const isAdmin = role?.toLowerCase() === "admin";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border-0",
        isAdmin
          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
          : "bg-muted text-muted-foreground",
      )}
    >
      <Shield className="h-2.5 w-2.5" />
      {role || "user"}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ProfileSheet({
  isOpen,
  onClose,
  currentUser,
}: ProfileSheetProps) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✨ NEW: Avatar Upload States & Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatarUrl);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const initials =
    currentUser?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPw.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateUserPassword(currentUser.id, currentPw, newPw);

      if (result.success) {
        toast.success("Password updated successfully.");
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      } else {
        toast.error("Update Failed", { description: result.error });
      }
    } catch {
      toast.error("Network Error", {
        description: "Failed to connect to server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✨ NEW: Function to handle when a user selects a file
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Match the 4MB limit you set in core.ts
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image is too large. Please select an image under 4MB.");
      return;
    }

    // 1. Create a fast local preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setIsUploadingAvatar(true);

    try {
      // 2. 🚀 UPLOAD TO UPLOADTHING
      // ✨ FIX: Use "avatarUploader" to match your core.ts exactly!
      const uploadResult = await uploadFiles("avatarUploader", {
        files: [file],
      });

      if (!uploadResult || uploadResult.length === 0) {
        throw new Error("Upload failed");
      }

      // 3. Get the new permanent URL from UploadThing
      const newAvatarUrl = uploadResult[0].url;

      // 4. 💾 SAVE TO YOUR DATABASE
      const dbResult = await updateUserAvatar(currentUser.id, newAvatarUrl);

      if (dbResult.success) {
        toast.success("Profile picture updated!");
      } else {
        throw new Error(dbResult.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image. Please try again.");
      // Revert back to original avatar if it fails
      setAvatarPreview(currentUser?.avatarUrl);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const joinedYear = currentUser?.createdAt
    ? new Date(currentUser.createdAt).getFullYear()
    : "—";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col p-0 gap-0 w-full sm:max-w-[400px] bg-background border-l border-border/60 z-200 h-full">
        {/* Top accent bar */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-linear-to-r from-blue-500 to-blue-400 z-10" />

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <SheetHeader className="shrink-0 px-5 pt-8 pb-5 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
              <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <SheetTitle className="text-[15px] font-semibold text-foreground leading-tight">
                My Profile
              </SheetTitle>
              <SheetDescription className="text-[12px] text-muted-foreground mt-0.5">
                Account details and security settings.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* ── Scrollable body ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 custom-scrollbar">
          {/* Avatar card */}
          <div className="flex items-center gap-4">
            {/* ✨ NEW: Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            {/* Avatar container */}
            <div className="relative shrink-0 group">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted border border-border/60 shadow-sm relative">
                {/* Show the preview state instead of just the currentUser state */}
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar"
                    fill
                    className={cn(
                      "object-cover transition-opacity duration-300",
                      isUploadingAvatar && "opacity-50 blur-sm",
                    )}
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-950/40">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {initials}
                    </span>
                  </div>
                )}

                {/* Show a spinner while uploading */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
              </div>

              {/* ✨ CHANGED: Now clicking this button triggers the hidden file input! */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                aria-label="Change avatar"
              >
                <Camera className="h-5 w-5 text-white drop-shadow-md" />
              </button>
            </div>

            {/* Name + email + role */}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[15px] text-foreground leading-tight truncate">
                {currentUser?.name || "Unknown User"}
              </h3>
              <p className="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                <Mail className="h-3 w-3 shrink-0" />
                {currentUser?.email || "—"}
              </p>
              <div className="mt-1.5">
                <RoleBadge role={currentUser?.role} />
              </div>
            </div>
          </div>

          {/* Account info rows */}
          <div>
            <SectionLabel>Account details</SectionLabel>
            <div className="mt-3 rounded-xl border border-border/50 bg-muted/20 overflow-hidden divide-y divide-border/40">
              <InfoRow
                icon={Mail}
                label="Email"
                value={currentUser?.email}
                iconColor="text-blue-500 dark:text-blue-400"
              />
              <InfoRow
                icon={Building2}
                label="Department"
                value={
                  currentUser?.department
                    ? currentUser.department.charAt(0).toUpperCase() +
                      currentUser.department.slice(1)
                    : undefined
                }
                iconColor="text-muted-foreground"
              />
              <InfoRow
                icon={Shield}
                label="Role"
                value={
                  currentUser?.role
                    ? currentUser.role.charAt(0).toUpperCase() +
                      currentUser.role.slice(1)
                    : undefined
                }
                iconColor="text-muted-foreground"
              />
              <InfoRow
                icon={Calendar}
                label="Member since"
                value={String(joinedYear)}
                iconColor="text-muted-foreground"
              />
            </div>
          </div>

          {/* Password section */}
          <div>
            <SectionLabel>Change password</SectionLabel>
            <form
              id="password-form"
              onSubmit={handlePasswordUpdate}
              className="mt-3 space-y-2.5"
            >
              <PasswordInput
                placeholder="Current password"
                value={currentPw}
                onChange={setCurrentPw}
              />
              <PasswordInput
                placeholder="New password"
                value={newPw}
                onChange={setNewPw}
              />
              <PasswordInput
                placeholder="Confirm new password"
                value={confirmPw}
                onChange={setConfirmPw}
              />

              {/* Strength hint */}
              {newPw.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((i) => {
                      const strength = Math.min(
                        Math.floor(newPw.length / 3),
                        4,
                      );
                      return (
                        <div
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-colors",
                            i <= strength
                              ? strength <= 1
                                ? "bg-rose-400"
                                : strength <= 2
                                  ? "bg-amber-400"
                                  : strength <= 3
                                    ? "bg-blue-400"
                                    : "bg-emerald-400"
                              : "bg-border/50",
                          )}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground/60 shrink-0">
                    {newPw.length < 4
                      ? "Weak"
                      : newPw.length < 7
                        ? "Fair"
                        : newPw.length < 10
                          ? "Good"
                          : "Strong"}
                  </span>
                </div>
              )}

              {/* Match indicator */}
              {confirmPw.length > 0 && (
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-[11px] font-medium",
                    newPw === confirmPw
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-500",
                  )}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {newPw === confirmPw
                    ? "Passwords match"
                    : "Passwords do not match"}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="shrink-0 px-5 py-4 border-t border-border/60 bg-muted/10">
          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl text-sm font-medium border-border/60 hover:bg-muted"
            >
              Close
            </Button>
            <Button
              type="submit"
              form="password-form"
              disabled={isSubmitting || !currentPw || !newPw || !confirmPw}
              className="flex-2 h-10 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white border-0 shadow-sm gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" /> Update password
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
