import { ContactChannelCard } from "@/components/shared/contact-channel-card";
import { MessageCircle, Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-display text-foreground mb-4">Hubungi Kami</h1>
        <p className="text-body-lg text-muted-foreground">
          Tim PPDB siap membantu pertanyaan Anda seputar pendaftaran
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-12">
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

      <div className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Alamat Sekretariat PPDB</p>
          <p className="text-sm text-muted-foreground">
            Jl. Pendidikan No. 1, Jakarta Selatan, DKI Jakarta 12345
          </p>
        </div>
      </div>
    </div>
  );
}
