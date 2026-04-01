"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, Fragment } from "react";
import {
  Home,
  Newspaper,
  Box,
  Mail,
  MessageSquare,
  GraduationCap,
  BadgeCheck,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Every primary App Router page — dock is global in `layout.jsx` (all routes). */
const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/expertise", icon: GraduationCap, label: "Expertise" },
  { href: "/validation", icon: BadgeCheck, label: "Validation" },
  { href: "/blog", icon: Newspaper, label: "Insights" },
  { href: "/hub/snippets", icon: Box, label: "Hub" },
  { href: "/hub/chat", icon: MessageSquare, label: "Chat" },
  { href: "/#contact", icon: Mail, label: "Contact" },
];

export function DockNav() {
  const pathname = usePathname();
  /** Radix Tooltip captures the first tap on touch; only mount tooltips for hover-capable pointers. */
  const [tooltipsEnabled, setTooltipsEnabled] = useState(false);
  /** So Home vs Contact don’t both read “active” on `/`. */
  const [hash, setHash] = useState("");

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setTooltipsEnabled(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const syncHash = () => setHash(typeof window !== "undefined" ? window.location.hash : "");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  const itemClass = (active) =>
    cn(
      "flex size-10 items-center justify-center rounded-full border border-transparent transition-all duration-300 ease-out will-change-[box-shadow,transform]",
      active
        ? "border-[rgba(0,240,255,0.32)] bg-[rgba(0,240,255,0.14)] text-[#00f0ff] shadow-[0_0_14px_rgba(0,240,255,0.38),0_0_32px_rgba(0,240,255,0.16)]"
        : cn(
            "text-white/40",
            "hover:scale-[1.04] hover:border-[rgba(0,240,255,0.38)] hover:bg-[rgba(0,240,255,0.1)] hover:text-[#00f0ff]",
            "hover:shadow-[0_0_20px_rgba(0,240,255,0.5),0_0_40px_rgba(0,240,255,0.24),0_0_64px_rgba(0,240,255,0.12)]",
          ),
    );

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "fixed right-4 top-1/2 z-[9999] flex -translate-y-1/2 flex-col items-end justify-center outline-none",
          tooltipsEnabled && "group/dock py-32 pl-12 pr-0",
        )}
      >
        {tooltipsEnabled && (
          <span
            className="pointer-events-none absolute right-0 top-1/2 h-28 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-transparent via-[#00f0ff]/55 to-transparent opacity-35 shadow-[0_0_10px_rgba(0,240,255,0.35)] transition-all duration-300 group-hover/dock:opacity-100 group-hover/dock:shadow-[0_0_16px_rgba(0,240,255,0.7),0_0_32px_rgba(0,240,255,0.28)] group-focus-within/dock:opacity-100 group-focus-within/dock:shadow-[0_0_16px_rgba(0,240,255,0.7),0_0_32px_rgba(0,240,255,0.28)]"
            aria-hidden
          />
        )}
        <nav
          className={cn(
            "relative flex flex-col gap-2 transition-[opacity,transform] duration-300 ease-out",
            tooltipsEnabled &&
              cn(
                "pointer-events-none translate-x-4 opacity-0",
                "group-hover/dock:pointer-events-auto group-hover/dock:translate-x-0 group-hover/dock:opacity-100",
                "group-focus-within/dock:pointer-events-auto group-focus-within/dock:translate-x-0 group-focus-within/dock:opacity-100",
              ),
          )}
          aria-label="Main navigation"
        >
          <div className="flex flex-col gap-1.5 rounded-full border border-white/10 bg-white/5 p-2 backdrop-blur-md transition-[border-color,box-shadow] duration-300 group-hover/dock:border-[rgba(0,240,255,0.22)] group-hover/dock:shadow-[0_0_28px_rgba(0,240,255,0.14)] group-focus-within/dock:border-[rgba(0,240,255,0.22)] group-focus-within/dock:shadow-[0_0_28px_rgba(0,240,255,0.14)]">
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
              const isAnchor = href.startsWith("/#");
              const isActive =
                href === "/"
                  ? pathname === "/" && hash !== "#contact"
                  : isAnchor
                    ? pathname === "/" && hash === "#contact"
                    : pathname === href || pathname.startsWith(`${href}/`);

              const control = isAnchor ? (
                <Link
                  href={href}
                  scroll={pathname !== "/"}
                  className={itemClass(isActive)}
                  aria-label={label}
                  onClick={() => {
                    if (pathname !== "/") return;
                    requestAnimationFrame(() => {
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                    });
                  }}
                >
                  <Icon size={18} strokeWidth={1.5} />
                </Link>
              ) : (
                <Link href={href} className={itemClass(isActive)} aria-label={label}>
                  <Icon size={18} strokeWidth={1.5} />
                </Link>
              );

              return tooltipsEnabled ? (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>{control}</TooltipTrigger>
                  <TooltipContent
                    side="left"
                    className="border-white/10 bg-white/10 text-xs tracking-widest text-white backdrop-blur-md font-syne"
                  >
                    {label}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Fragment key={href}>{control}</Fragment>
              );
            })}
          </div>
        </nav>
      </div>
    </TooltipProvider>
  );
}
