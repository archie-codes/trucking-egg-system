"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 dark:bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid grid-cols-40 w-[200%] h-[200%] opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #f59e0b 1px, transparent 1px), linear-gradient(to bottom, #f59e0b 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main Content Card */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Animated Chicken SVG */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-amber-100 dark:bg-amber-900/30 rounded-full animate-pulse opacity-50 blur-2xl" />

          <svg
            width="240"
            height="240"
            viewBox="0 0 240 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl relative z-10"
          >
            {/* Floating Question Marks */}
            <g className="animate-pulse" style={{ animationDuration: "2s" }}>
              <text
                x="30"
                y="80"
                fontSize="32"
                fill="#fbbf24"
                fontWeight="bold"
                style={{ transform: "rotate(-15deg)" }}
              >
                ?
              </text>
              <text
                x="190"
                y="90"
                fontSize="24"
                fill="#fbbf24"
                fontWeight="bold"
                style={{ transform: "rotate(15deg)" }}
              >
                ?
              </text>
              <text
                x="160"
                y="40"
                fontSize="40"
                fill="#fbbf24"
                fontWeight="bold"
                style={{ transform: "rotate(10deg)" }}
              >
                ?
              </text>
            </g>

            {/* Chicken Body */}
            <circle cx="120" cy="140" r="50" fill="#FDE047" />

            {/* Chicken Comb */}
            <path
              d="M105 95 C105 80, 115 80, 115 95 C115 75, 125 75, 125 95 C125 80, 135 80, 135 95 Z"
              fill="#EF4444"
            />

            {/* Chicken Eyes */}
            <circle cx="105" cy="130" r="10" fill="white" />
            <circle cx="135" cy="130" r="10" fill="white" />

            {/* Pupils looking up */}
            <circle cx="105" cy="126" r="4" fill="#0F172A" />
            <circle cx="135" cy="126" r="4" fill="#0F172A" />

            {/* Cheeks */}
            <circle cx="90" cy="140" r="6" fill="#FCA5A5" opacity="0.6" />
            <circle cx="150" cy="140" r="6" fill="#FCA5A5" opacity="0.6" />

            {/* Beak */}
            <path
              d="M110 145 L130 145 L120 155 Z"
              fill="#F97316"
              stroke="#ea580c"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Cracked Egg Shell (Bottom) */}
            <path
              d="M60 160 C60 210, 180 210, 180 160 L165 145 L150 165 L135 140 L120 165 L105 140 L90 165 L75 145 Z"
              fill="#F8FAFC"
              stroke="#CBD5E1"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Cracked Egg Shell (Top Piece - Floating) */}
            <path
              d="M90 60 C90 30, 150 30, 150 60 L140 75 L130 65 L120 80 L110 65 L100 75 Z"
              fill="#F8FAFC"
              stroke="#CBD5E1"
              strokeWidth="4"
              strokeLinejoin="round"
              className="animate-bounce"
              style={{ animationDuration: "3s" }}
            />
          </svg>
        </div>

        {/* Text */}
        <h1 className="text-7xl font-black text-amber-500 dark:text-amber-400 tracking-tight mb-2 drop-shadow-sm">
          404
        </h1>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
          Page Not Found!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-md">
          Looks like this little chick wandered too far from the coop. The page
          you are looking for might have been moved or doesn't exist anymore.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>

          <Link href="/" className="w-full sm:w-auto">
            <button className="w-full inline-flex items-center justify-center h-12 px-6 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-800 transition-all active:scale-95">
              <Home className="w-4 h-4 mr-2" />
              Return to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
