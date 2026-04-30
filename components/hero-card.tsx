import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HeroCardProps {
  image: string;
  logo?: string;
  icon?: React.ReactNode;
  title: string;
  description: string;
  href: string;
  buttonText: string;
  variant?: "first" | "second" | "third" | "fourth";
}

export default function HeroCard({
  image,
  logo,
  icon,
  title,
  description,
  href,
  buttonText,
  variant = "first",
}: HeroCardProps) {
  // You can adjust these gradients to match Fhernie/Otso branding colors
  const gradientClass =
    variant === "first"
      ? "bg-gradient-to-t from-[#3f5efb] to-[#fc466b]"
      : variant === "second"
        ? "bg-gradient-to-t from-[#bb7413] to-[#e7d25c]"
        : variant === "third"
          ? "bg-gradient-to-t from-[#11998e] to-[#38ef7d]"
          : variant === "fourth"
            ? "bg-gradient-to-t from-[#8e2de2] to-[#4a00e0]" // Fixed this line (added quotes)
            : "bg-gradient-to-t from-[#8e2de2] to-[#4a00e0]"; // Default

  return (
    <Card className="group relative w-full max-w-[380px] xl:max-w-[400px] aspect-4/5 sm:aspect-square rounded-[30px] overflow-hidden shadow-2xl border-none mx-auto text-left cursor-pointer transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-2">
      {/* Background Image Area */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Skewed Gradient Overlay */}
      <div
        className={`absolute top-[55%] left-[3px] h-[125%] w-[108%] rounded-[30px] transform skew-x-19 rotate-[9deg] z-10 ${gradientClass} transition-all duration-500 group-hover:top-[50%] opacity-95`}
      />

      {/* Glassmorphism Icon Area (Moved to top-left of the gradient for better text spacing) */}
      <div className="absolute bottom-[43%] left-[30px] h-20 w-20 rounded-[20px] bg-white/80 backdrop-blur-md border border-white/40 overflow-hidden shadow-lg z-20 flex items-center justify-center p-2 transition-all duration-500 group-hover:-translate-y-3 group-hover:scale-105">
        {icon
          ? icon
          : logo && (
              <img
                src={logo}
                alt="Module Logo"
                className="h-full w-full object-contain drop-shadow-md"
              />
            )}
      </div>

      {/* Main Text Content (Given full width below the icon) */}
      <div className="absolute bottom-[18%] left-[24px] right-[24px] z-20 transition-all duration-500 group-hover:-translate-y-2">
        <h3 className="text-white font-black text-xl md:text-[18px] lg:text-xl xl:text-xl 2xl:text-xl leading-tight uppercase mb-1 md:mb-2 drop-shadow-sm">
          {title}
        </h3>
        <p className="text-white/90 text-xs md:text-sm xl:text-xs 2xl:text-xs font-medium leading-relaxed drop-shadow-sm line-clamp-2 sm:line-clamp-3">
          {description}
        </p>
      </div>

      {/* Animated Route Button */}
      <div className="absolute bottom-[6%] left-[24px] right-[24px] z-20 transition-all duration-500 group-hover:-translate-y-2">
        <Link href={href} className="w-full block">
          <Button className="w-full bg-white/20 hover:bg-white text-white hover:text-slate-900 font-bold backdrop-blur-sm border border-white/30 transition-all duration-300 group/btn">
            {buttonText}
            <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
