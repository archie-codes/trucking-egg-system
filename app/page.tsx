import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Egg } from "lucide-react";
import Link from "next/link";

export default function DashboardSelection() {
  return (
    <div className="min-h-screen w-full relative bg-background flex flex-col items-center justify-center p-4">
      {/* Dashed Center Fade Grid */}
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
           repeating-linear-gradient(
                  to right,
                  black 0px,
                  black 3px,
                  transparent 3px,
                  transparent 8px
                ),
                repeating-linear-gradient(
                  to bottom,
                  black 0px,
                  black 3px,
                  transparent 3px,
                  transparent 8px
                ),
              radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)
          `,
          WebkitMaskImage: `
            repeating-linear-gradient(
                  to right,
                  black 0px,
                  black 3px,
                  transparent 3px,
                  transparent 8px
                ),
                repeating-linear-gradient(
                  to bottom,
                  black 0px,
                  black 3px,
                  transparent 3px,
                  transparent 8px
                ),
              radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)
          `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />

      {/* Header Branding */}
      <div className="mb-12 text-center relative z-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Trucking History And Egg Sales Monitoring System
        </h1>
        <p className="text-muted-foreground mt-2">
          Select your operational module to continue
        </p>
      </div>

      {/* Module Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl relative z-10">
        {/* Card 1: Live Hauling */}
        <Card className="group hover:border-primary/50 hover:shadow-xl transition-all duration-500 bg-card cursor-pointer">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-muted p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-110">
              <Truck className="w-8 h-8 text-muted-foreground transition-all duration-300 group-hover:text-primary" />
            </div>
            <CardTitle className="text-xl text-foreground">
              Trucking History
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Manage trucking history, trips, expenses and net income daily.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <Link href="/trucking/dashboard" className="w-full">
              <Button className="w-full bg-primary hover:bg-primary/80 text-white font-medium">
                Enter Trucking History
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Card 2: Egg Logistics */}
        <Card className="group hover:border-primary/50 hover:shadow-xl transition-all duration-500 bg-card cursor-pointer">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-muted p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-110">
              <Egg className="w-8 h-8 text-muted-foreground transition-all duration-300 group-hover:text-primary" />
            </div>
            <CardTitle className="text-xl text-foreground">
              Egg Logistics & Sales
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Manage multi-size egg tray deliveries, sales monitoring, and
              logistics expenses.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <Link href="/egg-sales/dashboard" className="w-full">
              <Button className="w-full bg-primary hover:bg-primary/80 text-white font-medium">
                Enter Egg Logistics & Sales
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Footer / System Status */}
      <div className="mt-16 text-sm text-muted-foreground relative z-10">
        <p>© 2026 Fhernie Logistics & Otso Dragon Corp.</p>
      </div>
    </div>
  );
}
