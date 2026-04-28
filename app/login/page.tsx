// // app/login/page.tsx
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import {
//   Loader2,
//   Eye,
//   EyeOff,
//   AlertCircle,
//   ShieldCheck,
//   Truck,
//   ArrowLeft,
// } from "lucide-react";
// import Link from "next/link";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Field, FieldLabel } from "@/components/ui/field";
// import { loginUser } from "@/app/actions/auth-actions";

// export default function LoginPage() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);
//   const [showPassword, setShowPassword] = useState(false);

//   async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setIsLoading(true);
//     setErrorMsg(null); // Clear previous errors

//     const formData = new FormData(e.currentTarget);
//     const result = await loginUser(formData);

//     if (result.success) {
//       toast.success("Authentication successful");

//       // Route based on department
//       if (result.department === "trucking" || result.department === "all") {
//         router.push("/trucking/dashboard");
//       } else if (result.department === "eggs") {
//         router.push("/egg-sales/dashboard");
//       }
//     } else {
//       // Set the inline error message instead of just a toast
//       setErrorMsg(result.error || "An unexpected error occurred.");
//       setIsLoading(false);
//     }
//   }

//   return (
//     <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 selection:bg-blue-500/30">
//       {/* Back to Home Button */}
//       <Link
//         href="/"
//         className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all bg-white/40 dark:bg-slate-900/40 hover:bg-white/80 dark:hover:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md"
//       >
//         <ArrowLeft className="w-4 h-4" />
//         Back to Home
//       </Link>

//       {/* Background Decorative Orbs */}
//       <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 dark:bg-blue-600/10 blur-[100px] pointer-events-none" />
//       <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 dark:bg-indigo-600/10 blur-[100px] pointer-events-none" />

//       {/* Main Container */}
//       <div className="relative z-10 w-full max-w-[1000px] m-4 flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
//         {/* Left Panel - Branding */}
//         <div className="hidden md:flex md:w-1/2 relative p-12 flex-col justify-between overflow-hidden bg-slate-900 text-white">
//           {/* Subtle overlay gradient */}
//           <div className="absolute inset-0 bg-linear-to-br from-blue-600/20 via-slate-900/50 to-purple-600/20 z-0"></div>

//           <div className="relative z-10 flex items-center space-x-3">
//             <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-xl">
//               <Truck className="w-7 h-7 text-blue-400" />
//             </div>
//             <span className="font-bold text-2xl tracking-tight text-white/90">
//               Fhernie Logistics
//             </span>
//           </div>

//           <div className="relative z-10 mt-auto mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
//             <div className="inline-block px-3 py-1 mb-4 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-sm">
//               <span className="text-sm font-medium text-blue-300">
//                 System Portal
//               </span>
//             </div>
//             <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
//               Streamlining Your <br />
//               <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">
//                 Supply Chain
//               </span>
//             </h1>
//             <p className="text-slate-400 text-lg max-w-md font-medium">
//               Secure administrative access for Fhernie Logistics and Otso Dragon
//               Corporation personnel.
//             </p>
//           </div>

//           {/* Decorative geometric elements */}
//           <div className="absolute -bottom-24 -left-24 w-64 h-64 border border-white/5 rounded-full"></div>
//           <div className="absolute -bottom-12 -left-12 w-48 h-48 border border-white/5 rounded-full"></div>
//           <div className="absolute top-1/4 -right-12 w-32 h-32 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
//         </div>

//         {/* Right Panel - Form */}
//         <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white/50 dark:bg-slate-950/50">
//           <div className="w-full max-w-sm mx-auto space-y-8">
//             {/* Mobile Header (Hidden on Desktop) */}
//             <div className="md:hidden flex items-center justify-center space-x-3 mb-6">
//               <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
//                 <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//               </div>
//               <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
//                 Fhernie Logistics
//               </span>
//             </div>

//             <div className="text-center md:text-left space-y-2">
//               <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
//                 Welcome back
//               </h2>
//               <p className="text-slate-500 dark:text-slate-400">
//                 Please enter your credentials to sign in.
//               </p>
//             </div>

//             <form onSubmit={handleLogin} className="space-y-6">
//               {errorMsg && (
//                 <Alert
//                   variant="destructive"
//                   className="animate-in fade-in slide-in-from-top-2 duration-300 border-red-500/50 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
//                 >
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertDescription>{errorMsg}</AlertDescription>
//                 </Alert>
//               )}

//               <div className="space-y-5">
//                 <Field>
//                   <FieldLabel
//                     htmlFor="email"
//                     className="text-sm font-medium text-slate-700 dark:text-slate-300"
//                   >
//                     Email Address
//                   </FieldLabel>
//                   <Input
//                     id="email"
//                     name="email"
//                     type="email"
//                     placeholder="name@fhernielogistics.com"
//                     required
//                     disabled={isLoading}
//                     className="mt-2 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                     autoComplete="email"
//                   />
//                 </Field>

//                 <Field>
//                   <FieldLabel
//                     htmlFor="password"
//                     className="text-sm font-medium text-slate-700 dark:text-slate-300"
//                   >
//                     Password
//                   </FieldLabel>
//                   <div className="relative mt-2">
//                     <Input
//                       id="password"
//                       name="password"
//                       type={showPassword ? "text" : "password"}
//                       placeholder="••••••••"
//                       required
//                       disabled={isLoading}
//                       className="h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 transition-all duration-200 shadow-sm pr-11 disabled:opacity-50 disabled:cursor-not-allowed"
//                       autoComplete="current-password"
//                     />
//                     <button
//                       type="button"
//                       disabled={isLoading}
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {showPassword ? (
//                         <EyeOff className="h-4 w-4" />
//                       ) : (
//                         <Eye className="h-4 w-4" />
//                       )}
//                     </button>
//                   </div>
//                 </Field>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full h-12 text-base font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white"
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                     Authenticating...
//                   </>
//                 ) : (
//                   "Sign In"
//                 )}
//               </Button>
//             </form>

//             <div className="text-center pt-2">
//               <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-medium">
//                 <ShieldCheck className="w-4 h-4 text-emerald-500" />
//                 Protected by internal encryption
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// app/login/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Egg,
} from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldLabel } from "@/components/ui/field";
import { loginUser } from "@/app/actions/auth-actions";

// Define the two distinct themes
const THEMES = {
  trucking: {
    title: "Fhernie Logistics",
    subtitle: "System Portal",
    description:
      "Secure administrative access for Fhernie Logistics live hauling personnel.",
    Icon: Truck,
    primaryBg: "bg-blue-600",
    primaryHover: "hover:bg-blue-700",
    shadow: "shadow-blue-500/20 hover:shadow-blue-500/30",
    gradientText: "from-blue-400 to-indigo-400",
    overlay: "from-blue-600/20 via-slate-900/50 to-purple-600/20",
    orbs: {
      one: "bg-blue-600/20 dark:bg-blue-600/10",
      two: "bg-indigo-600/20 dark:bg-indigo-600/10",
    },
    badge: "bg-blue-500/20 border-blue-400/30 text-blue-300",
    iconBox: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  eggs: {
    title: "Otso Dragon Corp",
    subtitle: "Egg Sales Portal",
    description:
      "Secure administrative access for Otso Dragon Corporation inventory personnel.",
    Icon: Egg,
    primaryBg: "bg-amber-600",
    primaryHover: "hover:bg-amber-700",
    shadow: "shadow-amber-500/20 hover:shadow-amber-500/30",
    gradientText: "from-amber-400 to-orange-400",
    overlay: "from-amber-600/20 via-slate-900/50 to-orange-600/20",
    orbs: {
      one: "bg-amber-600/20 dark:bg-amber-600/10",
      two: "bg-orange-600/20 dark:bg-orange-600/10",
    },
    badge: "bg-amber-500/20 border-amber-400/30 text-amber-300",
    iconBox:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Check the URL parameter. Default to trucking if none is found.
  const activeModule =
    searchParams.get("module") === "eggs" ? "eggs" : "trucking";
  const theme = THEMES[activeModule];
  const CurrentIcon = theme.Icon;

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginUser(formData);

    if (result.success) {
      // Master Admin Routing Check
      if (result.department === "all") {
        if (activeModule === "eggs") {
          router.push("/egg-sales/dashboard");
        } else {
          router.push("/trucking/dashboard");
        }
      }
      // Normal Fhernie Encoder
      else if (result.department === "trucking") {
        router.push("/trucking/dashboard");
      }
      // Normal Otso Dragon Encoder
      else if (result.department === "eggs") {
        router.push("/egg-sales/dashboard");
      }
    } else {
      setErrorMsg(result.error || "An unexpected error occurred.");
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 selection:bg-blue-500/30">
      <Link
        href="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all bg-white/40 dark:bg-slate-900/40 hover:bg-white/80 dark:hover:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Dynamic Background Orbs */}
      <div
        className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none ${theme.orbs.one}`}
      />
      <div
        className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none ${theme.orbs.two}`}
      />

      <div className="relative z-10 w-full max-w-[1000px] m-4 flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
        {/* Left Panel - Dynamic Branding */}
        <div className="hidden md:flex md:w-1/2 relative p-12 flex-col justify-between overflow-hidden bg-slate-900 text-white">
          <div
            className={`absolute inset-0 bg-linear-to-br z-0 ${theme.overlay}`}
          ></div>

          <div className="relative z-10 flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-xl">
              <CurrentIcon className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white/90">
              {theme.title}
            </span>
          </div>

          <div className="relative z-10 mt-auto mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
            <div
              className={`inline-block px-3 py-1 mb-4 rounded-full border backdrop-blur-sm ${theme.badge}`}
            >
              <span className="text-sm font-medium">{theme.subtitle}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Streamlining Your <br />
              <span
                className={`text-transparent bg-clip-text bg-linear-to-r ${theme.gradientText}`}
              >
                Supply Chain
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md font-medium">
              {theme.description}
            </p>
          </div>

          <div className="absolute -bottom-24 -left-24 w-64 h-64 border border-white/5 rounded-full"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 border border-white/5 rounded-full"></div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white/50 dark:bg-slate-950/50">
          <div className="w-full max-w-sm mx-auto space-y-8">
            <div className="md:hidden flex items-center justify-center space-x-3 mb-6">
              <div className={`p-2 rounded-xl ${theme.iconBox}`}>
                <CurrentIcon className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                {theme.title}
              </span>
            </div>

            <div className="text-center md:text-left space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Welcome back
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Please enter your credentials to sign in.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* HIDDEN INPUT FOR THE DOOR CHECK */}
              <input
                type="hidden"
                name="requestedModule"
                value={activeModule}
              />

              {errorMsg && (
                <Alert
                  variant="destructive"
                  className="animate-in fade-in slide-in-from-top-2 duration-300 border-red-500/50 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-5">
                <Field>
                  <FieldLabel
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Email Address
                  </FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@fhernielogistics.com"
                    required
                    className="mt-2 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all duration-200 shadow-sm"
                    autoComplete="email"
                  />
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Password
                  </FieldLabel>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all duration-200 shadow-sm pr-11"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </Field>
              </div>

              <Button
                type="submit"
                className={`w-full h-12 text-base font-medium transition-all duration-300 text-white ${theme.primaryBg} ${theme.primaryHover} ${theme.shadow}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Protected by internal encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Next.js requirement: Wrap useSearchParams in a Suspense boundary
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
