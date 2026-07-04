"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Beranda", href: "/" },
  { label: "Jalur & Persyaratan", href: "/#jalur" },
  { label: "Jadwal", href: "/#jadwal" },
  { label: "Biaya", href: "/faq" },
  { label: "Informasi", href: "/info" },
  { label: "FAQ", href: "/faq" },
  { label: "Kontak", href: "/#kontak" },
];

export function PublicNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-6 lg:flex">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "text-sm transition-colors",
              isActive
                ? "font-bold text-primary border-b-2 border-primary pb-1"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
