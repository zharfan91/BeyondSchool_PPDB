import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { JenjangCard } from "@/components/shared/jenjang-card";
import { JalurCard } from "@/components/shared/jalur-card";
import { IconBadge } from "@/components/shared/icon-badge";
import { SectionMotif } from "@/components/shared/section-motif";
import { RegistrationTimeline } from "@/components/shared/registration-timeline";
import { HeroMediaCarousel } from "@/components/shared/hero-media-carousel";
import { DocumentChecklist } from "@/components/data/document-checklist";
import {
  Megaphone,
  ArrowRight,
  Search,
  ChevronRight,
  ChevronLeft,
  Baby,
  School,
  BookOpen,
  Building2,
  Wrench,
  FileCheck,
  Award,
  HandHeart,
  CheckCircle2,
  Calendar,
  Waves,
  Users,
  Timer,
  FilePenLine,
  ListChecks,
  UserCheck,
  CheckCheck,
} from "lucide-react";

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 lg:py-24">
        <SectionMotif icon={School} className="-left-16 -bottom-16 h-72 w-72 -rotate-12" />
        <div className="relative grid gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-16 xl:px-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary">
              <Megaphone className="h-3.5 w-3.5" />
              PPDB Tahun Ajaran 2026/2027 Telah Dibuka
            </div>
            <h1 className="text-display text-foreground tracking-tight">
              Penerimaan Peserta Didik Baru <br />
              <span className="text-primary">Masa Depan Cerah Dimulai Di Sini</span>
            </h1>
            <p className="text-body-lg text-muted-foreground max-w-xl">
              Bergabunglah dengan institusi pendidikan unggulan yang mengedepankan inovasi, karakter, dan
              prestasi global. Daftarkan putra-putri Anda sekarang melalui sistem terintegrasi kami.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/register">
                  Daftar Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/announcements">
                  Cek Pengumuman
                  <Search className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <HeroMediaCarousel slides={heroSlides} />
        </div>
      </section>

      {/* Status Info Strip */}
      <section className="relative isolate overflow-hidden border-y border-border bg-background py-10">
        <div className="px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
            {infoStrip.map((item) =>
              item.inverted ? (
                <div key={item.label} className="flex items-center gap-3 rounded-lg border border-primary bg-primary p-4 text-white shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/80">{item.label}</p>
                    <p className="text-sm font-semibold">{item.value}</p>
                  </div>
                </div>
              ) : (
                <div key={item.label} className="flex items-center gap-3 rounded-lg border border-border bg-white p-4 shadow-sm">
                  <IconBadge icon={item.icon} variant={item.variant!} />
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className={cn("text-sm font-semibold", statVariantText[item.variant!])}>{item.value}</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Jenjang Pendidikan */}
      <section className="relative isolate overflow-hidden bg-surface py-16 lg:py-24">
        <SectionMotif icon={Baby} className="-right-14 top-8 h-64 w-64 rotate-6" />
        <div className="px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="mb-12 text-center">
            <h2 className="text-headline-lg text-foreground mb-3">Jenjang Pendidikan</h2>
            <p className="text-body-md text-muted-foreground max-w-2xl mx-auto">
              Tersedia berbagai pilihan jenjang pendidikan mulai dari tingkat dasar hingga menengah kejuruan.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {jenjangList.map((jenjang) => (
              <JenjangCard key={jenjang.title} {...jenjang} />
            ))}
          </div>
        </div>
      </section>

      {/* Jalur Pendaftaran */}
      <section id="jalur" className="relative isolate overflow-hidden scroll-mt-16 bg-background py-16 lg:py-24">
        <div className="px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="mb-12 flex flex-col items-end justify-between gap-4 md:flex-row">
            <div>
              <h2 className="text-headline-lg text-foreground mb-3">Jalur Pendaftaran</h2>
              <p className="text-body-md text-muted-foreground">
                Pilih jalur yang sesuai dengan kualifikasi calon peserta didik.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-full border border-border bg-white p-2 text-muted-foreground hover:bg-surface-container-low" aria-label="Sebelumnya">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="rounded-full border border-border bg-white p-2 text-muted-foreground hover:bg-surface-container-low" aria-label="Berikutnya">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {jalurList.map((jalur) => (
              <JalurCard key={jalur.title} {...jalur} />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Pendaftaran */}
      <section id="jadwal" className="relative isolate overflow-hidden scroll-mt-16 border-t border-border bg-surface py-16 lg:py-24">
        <SectionMotif icon={FilePenLine} className="-right-10 -bottom-10 h-64 w-64 rotate-12" />
        <div className="px-6 text-center sm:px-10 lg:px-16 xl:px-24">
          <h2 className="text-headline-lg text-foreground mb-12">Timeline Pendaftaran</h2>
          <RegistrationTimeline steps={timelineSteps} />
        </div>
      </section>

      {/* Persyaratan Dokumen & FAQ */}
      <section id="persyaratan" className="relative isolate overflow-hidden scroll-mt-16 bg-background py-16 lg:py-24">
        <SectionMotif icon={ListChecks} className="-left-12 top-10 h-64 w-64 -rotate-6" />
        <div className="grid gap-16 px-6 sm:px-10 lg:grid-cols-2 lg:gap-24 lg:px-16 xl:px-24">
          <div>
            <h2 className="text-headline-lg text-foreground mb-8">Persyaratan Dokumen</h2>
            <DocumentChecklist title="Dokumen Wajib (Digital PDF/JPG)" items={documentItems} />
          </div>
          <div>
            <h2 className="text-headline-lg text-foreground mb-8">FAQ</h2>
            <Accordion type="single" collapsible defaultValue="faq-1">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{faq.q}</AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </>
  );
}

