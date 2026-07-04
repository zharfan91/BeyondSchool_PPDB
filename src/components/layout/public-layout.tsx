import Link from "next/link";
import { LayoutDashboard, Instagram, Mail, Phone, MapPin, Facebook, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNavLinks } from "@/components/layout/public-nav-links";

const quickLinks = [
  { label: "Jalur Pendaftaran", href: "/#jalur" },
  { label: "Persyaratan Dokumen", href: "/#persyaratan" },
  { label: "Panduan Pembayaran", href: "/faq" },
  { label: "Hasil Seleksi", href: "/status" },
];

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 h-16 w-full border-b border-border bg-white shadow-sm">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-primary">Beyond School PPDB</span>
          </Link>
          <PublicNavLinks />
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Daftar Sekarang</Link>
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-border bg-surface-container-lowest">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div className="space-y-4">
            <span className="text-lg font-bold text-primary">Beyond School PPDB</span>
            <p className="text-sm text-muted-foreground">
              Sistem Informasi Penerimaan Peserta Didik Baru terintegrasi, transparan, dan akuntabel.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-primary transition-all hover:bg-primary hover:text-white"
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground">Tautan Cepat</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div id="kontak" className="space-y-4 scroll-mt-24">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground">Kontak Kami</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                Jl. Pendidikan No. 45, Jakarta Selatan
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                (021) 555-0123
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                info@beyondschool.sch.id
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground">Lokasi</h4>
            <div className="flex h-32 items-center justify-center rounded-lg border border-border bg-surface-container">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 sm:px-6 md:flex-row lg:px-8">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Beyond School PPDB. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <Link href="/info" className="hover:text-primary">
                Kebijakan Privasi
              </Link>
              <Link href="/faq" className="hover:text-primary">
                Syarat &amp; Ketentuan
              </Link>
              <Link href="/faq" className="hover:text-primary">
                Kontak Bantuan
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
