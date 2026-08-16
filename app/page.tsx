"use client";

import { useState } from "react";
import HeroCard from "@/components/global/hero-card";
import { NavBar } from "@/components/global/navbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2 } from "lucide-react";

export default function DashboardSelection() {
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  return (
    <div className="min-h-dvh w-full relative bg-background flex flex-col items-center justify-start xl:justify-center p-4 pt-24 md:pt-28 xl:pt-4 overflow-x-hidden">
      <NavBar />
      {/* Dashed Center Fade Grid (from your old code) - Light Mode Only */}
      <div
        className="absolute inset-0 z-0 pointer-events-none dark:hidden"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e7e5e4 1px, transparent 1px),
            linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage: `
           repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px),
           repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px),
           radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)
          `,
          WebkitMaskImage: `
            repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px),
            repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px),
            radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)
          `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />

      {/* Glowing Gradient - Dark Mode Only */}
      <div className="absolute inset-0 z-0 pointer-events-none hidden dark:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(37,99,235,0.15),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_50%_at_50%_50%,rgba(79,70,229,0.15),transparent_70%)]"></div>
      </div>

      {/* Header Branding */}
      <div className="mb-6 xl:mb-10 flex flex-col items-center text-center relative z-10 mt-6 xl:mt-10">
        {/* Premium Typography Heading */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-1000 leading-tight">
          <span className="inline-block bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500">
            Fhernie Logistics
          </span>{" "}
          <span className="text-muted-foreground/30 font-light mx-2">&</span>{" "}
          <span className="inline-block bg-clip-text text-transparent bg-linear-to-r from-green-500 to-green-500 drop-shadow-sm relative">
            Otso Dragon Corp
          </span>{" "}
          <br className="hidden md:block mt-2" />
          <span className="inline-block mt-2 text-2xl md:text-3xl text-foreground/90 font-bold">
            Unified Management Portal
          </span>
        </h1>

        {/* Refined Subtitle */}
        <p className="text-muted-foreground mt-5 text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
          Centralized dashboard for overseeing trucking logistics, egg sales,
          poultry farm operations, and financial records.{" "}
          <br className="hidden md:block" /> Select a module to proceed
        </p>
      </div>

      {/* Module Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-8 max-w-[98%] xl:max-w-[1400px] relative z-10 w-full px-2 place-items-center">
        {/* Card 1: Fhernie Logistics */}
        <HeroCard
          variant="first"
          image="/images/trucking_poultry_bg.png"
          // icon={<Truck className="w-10 h-10 text-[#3f5efb]" strokeWidth={2} />}
          icon={
            <video
              src="/flaticon/truck.mp4"
              className="absolute bottom-0 left-0 w-full h-full object-contain"
              autoPlay
              loop
              muted
            />
          }
          title="Trucking History"
          description="Manage trucking history, trips, expenses and net income daily."
          href="/login?module=trucking"
          buttonText="Enter Trucking"
          badge="Now Online"
        />

        {/* Card 2: Otso Dragon Corp */}
        <HeroCard
          variant="second"
          image="/images/egg_poultry_bg.png"
          // icon={<Egg className="w-10 h-10 text-[#bb7413]" strokeWidth={2} />}
          // icon={<video src="/Hatch.webm" autoPlay loop muted />}
          icon={
            <video
              src="/flaticon/eggs.mp4"
              className="absolute bottom-0 left-0 w-full h-full object-contain"
              autoPlay
              loop
              muted
            />
          }
          title="Egg Sales Monitoring"
          description="Manage multi-size egg tray deliveries, sales monitoring, and logistics expenses."
          href="/login?module=eggs"
          buttonText="Enter Egg Sales"
          badge="Under Pilot"
        />
        {/* Card 3: Otso Poultry System */}
        <HeroCard
          variant="third"
          image="/images/otso_poultry_bg.png"
          // icon={<Egg className="w-10 h-10 text-[#bb7413]" strokeWidth={2} />}
          // icon={<video src="/Hatch.webm" autoPlay loop muted />}
          icon={
            <video
              src="/flaticon/chicken.mp4"
              className="absolute bottom-0 left-0 w-full h-full object-contain"
              autoPlay
              loop
              muted
            />
          }
          title="Otso Poultry System"
          description="Manage farm operations, monitor stock levels, and track production performance."
          href="https://app.fhernieotso.com"
          buttonText="Enter Otso Poultry"
          badge="Now Online"
        />

        {/* Card 4: Cheque and Voucher */}
        <HeroCard
          variant="fourth"
          image="/images/cheque_voucher_bg.png"
          // icon={<Egg className="w-10 h-10 text-[#bb7413]" strokeWidth={2} />}
          // icon={<video src="/Hatch.webm" autoPlay loop muted />}
          icon={
            <video
              src="/flaticon/cheque.mp4"
              className="absolute bottom-0 left-0 w-full h-full object-contain"
              autoPlay
              loop
              muted
            />
          }
          title="Cheque and Voucher"
          description="Manage cheque issued, cheque received, and cheque status."
          href="#"
          buttonText="Enter Cheque and Voucher"
          badge="Coming Soon"
          onClick={() => setIsNoticeOpen(true)}
        />
      </div>

      {/* Footer / System Status */}
      <div className="mt-16 text-sm text-muted-foreground relative z-10 pb-8">
        <p>© 2026 Fhernie Logistics & Otso Dragon Corp.</p>
      </div>

      {/* Notice Modal for Cheque and Voucher Portal */}
      <Dialog open={isNoticeOpen} onOpenChange={setIsNoticeOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            {/* Header Icon / Badge */}

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Coming Soon to Serve You
            </div>

            <DialogTitle className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Cheque & Voucher Portal
            </DialogTitle>

            <DialogDescription className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
              We are currently building and finalizing this module to provide
              you with a secure, automated financial tracking system.
            </DialogDescription>
          </DialogHeader>

          {/* Feature Highlights */}
          <div className="space-y-3 my-2 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                <strong>Cheque Records:</strong> Monitor issued & received
                cheques and clearing statuses.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                <strong>Voucher Management:</strong> Generate and archive
                digital payment vouchers.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                <strong>Financial Security:</strong> Real-time status updates
                and authorization controls.
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => setIsNoticeOpen(false)}
              className="w-full h-11 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-purple-500/20 transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              Got It, Thank You!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