const heroSlides = [
  {
    src: "/images/campus-illustration.png",
    alt: "Gedung sekolah modern dengan halaman yang asri",
    title: "Gedung Utama",
    subtitle: "Fasilitas Modern Berstandar Internasional",
  },
  {
    src: "/images/learning-media-illustration.png",
    alt: "Media pembelajaran digital interaktif",
    title: "Media Pembelajaran",
    subtitle: "Teknologi Pembelajaran Interaktif & Modern",
  },
  {
    src: "/images/achievement-illustration.png",
    alt: "Prestasi siswa di atas podium juara",
    title: "Prestasi Siswa",
    subtitle: "Meraih Prestasi Tingkat Nasional & Internasional",
  },
];

const statVariantText = {
  primary: "text-primary",
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
} as const;

const infoStrip = [
  { icon: CheckCircle2, label: "Status", value: "Aktif", variant: "success" as const },
  { icon: Calendar, label: "Tanggal", value: "1 Juni - 30 Juli", variant: "info" as const },
  { icon: Waves, label: "Gelombang", value: "Gelombang 2", variant: "warning" as const },
  { icon: Users, label: "Sisa Kuota", value: "145 / 500 Siswa", variant: "primary" as const },
  { icon: Timer, label: "Batas Waktu", value: "12h : 45m : 08s", inverted: true },
];

const jenjangList = [
  {
    icon: Baby,
    title: "TK / PAUD",
    stats: [
      { label: "Kuota", value: 50 },
      { label: "Gelombang", value: 1 },
    ],
    href: "/info#tk",
  },
  {
    icon: School,
    title: "Sekolah Dasar",
    stats: [
      { label: "Kuota", value: 120 },
      { label: "Gelombang", value: 2 },
    ],
    href: "/info#sd",
  },
  {
    icon: BookOpen,
    title: "SMP",
    stats: [
      { label: "Kuota", value: 180 },
      { label: "Gelombang", value: 2 },
    ],
    href: "/info#smp",
  },
  {
    icon: Building2,
    title: "SMA",
    stats: [
      { label: "Kuota", value: 200 },
      { label: "Gelombang", value: 1 },
    ],
    href: "/info#sma",
  },
  {
    icon: Wrench,
    title: "SMK",
    stats: [
      { label: "Kuota", value: 150 },
      { label: "Gelombang", value: 2 },
    ],
    href: "/info#smk",
  },
];

const jalurList = [
  {
    icon: FileCheck,
    title: "Jalur Reguler",
    description: "Pendaftaran umum berdasarkan zona tempat tinggal dan seleksi administrasi standar.",
    benefits: ["Berkas Kependudukan Lengkap", "Seleksi Berbasis Nilai Rapor"],
    quota: "200 Kursi",
    href: "/register",
    accent: "info" as const,
  },
  {
    icon: Award,
    title: "Jalur Prestasi",
    description: "Kesempatan khusus bagi siswa dengan prestasi akademik maupun non-akademik tingkat kota hingga internasional.",
    benefits: ["Sertifikat Juara (Min. Kota)", "Nilai Rata-rata > 85"],
    quota: "50 Kursi",
    href: "/register",
    featured: true,
    accent: "warning" as const,
  },
  {
    icon: HandHeart,
    title: "Jalur Beasiswa",
    description: "Dukungan finansial penuh bagi siswa berprestasi dari keluarga kurang mampu atau kondisi khusus.",
    benefits: ["Kartu Indonesia Pintar (KIP)", "Surat Keterangan Tidak Mampu"],
    quota: "20 Kursi",
    href: "/register",
    accent: "success" as const,
  },
];

const timelineSteps = [
  { icon: FilePenLine, title: "Pendaftaran", date: "1 - 15 Juni 2026", active: true },
  { icon: ListChecks, title: "Verifikasi", date: "16 - 20 Juni 2026" },
  { icon: UserCheck, title: "Seleksi", date: "21 - 25 Juni 2026" },
  { icon: Megaphone, title: "Pengumuman", date: "27 Juni 2026" },
  { icon: CheckCheck, title: "Daftar Ulang", date: "1 - 5 Juli 2026" },
];

const documentItems = [
  { label: "Kartu Keluarga (KK)", status: "complete" as const },
  { label: "Akta Kelahiran", status: "complete" as const },
  { label: "Rapor Semester Terakhir", status: "complete" as const },
  { label: "Pas Foto Terbaru (3x4)", status: "complete" as const },
  { label: "Bukti Pembayaran Pendaftaran", status: "attention" as const },
];

const faqs = [
  {
    q: "Bagaimana cara mendaftar akun?",
    a: 'Klik tombol "Daftar Sekarang" di pojok kanan atas, isi formulir data diri awal, lalu verifikasi email Anda untuk mendapatkan akses login ke portal.',
  },
  {
    q: "Apa format file dokumen yang diizinkan?",
    a: "Kami menerima format PDF, JPG, dan PNG dengan ukuran maksimal 2MB per file. Pastikan dokumen terbaca dengan jelas (tidak buram).",
  },
  {
    q: "Kapan pengumuman hasil seleksi?",
    a: "Pengumuman hasil seleksi akan dipublikasikan pada 27 Juni 2026 melalui dashboard akun Anda dan email terdaftar.",
  },
  {
    q: "Apakah bisa mengubah data setelah submit?",
    a: 'Data dapat diubah selama status pendaftaran masih "Draf". Setelah dikirim untuk verifikasi, silakan hubungi Pusat Bantuan untuk perubahan data.',
  },
];
