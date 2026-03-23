"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Terminal,
  Box,
  Newspaper,
  Globe,
  GitMerge
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/blog", icon: BookOpen, label: "Blog" },
  { href: "/prompts", icon: Terminal, label: "Prompts" },
  { href: "/hub", icon: Box, label: "Hub" },
  { href: "/newsroom", icon: Newspaper, label: "Newsroom" },
  { href: "/googleverse", icon: Globe, label: "Googleverse" },
  { href: "/workflow", icon: GitMerge, label: "Workflow" },
];

export function VerticalNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-4 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={cn(
              "p-2 rounded-full transition-all duration-300 group relative",
              isActive
                ? "bg-[#00f0ff]/20 text-[#00f0ff]"
                : "text-white/50 hover:text-white hover:bg-white/10"
            )}
          >
            <Icon className="w-5 h-5" />

            {/* Tooltip on hover */}
            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 backdrop-blur-sm border border-white/10 text-xs font-mono tracking-widest uppercase rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
