"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, Box, Mail } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/blog", icon: Newspaper, label: "Insights" },
  { href: "/hub/snippets", icon: Box, label: "Hub" },
  { href: "/#contact", icon: Mail, label: "Contact" },
];

export function DockNav() {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <nav
        className="fixed right-4 top-1/2 -translate-y-1/2 z-[9999] flex flex-col gap-2"
        aria-label="Main navigation"
      >
        <div className="flex flex-col gap-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 p-2">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : href.startsWith("/#")
                ? pathname === "/"
                : pathname.startsWith(href);

            const isAnchor = href.startsWith("/#");

            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  {isAnchor ? (
                    <a
                      href={href}
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200
                        ${
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-white/40 hover:text-white hover:bg-white/5"
                        }`}
                      aria-label={label}
                    >
                      <Icon size={18} strokeWidth={1.5} />
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200
                        ${
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-white/40 hover:text-white hover:bg-white/5"
                        }`}
                      aria-label={label}
                    >
                      <Icon size={18} strokeWidth={1.5} />
                    </Link>
                  )}
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  className="bg-white/10 backdrop-blur-md border-white/10 text-white text-xs tracking-widest font-syne"
                >
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </nav>
    </TooltipProvider>
  );
}
