// app/admin/users/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Loader2,
  UserPlus,
  Save,
  User,
  Mail,
  Key,
  Building2,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  ImageIcon,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
import {
  createStaffAccount,
  getAdminClearance,
} from "@/app/actions/user-actions";
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

// ── Form field wrapper ─────────────────────────────────────────────────────────
function FormField({
  id,
  label,
  icon: Icon,
  children,
}: {
  id?: string;
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Field className="space-y-1.5">
      <FieldLabel
        htmlFor={id}
        className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground/80"
      >
        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        {label}
      </FieldLabel>
      {children}
    </Field>
  );
}

const inputClass =
  "h-10 rounded-lg text-sm bg-muted/40 border-border/50 focus-visible:ring-1 focus-visible:ring-blue-500/40 focus-visible:border-blue-500/40 placeholder:text-muted-foreground/40";

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AddUserPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [adminDept, setAdminDept] = useState("trucking");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("encoder");
  const [selectedDept, setSelectedDept] = useState("trucking");

  useEffect(() => {
    getAdminClearance().then((dept) => {
      setAdminDept(dept);
      setSelectedDept(dept === "all" ? "trucking" : dept);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const result = await createStaffAccount(formData);

    if (result.success) {
      const name = formData.get("name") as string;
      const dept = formData.get("department") as string;
      toast.success(`${name}'s account has been created.`, {
        description: `Access granted to the ${dept === "all" ? "Global" : dept} portal.`,
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      });
      formElement.reset();
      setAvatarUrl("");
    } else {
      toast.error("Account creation failed.", { description: result.error });
    }

    setIsSubmitting(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-200 pt-2 md:pt-0">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
            <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[17px] font-semibold text-foreground leading-tight truncate">
              Add New Staff
            </h1>
            <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
              Create access credentials for a new employee.
            </p>
          </div>
        </div>

        <Link href="/admin/users" className="shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-xl text-sm font-medium border-border/60 hover:bg-muted group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </Link>
      </div>

      {/* ── Form card ── */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {/* Accent bar */}
        <div className="h-[3px] bg-linear-to-r from-blue-500 to-blue-400 w-full" />

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="avatarUrl" value={avatarUrl} />

          <div className="p-5 sm:p-6 space-y-6">
            {/* ── Avatar section ── */}
            <div>
              <SectionLabel>Profile photo</SectionLabel>
              <div className="mt-3 flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
                {/* Preview */}
                <div className="shrink-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border/60 bg-muted flex items-center justify-center">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Avatar preview"
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <ImageIcon className="h-7 w-7 text-muted-foreground/30" />
                    )}
                  </div>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="mt-1.5 w-full text-center text-[11px] text-muted-foreground/60 hover:text-rose-500 transition-colors"
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
                              "relative w-11 h-11 rounded-xl overflow-hidden border-2 transition-all hover:scale-105",
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
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
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
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField id="name" label="Full name" icon={User}>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Juan Dela Cruz"
                    required
                    className={inputClass}
                  />
                </FormField>

                <FormField id="email" label="Corporate email" icon={Mail}>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="juan@fhernielogistics.com"
                    required
                    className={inputClass}
                  />
                </FormField>

                <FormField id="password" label="Temporary password" icon={Key}>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="e.g., Fhernie123!"
                      required
                      className={cn(inputClass, "pr-10")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 mt-1 leading-relaxed">
                    Staff will use this to log in for the first time.
                  </p>
                </FormField>
              </div>
            </div>

            {/* ── Access & permissions ── */}
            <div>
              <SectionLabel>Access & permissions</SectionLabel>
              <div className="mt-3 rounded-xl border border-border/50 bg-muted/20 overflow-hidden divide-y divide-border/40">
                {/* Role row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[13px] text-muted-foreground w-28 shrink-0">
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
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/60 shadow-md z-110">
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

                {/* Department row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[13px] text-muted-foreground w-28 shrink-0">
                    Department
                  </span>
                  <div className="flex-1 min-w-0">
                    <Select
                      name="department"
                      value={selectedDept}
                      onValueChange={setSelectedDept}
                    >
                      <SelectTrigger className="h-8 w-full border-0 bg-transparent shadow-none text-sm font-medium p-0 focus:ring-0 [&>svg]:ml-auto">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/60 shadow-md z-110">
                        {(adminDept === "all" || adminDept === "trucking") && (
                          <SelectItem
                            value="trucking"
                            className="text-sm py-2.5"
                          >
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                              Fhernie Logistics
                            </div>
                          </SelectItem>
                        )}
                        {(adminDept === "all" || adminDept === "eggs") && (
                          <SelectItem value="eggs" className="text-sm py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                              Otso Dragon Corp
                            </div>
                          </SelectItem>
                        )}
                        {adminDept === "all" && selectedRole === "admin" && (
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
          </div>

          {/* ── Footer ── */}
          <div className="px-5 sm:px-6 py-4 border-t border-border/60 bg-muted/10 flex flex-col sm:flex-row gap-2.5 sm:justify-end">
            <Link href="/admin/users" className="sm:order-1">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto h-11 rounded-xl text-sm font-medium border-border/60 hover:bg-muted"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="sm:order-2 relative h-11 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all duration-300 overflow-hidden group/btn font-semibold"
            >
              <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2 transition-transform group-hover/btn:scale-110 duration-300" />{" "}
                  Create account
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
