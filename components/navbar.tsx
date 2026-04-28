"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Globe } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    {
      href: "https://app.fhernieotso.com",
      label: "Sales Monitoring System",
      external: true,
      type: "image",
      src: "/sales-logo.png",
    },
    {
      href: "https://www.fhernieotso.com",
      label: "Website Page",
      external: true,
      type: "icon",
      icon: Globe,
    },
  ];

  const textClass = isScrolled ? "text-white" : "text-foreground";
  const hoverClass = isScrolled ? "hover:text-green-200" : "hover:text-primary";

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 border-b border-transparent bg-transparent`}
      >
        {/* Smooth Gradient Crossfade Overlay */}
        <div
          className={`absolute inset-0 bg-linear-to-r from-green-600 to-green-700 shadow-md backdrop-blur-md transition-opacity duration-500 ${
            isScrolled ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div
            className={`flex justify-between items-center transition-all duration-500 ${isScrolled ? "h-16" : "h-20"}`}
          >
            {/* Logo */}
            <Link href="/" className={`flex items-center gap-3 ${textClass}`}>
              {/* Logo Image */}
              <div className="shrink-0 transition-transform hover:scale-105 duration-300">
                <Image
                  src="/logo.png"
                  alt="FhernieOtso Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-extrabold text-xl leading-none tracking-tight hidden sm:block">
                  Fhernie
                  <span
                    className={isScrolled ? "text-green-300" : "text-primary"}
                  >
                    Otso
                  </span>
                </span>
                <span
                  className={`text-[9px] uppercase tracking-widest font-bold mt-1 hidden sm:block opacity-90 ${isScrolled ? "text-white" : "text-muted-foreground"}`}
                >
                  Logistics & Poultry
                </span>
              </div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6">
              <TooltipProvider delayDuration={200}>
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Tooltip key={link.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={link.href}
                          target={link.external ? "_blank" : undefined}
                          rel={
                            link.external ? "noopener noreferrer" : undefined
                          }
                          className={`relative ${textClass} ${hoverClass} transition-colors flex items-center justify-center group p-2`}
                        >
                          {link.type === "image" && link.src ? (
                            <Image
                              src={link.src}
                              alt={link.label}
                              width={24}
                              height={24}
                              className="object-contain transition-transform group-hover:scale-110"
                            />
                          ) : link.type === "icon" && link.icon ? (
                            <link.icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                          ) : (
                            <span className="font-medium text-sm py-1">
                              {link.label}
                              <span
                                className={`absolute left-0 bottom-0 h-0.5 bg-current transition-all duration-300 ${
                                  isActive ? "w-full" : "w-0 group-hover:w-full"
                                }`}
                              />
                            </span>
                          )}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        sideOffset={8}
                        className="bg-foreground text-background border shadow-md font-medium text-xs rounded-md px-2 py-1"
                      >
                        <p>{link.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </div>
            <button
              className={`md:hidden transition-colors duration-500 ${textClass}`}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div
              className={`md:hidden border-t py-4 space-y-2 transition-colors duration-500 ${
                isScrolled
                  ? "border-green-600 bg-linear-to-r from-green-600 to-green-700"
                  : "border-border bg-background"
              } absolute left-0 right-0 px-4 shadow-xl`}
            >
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                      isActive
                        ? isScrolled
                          ? "bg-green-600 text-white font-semibold"
                          : "bg-muted text-foreground font-semibold"
                        : isScrolled
                          ? "text-white hover:bg-green-600"
                          : "text-foreground hover:bg-muted"
                    }`}
                    onClick={() => {
                      if (!link.external) {
                        setIsOpen(false);
                      }
                    }}
                  >
                    {link.type === "image" && link.src ? (
                      <Image
                        src={link.src}
                        alt={link.label}
                        width={20}
                        height={20}
                        className="object-contain shrink-0"
                      />
                    ) : link.type === "icon" && link.icon ? (
                      <link.icon className="w-5 h-5 shrink-0" />
                    ) : null}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
