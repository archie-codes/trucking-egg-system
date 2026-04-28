// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Truck, Egg } from "lucide-react";
// import Link from "next/link";

// export default function DashboardSelection() {
//   return (
//     <div className="min-h-screen w-full relative bg-background flex flex-col items-center justify-center p-4">
//       {/* Dashed Center Fade Grid */}
//       <div
//         className="absolute inset-0 z-0 pointer-events-none"
//         style={{
//           backgroundImage: `
//             linear-gradient(to right, #e7e5e4 1px, transparent 1px),
//             linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
//           `,
//           backgroundSize: "20px 20px",
//           backgroundPosition: "0 0, 0 0",
//           maskImage: `
//            repeating-linear-gradient(
//                   to right,
//                   black 0px,
//                   black 3px,
//                   transparent 3px,
//                   transparent 8px
//                 ),
//                 repeating-linear-gradient(
//                   to bottom,
//                   black 0px,
//                   black 3px,
//                   transparent 3px,
//                   transparent 8px
//                 ),
//               radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)
//           `,
//           WebkitMaskImage: `
//             repeating-linear-gradient(
//                   to right,
//                   black 0px,
//                   black 3px,
//                   transparent 3px,
//                   transparent 8px
//                 ),
//                 repeating-linear-gradient(
//                   to bottom,
//                   black 0px,
//                   black 3px,
//                   transparent 3px,
//                   transparent 8px
//                 ),
//               radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)
//           `,
//           maskComposite: "intersect",
//           WebkitMaskComposite: "source-in",
//         }}
//       />

//       {/* Header Branding */}
//       <div className="mb-12 text-center relative z-10">
//         <h1 className="text-3xl font-bold tracking-tight text-foreground">
//           Trucking History And Egg Sales Monitoring System
//         </h1>
//         <p className="text-muted-foreground mt-2">
//           Select your operational module to continue
//         </p>
//       </div>

//       {/* Module Selection Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl relative z-10">
//         {/* Card 1: Live Hauling */}
//         <Card className="group hover:border-primary/50 hover:shadow-xl transition-all duration-500 bg-card cursor-pointer">
//           <CardHeader className="text-center pb-2">
//             <div className="mx-auto bg-muted p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-110">
//               <Truck className="w-8 h-8 text-muted-foreground transition-all duration-300 group-hover:text-primary" />
//             </div>
//             <CardTitle className="text-xl text-foreground">
//               Trucking History
//             </CardTitle>
//             <CardDescription className="text-muted-foreground mt-2">
//               Manage trucking history, trips, expenses and net income daily.
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="flex justify-center pt-4">
//             <Link href="/trucking/dashboard" className="w-full">
//               <Button className="w-full bg-primary hover:bg-primary/80 text-white font-medium">
//                 Enter Trucking History
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>

//         {/* Card 2: Egg Logistics */}
//         <Card className="group hover:border-primary/50 hover:shadow-xl transition-all duration-500 bg-card cursor-pointer">
//           <CardHeader className="text-center pb-2">
//             <div className="mx-auto bg-muted p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-110">
//               <Egg className="w-8 h-8 text-muted-foreground transition-all duration-300 group-hover:text-primary" />
//             </div>
//             <CardTitle className="text-xl text-foreground">
//               Egg Logistics & Sales
//             </CardTitle>
//             <CardDescription className="text-muted-foreground mt-2">
//               Manage multi-size egg tray deliveries, sales monitoring, and
//               logistics expenses.
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="flex justify-center pt-4">
//             <Link href="/egg-sales/dashboard" className="w-full">
//               <Button className="w-full bg-primary hover:bg-primary/80 text-white font-medium">
//                 Enter Egg Logistics & Sales
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Footer / System Status */}
//       <div className="mt-16 text-sm text-muted-foreground relative z-10">
//         <p>© 2026 Fhernie Logistics & Otso Dragon Corp.</p>
//       </div>
//     </div>
//   );
// }

import HeroCard from "@/components/hero-card";
import { Truck, Egg } from "lucide-react";
import { NavBar } from "@/components/navbar";

export default function DashboardSelection() {
  return (
    <div className="min-h-dvh w-full relative bg-background flex flex-col items-center justify-start md:justify-center p-4 pt-28 md:pt-4 overflow-x-hidden">
      <NavBar />
      {/* Dashed Center Fade Grid (from your old code) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
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

      {/* Header Branding */}
      <div className="mb-10 flex flex-col items-center text-center relative z-10 mt-10">
        {/* Premium Typography Heading */}
        <h1 className="text-3xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <span className="inline-block bg-clip-text text-transparent bg-linear-to-r from-blue-500 to-indigo-500">
            Trucking History
          </span>{" "}
          <span className="text-muted-foreground/50 font-light mx-1">&</span>{" "}
          <span className="inline-block bg-clip-text text-transparent bg-linear-to-r from-amber-400 to-orange-500 drop-shadow-sm relative">
            Egg Sales
            <span className="absolute -inset-1 rounded-lg bg-primary/10 blur-xl -z-10"></span>
          </span>{" "}
          <br className="hidden md:block mt-2" />
          <span className="inline-block mt-1 md:mt-2">Monitoring System</span>
        </h1>

        {/* Refined Subtitle */}
        <p className="text-muted-foreground mt-6 text-md max-w-3xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
          Centralized dashboard for tracking daily logistics, trip expenses, and
          multi-size egg tray deliveries. <br /> Select a module to proceed
        </p>
      </div>

      {/* Module Selection Cards */}
      <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-8 max-w-5xl relative z-10 w-full px-2">
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
        />
      </div>

      {/* Footer / System Status */}
      <div className="mt-16 text-sm text-muted-foreground relative z-10 pb-8">
        <p>© 2026 Fhernie Logistics & Otso Dragon Corp.</p>
      </div>
    </div>
  );
}
