// app/admin/users/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useEffect } from "react"; // Also add useEffect to your React imports!

// UploadThing Imports (Using Button instead of Dropzone to save space!)
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

export default function AddUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const [adminDept, setAdminDept] = useState<string>("trucking");

  useEffect(() => {
    getAdminClearance().then((dept) => setAdminDept(dept));
  }, []);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const result = await createStaffAccount(formData);

    if (result.success) {
      const employeeName = formData.get("name") as string;
      const department = formData.get("department") as string;

      toast.success("Staff Account Created! 🎉", {
        description: `${employeeName} has been granted access to the ${
          department === "all" ? "Global" : department
        } portal.`,
        duration: 5000,
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        className:
          "border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/50 backdrop-blur-md dark:border-emerald-800/50 shadow-xl",
      });

      formElement.reset();
      setAvatarUrl(""); // Reset the image preview
      setIsSubmitting(false);
    } else {
      toast.error("Account Creation Failed", {
        description: result.error,
        className: "border-red-500/30 bg-red-50/80 backdrop-blur-md shadow-xl",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-8 duration-200">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div className="space-y-1 relative">
          <div className="absolute -left-4 top-0 w-12 h-12 bg-blue-500/10 rounded-full blur-xl -z-10" />
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500 drop-shadow-sm">
              Add New Staff
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-2">
            Create and configure access credentials for new employees.
          </p>
        </div>
        <Link href="/admin/users">
          <Button
            variant="outline"
            className="group hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to Directory
          </Button>
        </Link>
      </div>

      <Card className="relative overflow-hidden border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl ring-1 ring-slate-200/50 dark:ring-white/10 transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-90" />

        <CardHeader className="pb-8 pt-5 px-8 border-b border-slate-100/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/20">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 shadow-inner">
              <UserPlus className="w-6 h-6" strokeWidth={2.5} />
            </div>
            Account Details
          </CardTitle>
          <CardDescription className="text-base ml-14 mt-1">
            Fill in the details below. A temporary password is required for
            their first login.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="avatarUrl" value={avatarUrl} />

            {/* UPGRADED AVATAR SECTION */}
            <div className="p-4 sm:p-5 bg-white/50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row gap-6 items-start sm:items-center transition-all hover:border-blue-200 dark:hover:border-blue-900/50 shadow-sm">
              {/* Profile Picture Preview */}
              <div className="shrink-0 relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 ring-4 ring-white dark:ring-slate-800 shadow-lg flex items-center justify-center">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                )}
              </div>

              {/* The Upload vs Select Tabs */}
              <div className="flex-1 w-full">
                <Tabs defaultValue="choose" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 dark:bg-slate-900/50 rounded-xl p-1">
                    <TabsTrigger value="choose" className="rounded-lg">
                      Choose Avatar
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="rounded-lg">
                      Upload Photo
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="choose" className="mt-0">
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-2">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(url)}
                          className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                            avatarUrl === url
                              ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                              : "border-transparent hover:border-slate-300"
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

                  <TabsContent value="upload" className="mt-0 pt-2">
                    <div className="flex items-center justify-start">
                      <UploadButton<OurFileRouter, "avatarUploader">
                        endpoint="avatarUploader"
                        onClientUploadComplete={(res) => {
                          setAvatarUrl(res[0].url);
                          toast.success("Image uploaded successfully!");
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(`Upload failed: ${error.message}`);
                        }}
                        appearance={{
                          button:
                            "bg-blue-600 hover:bg-blue-700 text-sm h-10 px-6 rounded-xl ut-uploading:cursor-not-allowed",
                          allowedContent: "hidden", // This hides the "Images up to 4MB" text to save lots of space
                        }}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Standard Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  placeholder="Juan Dela Cruz"
                  required
                  className="px-4 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/50 shadow-sm"
                />
              </Field>

              <Field className="space-y-2 group">
                <FieldLabel
                  htmlFor="email"
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
                >
                  <Mail className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />{" "}
                  Corporate Email
                </FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="juan@fhernielogistics.com"
                  required
                  className="px-4 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/50 shadow-sm"
                />
              </Field>

              <Field className="space-y-2 group">
                <FieldLabel
                  htmlFor="password"
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
                >
                  <Key className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />{" "}
                  Temporary Password
                </FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="text"
                  placeholder="e.g., Fhernie123!"
                  required
                  className="px-4 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/50 shadow-sm"
                />
              </Field>

              <Field className="space-y-2 group">
                <FieldLabel
                  htmlFor="department"
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
                >
                  <Building2 className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />{" "}
                  Assigned Department
                </FieldLabel>
                <Select
                  name="department"
                  defaultValue={adminDept === "all" ? "trucking" : adminDept}
                >
                  <SelectTrigger className=" px-4 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 shadow-sm group-hover:border-blue-200 dark:group-hover:border-blue-900/50">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    {/* ONLY show Trucking if they are Super Admin OR Trucking Admin */}
                    {(adminDept === "all" || adminDept === "trucking") && (
                      <SelectItem
                        value="trucking"
                        className="cursor-pointer rounded-lg hover:bg-slate-100"
                      >
                        Fhernie Logistics (Trucking)
                      </SelectItem>
                    )}

                    {/* ONLY show Eggs if they are Super Admin OR Egg Admin */}
                    {(adminDept === "all" || adminDept === "eggs") && (
                      <SelectItem
                        value="eggs"
                        className="cursor-pointer rounded-lg hover:bg-slate-100"
                      >
                        Otso Dragon Corp (Egg Sales)
                      </SelectItem>
                    )}

                    {/* ONLY show Global Access if they are a Super Admin */}
                    {adminDept === "all" && (
                      <SelectItem
                        value="all"
                        className="cursor-pointer rounded-lg hover:bg-slate-100"
                      >
                        Global Access (Both)
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </Field>

              <Field className="space-y-2 group md:col-span-2 lg:col-span-1">
                <FieldLabel
                  htmlFor="role"
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />{" "}
                  System Role
                </FieldLabel>
                <Select name="role" defaultValue="encoder">
                  <SelectTrigger className="h-12 px-4 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/50 shadow-sm">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="encoder">
                      Data Encoder (Standard)
                    </SelectItem>
                    <SelectItem value="admin">
                      Administrator (Manager)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="flex justify-end pt-5 mt-2 border-t border-slate-100 dark:border-slate-800/60">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="relative h-14 px-8 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group/btn font-bold text-base"
              >
                <div className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Creating
                    Account...
                  </>
                ) : (
                  <>
                    <Save className="mr-3 h-5 w-5 transition-transform group-hover/btn:scale-110" />{" "}
                    Create Account
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
