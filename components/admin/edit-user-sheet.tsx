// components/admin/edit-user-sheet.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  User,
  Mail,
  Key,
  Building2,
  ShieldCheck,
  Eye,
  EyeOff,
  ShieldAlert,
  CheckCircle2,
  Edit,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateStaffAccount } from "@/app/actions/user-actions";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// ── Preset avatars ─────────────────────────────────────────────────────────────
const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=d1d4f9",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Jameson&backgroundColor=c0aede",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Riley&backgroundColor=b6e3f4",
];

// ── Section divider ────────────────────────────────────────────────────────────
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

const inputClass =
  "h-10 rounded-lg text-sm bg-muted/40 border-border/50 focus-visible:ring-1 focus-visible:ring-blue-500/40 focus-visible:border-blue-500/40 placeholder:text-muted-foreground/40";

// ── Types ──────────────────────────────────────────────────────────────────────
export type EditUserProps = {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    department: string;
    avatarUrl: string | null;
  } | null;
};

// ── Main component ─────────────────────────────────────────────────────────────
export function EditUserSheet({ isOpen, onClose, user }: EditUserProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || "");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.role || "encoder");
  const [selectedDept, setSelectedDept] = useState(
    user?.department || "trucking",
  );

  // Sync state when user prop changes
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedRole(user.role);
      setSelectedDept(user.department);
      if (avatarUrl === "" && user.avatarUrl) {
        setAvatarUrl(user.avatarUrl);
      }
    }
  }, [user, avatarUrl]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateStaffAccount(user.id, formData);

    if (result.success) {
      toast.success(`${user.name}'s profile has been updated.`);
      onClose();
    } else {
      toast.error("Update failed.", { description: result.error });
    }
    setIsSubmitting(false);
  }

  if (!user) return null;

  // Initials fallback
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col p-0 gap-0 w-full! sm:w-[420px]! max-w-[100vw]! sm:max-w-[420px]! bg-background border-l border-border/60 z-200 h-full">
        {/* Top accent bar */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-linear-to-r from-blue-500 to-blue-400 z-10" />

        {/* ── Header ── */}
        <SheetHeader className="shrink-0 px-5 pt-8 pb-5 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
              <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-[15px] font-semibold text-foreground leading-tight">
                Edit staff profile
              </SheetTitle>
              <SheetDescription className="text-[12px] text-muted-foreground mt-0.5 truncate">
                Updating credentials for{" "}
                <span className="font-medium text-foreground">{user.name}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          <form
            id="edit-user-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <input type="hidden" name="avatarUrl" value={avatarUrl} />

            {/* ── Avatar section ── */}
            <div>
              <SectionLabel>Profile photo</SectionLabel>
              <div className="mt-3 flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
                {/* Preview */}
                <div className="shrink-0">
                  <div className="w-18 h-18 rounded-2xl overflow-hidden border border-border/60 bg-muted flex items-center justify-center">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Avatar preview"
                        width={72}
                        height={72}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <span className="text-base font-bold text-muted-foreground/50">
                        {initials}
                      </span>
                    )}
                  </div>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="mt-1.5 w-full text-center text-[11px] text-muted-foreground/50 hover:text-rose-500 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex-1 w-full min-w-0">
                  <Tabs defaultValue="choose" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-8 rounded-lg bg-muted/50 p-0.5 mb-3">
                      <TabsTrigger
                        value="choose"
                        className="rounded-md text-xs h-full"
                      >
                        Choose preset
                      </TabsTrigger>
                      <TabsTrigger
                        value="upload"
                        className="rounded-md text-xs h-full"
                      >
                        Upload photo
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="choose" className="mt-0">
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        {PRESET_AVATARS.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setAvatarUrl(url)}
                            className={cn(
                              "relative w-10 h-10 rounded-xl overflow-hidden border-2 transition-all hover:scale-105",
                              avatarUrl === url
                                ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]"
                                : "border-border/50 hover:border-blue-400/50",
                            )}
                          >
                            <Image
                              src={url}
                              alt={`Avatar ${idx + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            {avatarUrl === url && (
                              <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="upload"
                      className="mt-0 flex flex-col items-center sm:items-start"
                    >
                      <div className="w-full sm:w-auto flex justify-center sm:justify-start">
                        <UploadButton<OurFileRouter, "avatarUploader">
                          endpoint="avatarUploader"
                          onClientUploadComplete={(res) => {
                            setAvatarUrl(res[0].url);
                            toast.success("Photo uploaded.");
                          }}
                          onUploadError={(error: Error) => {
                            toast.error(`Upload failed: ${error.message}`);
                          }}
                          appearance={{
                            button:
                              "bg-blue-600 hover:bg-blue-700 text-xs h-9 px-4 rounded-lg w-full sm:w-auto ut-uploading:cursor-not-allowed ut-uploading:opacity-60",
                            allowedContent: "hidden",
                          }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground/60 mt-2">
                        PNG, JPG or WebP · Max 4 MB
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* ── Account info ── */}
            <div>
              <SectionLabel>Account information</SectionLabel>
              <div className="mt-3 space-y-3">
                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="name"
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground/80"
                  >
                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    Full name
                  </FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={user.name}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="email"
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground/80"
                  >
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    Email address
                  </FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    required
                    className={inputClass}
                  />
                </Field>

                {/* Password reset — amber tint to signal optional/caution */}
                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="password"
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground/80"
                  >
                    <Key className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    Reset password
                    <span className="ml-auto text-[10px] font-normal text-muted-foreground/50 normal-case tracking-normal">
                      optional
                    </span>
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Leave blank to keep current"
                      className={cn(
                        inputClass,
                        "pr-10 bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/60 dark:border-amber-900/30 focus-visible:ring-amber-500/30 focus-visible:border-amber-400/50",
                        "placeholder:text-amber-600/30 dark:placeholder:text-amber-500/30",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </Field>
              </div>
            </div>

            {/* ── Access & permissions ── */}
            <div>
              <SectionLabel>Access & permissions</SectionLabel>
              <div className="mt-3 rounded-xl border border-border/50 bg-muted/20 overflow-hidden divide-y divide-border/40">
                {/* Role */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[13px] text-muted-foreground w-24 shrink-0">
                    System role
                  </span>
                  <div className="flex-1 min-w-0">
                    <Select
                      name="role"
                      value={selectedRole}
                      onValueChange={(val) => {
                        setSelectedRole(val);
                        if (val === "encoder" && selectedDept === "all") {
                          setSelectedDept("trucking");
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 w-full border-0 bg-transparent shadow-none text-sm font-medium p-0 focus:ring-0 [&>svg]:ml-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/60 shadow-md z-250">
                        <SelectItem value="encoder" className="text-sm py-2.5">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            Data Encoder
                          </div>
                        </SelectItem>
                        <SelectItem value="admin" className="text-sm py-2.5">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="h-3.5 w-3.5 text-indigo-500" />
                            <span className="text-indigo-700 dark:text-indigo-400 font-medium">
                              Administrator
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Department */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[13px] text-muted-foreground w-24 shrink-0">
                    Department
                  </span>
                  <div className="flex-1 min-w-0">
                    <Select
                      name="department"
                      value={selectedDept}
                      onValueChange={setSelectedDept}
                    >
                      <SelectTrigger className="h-8 w-full border-0 bg-transparent shadow-none text-sm font-medium p-0 focus:ring-0 [&>svg]:ml-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/60 shadow-md z-250">
                        <SelectItem value="trucking" className="text-sm py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                            Fhernie Logistics
                          </div>
                        </SelectItem>
                        <SelectItem value="eggs" className="text-sm py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                            Otso Dragon Corp
                          </div>
                        </SelectItem>
                        {selectedRole === "admin" && (
                          <SelectItem value="all" className="text-sm py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                              Global access (both)
                            </div>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-5 py-4 border-t border-border/60 bg-muted/10">
          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-10 rounded-xl text-sm font-medium border-border/60 hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-user-form"
              disabled={isSubmitting}
              className="flex-2 h-10 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white border-0 shadow-sm gap-2 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" /> Save changes
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
