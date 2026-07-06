"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Megaphone, Pin } from "lucide-react";

interface Announcement {
  title: string;
  date: string;
  category: string;
  pinned: boolean;
  content: string;
}

const initialAnnouncements: Announcement[] = [
  {
    title: "Pengumuman Hasil Seleksi Tahap 1",
    date: "20 Juni 2026",
    category: "seleksi",
    pinned: true,
    content: "Hasil seleksi tahap 1 telah dirilis. Silakan cek dashboard masing-masing untuk melihat hasil.",
  },
  {
    title: "Perpanjangan Masa Pendaftaran",
    date: "15 Juni 2026",
    category: "pendaftaran",
    pinned: true,
    content: "Masa pendaftaran diperpanjang hingga 31 Juli 2026. Segera daftarkan diri Anda.",
  },
  {
    title: "Jadwal Verifikasi Berkas",
    date: "10 Juni 2026",
    category: "umum",
    pinned: false,
    content: "Verifikasi berkas akan dilaksanakan pada 1-10 Agustus 2026. Harap melengkapi dokumen.",
  },
  {
    title: "Pembayaran Biaya Pendaftaran",
    date: "5 Juni 2026",
    category: "keuangan",
    pinned: false,
    content: "Pembayaran biaya pendaftaran dapat dilakukan melalui bank yang tersedia.",
  },
];

export default function AnnouncementsPage() {
  const [announcements] = useState(initialAnnouncements);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "seleksi": return "warning";
      case "pendaftaran": return "info";
      case "keuangan": return "success";
      default: return "secondary";
    }
  };

  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return (
    <div className="mx-auto max-w-3xl py-12 px-4">
      <PageHeader
        title="Pengumuman"
        description="Informasi terbaru seputar PPDB"
      />

      <div className="space-y-4">
        {sorted.map((item, i) => (
          <Card key={i} className={item.pinned ? "border-primary/30 bg-primary/5" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {item.pinned && <Pin className="h-4 w-4 text-primary" />}
                  <CardTitle className="text-headline-md text-base">{item.title}</CardTitle>
                </div>
                <Badge variant={getCategoryColor(item.category) as any}>
                  {item.category}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {item.date}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
