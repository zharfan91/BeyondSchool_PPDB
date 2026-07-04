import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ContactChannelCard } from "@/components/shared/contact-channel-card";
import { MessageCircle, Mail, Phone } from "lucide-react";

const faqs = [
  { q: "Bagaimana cara mendaftar PPDB Online?", a: "Kunjungi halaman utama, klik 'Daftar Sekarang', buat akun, lalu ikuti alur pendaftaran 5 langkah." },
  { q: "Apa saja dokumen yang diperlukan?", a: "Akte Kelahiran, Kartu Keluarga, Pas Foto 3x4, Raport, dan Ijazah/SKL." },
  { q: "Kapan batas akhir pendaftaran?", a: "Pendaftaran ditutup pada 31 Juli 2026." },
  { q: "Berapa biaya pendaftaran?", a: "Biaya pendaftaran adalah Rp 500.000,- yang dibayarkan setelah verifikasi berkas." },
  { q: "Bagaimana cara mengetahui hasil seleksi?", a: "Hasil seleksi dapat dilihat di dashboard masing-masing pendaftar setelah pengumuman." },
  { q: "Apakah bisa mengubah data setelah dikirim?", a: "Data dapat diubah selama status masih 'Draf'. Setelah dikirim, hubungi staf admin." },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-display text-foreground mb-4">FAQ</h1>
        <p className="text-body-lg text-muted-foreground">
          Pertanyaan yang sering diajukan
        </p>
      </div>

      <Accordion type="single" collapsible defaultValue="item-0" className="mb-16">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger>{faq.q}</AccordionTrigger>
            <AccordionContent>{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="text-center mb-8">
        <h2 className="text-headline-md text-foreground mb-2">Masih Butuh Bantuan?</h2>
        <p className="text-body-md text-muted-foreground">
          Hubungi kanal dukungan resmi kami untuk respon yang lebih personal
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <ContactChannelCard
          icon={MessageCircle}
          title="WhatsApp"
          subtitle="Respon cepat (Jam kerja)"
          value="+62 812-3456-7890"
          variant="success"
        />
        <ContactChannelCard
          icon={Mail}
          title="Email Support"
          subtitle="Respon dalam 1x24 jam"
          value="ppdb@beyondschool.sch.id"
          variant="info"
        />
        <ContactChannelCard
          icon={Phone}
          title="Call Center"
          subtitle="Senin - Jumat, 08.00-16.00"
          value="(021) 555-0123"
          variant="primary"
        />
      </div>
    </div>
  );
}
