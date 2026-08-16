"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldLabel } from "@/components/ui/field";
import { loginUser } from "@/app/actions/auth-actions";

import Image from "next/image";
import StrokeText from "@/components/StrokeText";

// Define the two distinct themes
const THEMES = {
  trucking: {
    title: "Fhernie Logistics",
    // subtitle: "System Portal",
    description:
      "Secure administrative access for Fhernie Logistics live hauling personnel.",
    logoUrl: "/logo.png",
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
    // subtitle: "Egg Sales Portal",
    description:
      "Secure administrative access for Otso Dragon Corporation inventory personnel.",
    logoUrl: "/logo.png",
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
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sm:hidden">Back</span>
        <span className="hidden sm:inline">Back to home</span>
      </Link>

      {/* Dynamic Background Orbs */}
      <div
        className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none ${theme.orbs.one}`}
      />
      <div
        className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none ${theme.orbs.two}`}
      />

      <div className="relative z-10 w-full max-w-[95%] sm:max-w-md md:max-w-4xl lg:max-w-[1000px] m-4 sm:m-8 flex flex-col md:flex-row rounded-lg overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
        {/* Left Panel - Dynamic Branding */}
        <div className="hidden md:flex md:w-5/12 lg:w-1/2 relative p-8 lg:p-12 flex-col justify-between overflow-hidden bg-slate-900 text-white animate-in fade-in slide-in-from-left-12 duration-700 ease-out fill-mode-both">
          <div
            className={`absolute inset-0 bg-linear-to-br z-0 ${theme.overlay}`}
          ></div>

          <div className="relative z-10 flex items-center space-x-2.5 lg:space-x-3">
            <Image
              src={theme.logoUrl}
              alt={theme.title}
              width={40}
              height={40}
              className="w-8 h-8 lg:w-10 lg:h-10 object-contain shrink-0"
            />
            <span className="font-bold text-xl lg:text-2xl tracking-tight text-white/90">
              {theme.title}
            </span>
          </div>

          <div className="relative z-10 mt-auto mb-4 lg:mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
            {/* <div
              className={`inline-block px-2 lg:px-3 py-1 mb-3 lg:mb-4 rounded-full border backdrop-blur-sm ${theme.badge}`}
            >
              <span className="text-xs lg:text-sm font-medium">
                {theme.subtitle}
              </span>
            </div> */}
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 lg:mb-6 leading-tight tracking-tight">
              <StrokeText
                text="Streamlining Your"
                strokeColor="#9370fe"
                fillColor="#F8FAFC"
                strokeWidth={1.4}
                drawDuration={1.6}
                fillDelay={0.2}
                stagger={0.05}
                ease="power2.out"
                trigger="mount"
                fillMode="wipe"
                fontSize={48}
                fontWeight={700}
                letterSpacing={-1.2}
                reverse={false}
              />
              <span
                className={`ml-1 block text-transparent bg-clip-text bg-linear-to-r ${theme.gradientText}`}
              >
                Supply Chain
              </span>
            </h1>
            <p className="text-slate-400 text-sm lg:text-lg max-w-md font-medium">
              {theme.description}
            </p>
          </div>

          <div className="absolute -bottom-24 -left-24 w-64 h-64 border border-white/5 rounded-full"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 border border-white/5 rounded-full"></div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-7/12 lg:w-1/2 p-6 sm:p-8 md:p-10 lg:p-16 flex flex-col justify-center bg-white/50 dark:bg-slate-950/50 animate-in fade-in slide-in-from-right-12 duration-700 ease-out fill-mode-both">
          <div className="w-full max-w-sm mx-auto space-y-6 lg:space-y-8">
            <div className="md:hidden flex items-center justify-center space-x-3 mb-2 sm:mb-6">
              <Image
                src={theme.logoUrl}
                alt={theme.title}
                width={32}
                height={32}
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0"
              />
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                {theme.title}
              </span>
            </div>

            <div className="text-center md:text-left space-y-1 sm:space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Welcome back
              </h2>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
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
                    className="mt-1 h-12 rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all duration-200 "
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
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="h-12 rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all duration-200 pr-11"
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
                className={`w-full rounded-xl h-12 text-base font-medium transition-all duration-300 text-white ${theme.primaryBg} ${theme.primaryHover} ${theme.shadow}`}
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

// "use client";

// import { useState, Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   Loader2,
//   Eye,
//   EyeOff,
//   AlertCircle,
//   ShieldCheck,
//   Truck,
//   ArrowLeft,
//   Egg,
//   Mail,
//   Lock,
// } from "lucide-react";
// import Link from "next/link";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Field, FieldLabel } from "@/components/ui/field";
// import { loginUser } from "@/app/actions/auth-actions";

// // Two brands, one shell. Each module only changes an accent — never the
// // structure — so the page reads as one calm system rather than two skins.
// const THEMES = {
//   trucking: {
//     key: "trucking",
//     name: "Fhernie Logistics",
//     subtitle: "Fleet & Trip Management",
//     Icon: Truck,
//     accent: {
//       text: "text-blue-600 dark:text-blue-400",
//       bg: "bg-blue-600",
//       hoverBg: "hover:bg-blue-700",
//       ring: "focus-visible:ring-blue-500/40 dark:focus-visible:ring-blue-500/30",
//       badgeBg: "bg-blue-50 dark:bg-blue-500/10",
//       bar: "bg-blue-600",
//       blob: "bg-blue-500/10 dark:bg-blue-500/[0.07]",
//       dot: "bg-blue-500",
//     },
//   },
//   eggs: {
//     key: "eggs",
//     name: "Otso Dragon Corp",
//     subtitle: "Egg Sales & Inventory",
//     Icon: Egg,
//     accent: {
//       text: "text-amber-600 dark:text-amber-400",
//       bg: "bg-amber-600",
//       hoverBg: "hover:bg-amber-700",
//       ring: "focus-visible:ring-amber-500/40 dark:focus-visible:ring-amber-500/30",
//       badgeBg: "bg-amber-50 dark:bg-amber-500/10",
//       bar: "bg-amber-600",
//       blob: "bg-amber-500/10 dark:bg-amber-500/[0.07]",
//       dot: "bg-amber-500",
//     },
//   },
// } as const;

// type ModuleKey = keyof typeof THEMES;

// function LoginForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [isLoading, setIsLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);
//   const [showPassword, setShowPassword] = useState(false);

//   const activeModule: ModuleKey =
//     searchParams.get("module") === "eggs" ? "eggs" : "trucking";
//   const theme = THEMES[activeModule];
//   const CurrentIcon = theme.Icon;

//   async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setIsLoading(true);
//     setErrorMsg(null);

//     const formData = new FormData(e.currentTarget);
//     const result = await loginUser(formData);

//     if (result.success) {
//       if (result.department === "all") {
//         router.push(
//           activeModule === "eggs"
//             ? "/egg-sales/dashboard"
//             : "/trucking/dashboard",
//         );
//       } else if (result.department === "trucking") {
//         router.push("/trucking/dashboard");
//       } else if (result.department === "eggs") {
//         router.push("/egg-sales/dashboard");
//       }
//     } else {
//       setErrorMsg(result.error || "An unexpected error occurred.");
//       setIsLoading(false);
//     }
//   }

//   return (
//     <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:py-16">
//       {/* Fine dot grid — subtle, flat CSS, no filters or blend modes to break in older browsers */}
//       <div
//         aria-hidden="true"
//         className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.07)_1px,transparent_0)] [background-size:22px_22px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)]"
//       />
//       {/* One soft accent blob, not two — signature color without gradient noise */}
//       <div
//         aria-hidden="true"
//         className={`pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/3 rounded-full blur-[110px] transition-colors duration-500 ${theme.accent.blob}`}
//       />

//       <div className="relative z-10 flex w-full max-w-[420px] items-center justify-between gap-3">
//         <Link
//           href="/"
//           className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
//         >
//           <ArrowLeft className="h-4 w-4" />
//           <span className="sm:hidden">Back</span>
//           <span className="hidden sm:inline">Back to home</span>
//         </Link>

//         <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/70 p-1 dark:border-slate-800 dark:bg-slate-900/70">
//           <Link
//             href="/login?module=trucking"
//             aria-current={activeModule === "trucking" ? "page" : undefined}
//             className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
//               activeModule === "trucking"
//                 ? "bg-blue-600 text-white shadow-sm"
//                 : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
//             }`}
//           >
//             <Truck className="h-3.5 w-3.5" />
//             Fleet
//           </Link>
//           <Link
//             href="/login?module=eggs"
//             aria-current={activeModule === "eggs" ? "page" : undefined}
//             className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
//               activeModule === "eggs"
//                 ? "bg-amber-600 text-white shadow-sm"
//                 : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
//             }`}
//           >
//             <Egg className="h-3.5 w-3.5" />
//             Eggs
//           </Link>
//         </div>
//       </div>

//       <div
//         key={activeModule}
//         className="relative z-10 mt-6 w-full max-w-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 dark:border-slate-800 dark:bg-slate-900"
//       >
//         <div className={`h-[3px] w-full ${theme.accent.bar}`} />

//         <div className="px-6 py-8 sm:px-8 sm:py-10">
//           <div className="mb-6 flex items-center gap-3">
//             <div
//               className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.accent.badgeBg}`}
//             >
//               <CurrentIcon className={`h-5 w-5 ${theme.accent.text}`} />
//             </div>
//             <div className="min-w-0">
//               <p className="truncate text-sm font-semibold leading-tight text-slate-900 dark:text-white">
//                 {theme.name}
//               </p>
//               <p className="truncate text-xs text-slate-500 dark:text-slate-400">
//                 {theme.subtitle}
//               </p>
//             </div>
//             <div className="ml-auto flex shrink-0 items-center gap-1.5">
//               <span
//                 className={`h-1.5 w-1.5 rounded-full ${theme.accent.dot} motion-safe:animate-pulse`}
//               />
//               <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
//                 Online
//               </span>
//             </div>
//           </div>

//           <div className="mb-6">
//             <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
//               Sign in to continue
//             </h1>
//             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//               Enter your credentials to access the portal.
//             </p>
//           </div>

//           <form onSubmit={handleLogin} className="space-y-5" noValidate={false}>
//             <input type="hidden" name="requestedModule" value={activeModule} />

//             {errorMsg && (
//               <Alert
//                 variant="destructive"
//                 role="alert"
//                 aria-live="assertive"
//                 className="animate-in fade-in slide-in-from-top-1 duration-200 border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
//               >
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>{errorMsg}</AlertDescription>
//               </Alert>
//             )}

//             <Field>
//               <FieldLabel
//                 htmlFor="email"
//                 className="text-sm font-medium text-slate-700 dark:text-slate-300"
//               >
//                 Email address
//               </FieldLabel>
//               <div className="relative mt-2">
//                 <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//                 <Input
//                   id="email"
//                   name="email"
//                   type="email"
//                   inputMode="email"
//                   enterKeyHint="next"
//                   placeholder="name@fhernielogistics.com"
//                   required
//                   autoComplete="email"
//                   aria-invalid={!!errorMsg}
//                   className={`h-11 rounded-lg border-slate-200 bg-slate-50 pl-10 text-sm shadow-none transition-shadow focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-offset-0 dark:border-slate-800 dark:bg-slate-950 ${theme.accent.ring}`}
//                 />
//               </div>
//             </Field>

//             <Field>
//               <FieldLabel
//                 htmlFor="password"
//                 className="text-sm font-medium text-slate-700 dark:text-slate-300"
//               >
//                 Password
//               </FieldLabel>
//               <div className="relative mt-2">
//                 <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//                 <Input
//                   id="password"
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   enterKeyHint="go"
//                   placeholder="••••••••"
//                   required
//                   autoComplete="current-password"
//                   aria-invalid={!!errorMsg}
//                   className={`h-11 rounded-lg border-slate-200 bg-slate-50 pl-10 pr-11 text-sm shadow-none transition-shadow focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-offset-0 dark:border-slate-800 dark:bg-slate-950 ${theme.accent.ring}`}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((v) => !v)}
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                   aria-pressed={showPassword}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                 </button>
//               </div>
//             </Field>

//             <Button
//               type="submit"
//               disabled={isLoading}
//               className={`h-11 w-full rounded-lg text-sm font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-70 dark:focus-visible:ring-offset-slate-900 ${theme.accent.bg} ${theme.accent.hoverBg} ${theme.accent.ring}`}
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Signing in…
//                 </>
//               ) : (
//                 "Sign in"
//               )}
//             </Button>
//           </form>

//           <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
//             <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
//             Protected internal system — authorized personnel only
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function LoginPage() {
//   return (
//     <Suspense
//       fallback={
//         <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-slate-50 dark:bg-slate-950">
//           <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
//         </div>
//       }
//     >
//       <LoginForm />
//     </Suspense>
//   );
// }
