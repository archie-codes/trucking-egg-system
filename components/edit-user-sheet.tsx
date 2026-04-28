// components/edit-user-sheet.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  User,
  Mail,
  Key,
  Building2,
  ShieldCheck,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";

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
// ADDED: Tabs Imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateStaffAccount } from "@/app/actions/user-actions";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Premium pre-generated avatars for quick selection
const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jude&backgroundColor=b6e3f4",
];

// Define the shape of the user data we expect
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

export function EditUserSheet({ isOpen, onClose, user }: EditUserProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || "");

  // Reset the avatar state when the selected user changes
  if (user && avatarUrl === "" && user.avatarUrl) {
    setAvatarUrl(user.avatarUrl);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateStaffAccount(user.id, formData);

    if (result.success) {
      toast.success("Profile Updated", {
        description: `${user.name}'s account has been successfully updated.`,
        className:
          "border-emerald-500/30 bg-emerald-50/80 backdrop-blur-md shadow-xl",
      });
      onClose(); // Slide the panel away!
    } else {
      toast.error("Update Failed", { description: result.error });
    }
    setIsSubmitting(false);
  }

  if (!user) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-hidden w-full sm:max-w-lg bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl border-l border-white/20 dark:border-slate-800/50 shadow-2xl p-0 flex flex-col h-full">
        {/* Decorative Top Gradient Line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-90 z-10" />

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar">
          <SheetHeader className="mb-6 mt-1">
            <SheetTitle className="text-3xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500 drop-shadow-sm">
              Edit Staff Profile
            </SheetTitle>
            <SheetDescription className="text-base text-slate-500 dark:text-slate-400">
              Update credentials or access levels for{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {user.name}
              </span>
              .
            </SheetDescription>
          </SheetHeader>

          <form
            id="edit-user-form"
            onSubmit={handleSubmit}
            className="space-y-6 pb-6"
          >
            <input type="hidden" name="avatarUrl" value={avatarUrl} />

            {/* UPGRADED Avatar Updater with Choices */}
            <div className="group flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 shadow-sm transition-all hover:border-blue-200 dark:hover:border-blue-900/50">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 ring-4 ring-white dark:ring-slate-900 shadow-lg shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                )}
              </div>

              <div className="flex-1 w-full text-center sm:text-left flex flex-col justify-center">
                <Tabs defaultValue="choose" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-3 bg-slate-100 dark:bg-slate-900/50 rounded-xl p-1">
                    <TabsTrigger
                      value="choose"
                      className="rounded-lg text-xs sm:text-sm"
                    >
                      Choose
                    </TabsTrigger>
                    <TabsTrigger
                      value="upload"
                      className="rounded-lg text-xs sm:text-sm"
                    >
                      Upload
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="choose" className="mt-0">
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 pt-1 justify-items-center sm:justify-items-start">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(url)}
                          className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                            avatarUrl === url
                              ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                              : "border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <Image
                            src={url}
                            alt={`Avatar option ${idx}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="upload"
                    className="mt-0 pt-2 flex justify-center sm:justify-start"
                  >
                    <UploadButton<OurFileRouter, "avatarUploader">
                      endpoint="avatarUploader"
                      onClientUploadComplete={(res) => {
                        setAvatarUrl(res[0].url);
                        toast.success("Image uploaded successfully!", {
                          className:
                            "border-emerald-500/30 bg-emerald-50/80 backdrop-blur-md shadow-xl",
                        });
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(`Upload failed: ${error.message}`);
                      }}
                      appearance={{
                        button:
                          "bg-blue-600 hover:bg-blue-700 text-sm h-10 px-6 rounded-xl w-full sm:w-auto shadow-md transition-all hover:-translate-y-0.5",
                        allowedContent: "hidden",
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <div className="space-y-4">
              <Field className="space-y-2 group">
                <FieldLabel
                  htmlFor="name"
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
                >
                  <User className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />{" "}
                  Full Name
                </FieldLabel>
                <Input
                  id="name"
                  name="name"
                  defaultValue={user.name}
                  required
                  className="px-4 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/50 transition-all duration-300 shadow-sm group-hover:border-blue-200 dark:group-hover:border-blue-900/50"
                />
              </Field>

              <Field className="space-y-2 group">
                <FieldLabel
                  htmlFor="email"
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
                >
                  <Mail className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />{" "}
                  Email Address
                </FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  required
                  className="px-4 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/50 transition-all duration-300 shadow-sm group-hover:border-blue-200 dark:group-hover:border-blue-900/50"
                />
              </Field>

              <Field className="space-y-2 group">
                <FieldLabel
                  htmlFor="password"
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
                >
                  <Key className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />{" "}
                  Reset Password
                </FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="text"
                  placeholder="Leave blank to keep current password"
                  className="px-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30 focus-visible:ring-2 focus-visible:ring-amber-500/50 transition-all duration-300 shadow-sm group-hover:border-amber-300 dark:group-hover:border-amber-700/50 placeholder:text-amber-600/40"
                />
              </Field>

              <Field className="space-y-2 group">
                <FieldLabel
                  htmlFor="department"
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
                >
                  <Building2 className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />{" "}
                  Department
                </FieldLabel>
                <Select name="department" defaultValue={user.department}>
                  <SelectTrigger className="h-12 px-4 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 shadow-sm group-hover:border-blue-200 dark:group-hover:border-blue-900/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem
                      value="trucking"
                      className="cursor-pointer rounded-lg hover:bg-slate-100"
                    >
                      Fhernie Logistics (Trucking)
                    </SelectItem>
                    <SelectItem
                      value="eggs"
                      className="cursor-pointer rounded-lg hover:bg-slate-100"
                    >
                      Otso Dragon Corp (Egg Sales)
                    </SelectItem>
                    <SelectItem
                      value="all"
                      className="cursor-pointer rounded-lg hover:bg-slate-100"
                    >
                      Global Access (Both)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field className="space-y-2 group md:col-span-2 lg:col-span-1">
                <FieldLabel
                  htmlFor="role"
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />{" "}
                  Role
                </FieldLabel>
                <Select name="role" defaultValue={user.role}>
                  <SelectTrigger className="h-12 px-4 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 shadow-sm group-hover:border-blue-200 dark:group-hover:border-blue-900/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem
                      value="encoder"
                      className="cursor-pointer rounded-lg hover:bg-slate-100"
                    >
                      Data Encoder
                    </SelectItem>
                    <SelectItem
                      value="admin"
                      className="cursor-pointer rounded-lg hover:bg-slate-100"
                    >
                      Administrator
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </form>
        </div>

        {/* Fixed Footer for Save Button */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl shrink-0">
          <Button
            type="submit"
            form="edit-user-form"
            disabled={isSubmitting}
            className="relative w-full h-14 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group/btn font-bold text-base"
          >
            <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
            {isSubmitting ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Saving
                Changes...
              </>
            ) : (
              <>
                <Save className="mr-3 h-5 w-5 transition-transform group-hover/btn:scale-110" />{" "}
                Save Changes
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
