"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { FormWizard } from "@/components/forms/form-wizard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/forms/file-upload";
import { SuccessCard } from "@/components/shared/success-card";
import { LoadingState } from "@/components/shared/loading-state";
import { EDUCATION_LEVELS } from "@/lib/constants";

const steps = [
  { title: "Data Pribadi", description: "Lengkapi data diri Anda" },
  { title: "Alamat", description: "Alamat tempat tinggal" },
  { title: "Data Orang Tua", description: "Informasi orang tua/wali" },
  { title: "Data Akademik", description: "Riwayat pendidikan" },
  { title: "Upload Dokumen", description: "Unggah persyaratan" },
];

const MANDATORY_DOC_TYPES = ["BIRTH_CERTIFICATE", "FAMILY_CARD", "PASSPORT_PHOTO", "DIPLOMA"];

interface FormState {
  personal: {
    firstName: string;
    nickName: string;
    birthPlace: string;
    birthDate: string;
    gender: string;
    religion: string;
    childNumber: string;
    siblingsCount: string;
  };
  address: {
    street: string;
    village: string;
    subDistrict: string;
    city: string;
    province: string;
    postalCode: string;
  };
  parents: {
    father: { name: string; occupation: string; phone: string; education: string };
    mother: { name: string; occupation: string; phone: string; education: string };
  };
  academic: {
    institutionName: string;
    level: string;
    nisn: string;
    graduationYear: string;
  };
  programId: string;
}

const emptyForm: FormState = {
  personal: { firstName: "", nickName: "", birthPlace: "", birthDate: "", gender: "", religion: "", childNumber: "", siblingsCount: "" },
  address: { street: "", village: "", subDistrict: "", city: "", province: "", postalCode: "" },
  parents: {
    father: { name: "", occupation: "", phone: "", education: "" },
    mother: { name: "", occupation: "", phone: "", education: "" },
  },
  academic: { institutionName: "", level: "", nisn: "", graduationYear: "" },
  programId: "",
};

interface ProgramOption {
  id: string;
  name: string;
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [registrationNumber, setRegistrationNumber] = useState<string>("");
  const [uploadedTypes, setUploadedTypes] = useState<Set<string>>(new Set());
  const [stepError, setStepError] = useState<string>("");

  useEffect(() => {
    Promise.all([
      fetch("/api/registrations").then((r) => r.json()),
      fetch("/api/registrations/options").then((r) => r.json()),
    ])
      .then(([regData, optData]) => {
        setPrograms(optData?.activePeriod?.programs ?? []);

        const applicant = regData?.applicant;
        if (applicant?.registration) {
          const reg = applicant.registration;
          if (reg.status !== "DRAFT") {
            setAlreadySubmitted(true);
            setRegistrationNumber(applicant.registrationNumber ?? "");
          } else {
            setRegistrationId(reg.id);
            setRegistrationNumber(applicant.registrationNumber ?? "");
            setCurrentStep(4);
            const uploaded = new Set<string>((reg.documents ?? []).map((d: { type: string }) => d.type));
            setUploadedTypes(uploaded);
          }
        }
      })
      .catch((err) => console.error("Failed to load registration state:", err))
      .finally(() => setLoadingInitial(false));
  }, []);

  const update = (section: keyof FormState, value: unknown) => {
    setForm((prev) => ({ ...prev, [section]: value }));
  };

  const validateStep = (): string => {
    if (currentStep === 0) {
      const p = form.personal;
      if (!p.firstName || !p.birthPlace || !p.birthDate || !p.gender || !p.religion) {
        return "Lengkapi semua data bertanda * terlebih dahulu";
      }
    } else if (currentStep === 1) {
      const a = form.address;
      if (!a.street || !a.subDistrict || !a.city || !a.province || !a.postalCode) {
        return "Lengkapi semua data bertanda * terlebih dahulu";
      }
    } else if (currentStep === 2) {
      const { father, mother } = form.parents;
      if (!father.name || !father.phone || !mother.name || !mother.phone) {
        return "Lengkapi nama dan No. WhatsApp Ayah/Ibu terlebih dahulu";
      }
    } else if (currentStep === 3) {
      const ac = form.academic;
      if (!ac.institutionName || !ac.level || !form.programId) {
        return "Lengkapi semua data bertanda * terlebih dahulu";
      }
    }
    return "";
  };

  const handleNext = async () => {
    const error = validateStep();
    if (error) {
      setStepError(error);
      return;
    }
    setStepError("");

    if (currentStep === 3) {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/registrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personal: {
              ...form.personal,
              childNumber: form.personal.childNumber ? Number(form.personal.childNumber) : null,
              siblingsCount: form.personal.siblingsCount ? Number(form.personal.siblingsCount) : null,
            },
            address: form.address,
            parents: form.parents,
            academic: {
              ...form.academic,
              graduationYear: form.academic.graduationYear ? Number(form.academic.graduationYear) : null,
            },
            programId: form.programId,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setStepError(data?.error ?? "Gagal menyimpan data");
          setIsSubmitting(false);
          return;
        }
        setRegistrationId(data.registrationId);
        setRegistrationNumber(data.registrationNumber);
        setCurrentStep(4);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (currentStep === 4) {
      const missing = MANDATORY_DOC_TYPES.filter((t) => !uploadedTypes.has(t));
      if (missing.length > 0) {
        setStepError("Unggah semua dokumen wajib terlebih dahulu");
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/registrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "finalize", registrationId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setStepError(data?.error ?? "Gagal mengirim pendaftaran");
          setIsSubmitting(false);
          return;
        }
        setRegistrationNumber(data.registrationNumber ?? registrationNumber);
        setSubmitted(true);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    setStepError("");
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  if (loadingInitial) {
    return <LoadingState rows={4} />;
  }

  if (alreadySubmitted) {
    return (
      <div>
        <PageHeader title="Formulir Pendaftaran" description="Lengkapi semua data dengan benar" />
        <SuccessCard
          title="Pendaftaran Sudah Terkirim"
          description="Anda sudah mengirimkan pendaftaran ini sebelumnya. Pantau perkembangannya di halaman Status Seleksi."
          referenceLabel="ID Pendaftaran"
          referenceValue={registrationNumber || "-"}
          primaryAction={{ label: "Lihat Status Seleksi", href: "/status" }}
          secondaryAction={{ label: "Lihat Berkas Saya", href: "/documents" }}
        />
      </div>
    );
  }

  if (submitted) {
    return (
      <div>
        <PageHeader title="Formulir Pendaftaran" description="Lengkapi semua data dengan benar" />
        <SuccessCard
          title="Pendaftaran Berhasil Terkirim!"
          description="Data pendaftaran Anda telah kami terima dan akan segera diproses oleh tim verifikator."
          referenceLabel="ID Pendaftaran"
          referenceValue={registrationNumber}
          primaryAction={{ label: "Pantau Status di Dashboard", href: "/dashboard" }}
          secondaryAction={{ label: "Lihat Berkas Saya", href: "/documents" }}
          notice={{ title: "Langkah Selanjutnya", description: "Tim kami akan memverifikasi berkas Anda. Cek status pendaftaran secara berkala." }}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Formulir Pendaftaran"
        description="Lengkapi semua data dengan benar"
      />

      <FormWizard
        steps={steps}
        currentStep={currentStep}
        onNext={handleNext}
        onBack={handleBack}
        isFirstStep={currentStep === 0}
        isLastStep={currentStep === steps.length - 1}
        isSubmitting={isSubmitting}
      >
        {stepError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {stepError}
          </div>
        )}
        {currentStep === 0 && (
          <StepPersonalData value={form.personal} onChange={(v) => update("personal", v)} />
        )}
        {currentStep === 1 && (
          <StepAddress value={form.address} onChange={(v) => update("address", v)} />
        )}
        {currentStep === 2 && (
          <StepParentInfo value={form.parents} onChange={(v) => update("parents", v)} />
        )}
        {currentStep === 3 && (
          <StepAcademicInfo
            value={form.academic}
            programId={form.programId}
            programs={programs}
            onChange={(v) => update("academic", v)}
            onProgramChange={(id) => setForm((prev) => ({ ...prev, programId: id }))}
          />
        )}
        {currentStep === 4 && (
          <StepDocuments registrationId={registrationId} uploadedTypes={uploadedTypes} onUploaded={(type) => setUploadedTypes((prev) => new Set(prev).add(type))} />
        )}
      </FormWizard>
    </div>
  );
}

function StepPersonalData({ value, onChange }: { value: FormState["personal"]; onChange: (v: FormState["personal"]) => void }) {
  const set = (key: keyof FormState["personal"], v: string) => onChange({ ...value, [key]: v });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Nama Lengkap *</label>
        <Input placeholder="Nama sesuai akte" value={value.firstName} onChange={(e) => set("firstName", e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Nama Panggilan</label>
        <Input placeholder="Nama panggilan" value={value.nickName} onChange={(e) => set("nickName", e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tempat Lahir *</label>
        <Input placeholder="Kota kelahiran" value={value.birthPlace} onChange={(e) => set("birthPlace", e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tanggal Lahir *</label>
        <Input type="date" value={value.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Jenis Kelamin *</label>
        <Select value={value.gender} onValueChange={(v) => set("gender", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih jenis kelamin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MALE">Laki-laki</SelectItem>
            <SelectItem value="FEMALE">Perempuan</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Agama *</label>
        <Select value={value.religion} onValueChange={(v) => set("religion", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih agama" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Islam">Islam</SelectItem>
            <SelectItem value="Kristen">Kristen</SelectItem>
            <SelectItem value="Katolik">Katolik</SelectItem>
            <SelectItem value="Hindu">Hindu</SelectItem>
            <SelectItem value="Buddha">Buddha</SelectItem>
            <SelectItem value="Konghucu">Konghucu</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Anak ke-</label>
        <Input type="number" placeholder="1" value={value.childNumber} onChange={(e) => set("childNumber", e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Jumlah Saudara</label>
        <Input type="number" placeholder="0" value={value.siblingsCount} onChange={(e) => set("siblingsCount", e.target.value)} />
      </div>
    </div>
  );
}

function StepAddress({ value, onChange }: { value: FormState["address"]; onChange: (v: FormState["address"]) => void }) {
  const set = (key: keyof FormState["address"], v: string) => onChange({ ...value, [key]: v });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2 space-y-2">
        <label className="text-sm font-medium text-foreground">Alamat *</label>
        <Input placeholder="Nama jalan, RT/RW" value={value.street} onChange={(e) => set("street", e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Kelurahan/Desa</label>
        <Input placeholder="Kelurahan" value={value.village} onChange={(e) => set("village", e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Kecamatan *</label>
        <Input placeholder="Kecamatan" value={value.subDistrict} onChange={(e) => set("subDistrict", e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Kota/Kabupaten *</label>
        <Input placeholder="Kota" value={value.city} onChange={(e) => set("city", e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Provinsi *</label>
        <Input placeholder="Provinsi" value={value.province} onChange={(e) => set("province", e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Kode Pos *</label>
        <Input placeholder="Kode pos" value={value.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
      </div>
    </div>
  );
}

function StepParentInfo({ value, onChange }: { value: FormState["parents"]; onChange: (v: FormState["parents"]) => void }) {
  const setParent = (who: "father" | "mother", key: string, v: string) =>
    onChange({ ...value, [who]: { ...value[who], [key]: v } });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Data Ayah</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nama Ayah *</label>
            <Input placeholder="Nama lengkap" value={value.father.name} onChange={(e) => setParent("father", "name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pekerjaan</label>
            <Input placeholder="Pekerjaan" value={value.father.occupation} onChange={(e) => setParent("father", "occupation", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">No. WhatsApp *</label>
            <Input placeholder="081234567890" value={value.father.phone} onChange={(e) => setParent("father", "phone", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pendidikan</label>
            <Select value={value.father.education} onValueChange={(v) => setParent("father", "education", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih pendidikan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SD">SD</SelectItem>
                <SelectItem value="SMP">SMP</SelectItem>
                <SelectItem value="SMA">SMA/SMK</SelectItem>
                <SelectItem value="D3">D3</SelectItem>
                <SelectItem value="S1">S1</SelectItem>
                <SelectItem value="S2">S2</SelectItem>
                <SelectItem value="S3">S3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Data Ibu</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nama Ibu *</label>
            <Input placeholder="Nama lengkap" value={value.mother.name} onChange={(e) => setParent("mother", "name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pekerjaan</label>
            <Input placeholder="Pekerjaan" value={value.mother.occupation} onChange={(e) => setParent("mother", "occupation", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">No. WhatsApp *</label>
            <Input placeholder="081234567890" value={value.mother.phone} onChange={(e) => setParent("mother", "phone", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pendidikan</label>
            <Select value={value.mother.education} onValueChange={(v) => setParent("mother", "education", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih pendidikan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SD">SD</SelectItem>
                <SelectItem value="SMP">SMP</SelectItem>
                <SelectItem value="SMA">SMA/SMK</SelectItem>
                <SelectItem value="D3">D3</SelectItem>
                <SelectItem value="S1">S1</SelectItem>
                <SelectItem value="S2">S2</SelectItem>
                <SelectItem value="S3">S3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepAcademicInfo({
  value,
  programId,
  programs,
  onChange,
  onProgramChange,
}: {
  value: FormState["academic"];
  programId: string;
  programs: ProgramOption[];
  onChange: (v: FormState["academic"]) => void;
  onProgramChange: (id: string) => void;
}) {
  const set = (key: keyof FormState["academic"], v: string) => onChange({ ...value, [key]: v });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Asal Sekolah *</label>
        <Input placeholder="Nama sekolah sebelumnya" value={value.institutionName} onChange={(e) => set("institutionName", e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Jenjang Sekolah Asal *</label>
        <Select value={value.level} onValueChange={(v) => set("level", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih jenjang" />
          </SelectTrigger>
          <SelectContent>
            {EDUCATION_LEVELS.map((lvl) => (
              <SelectItem key={lvl.value} value={lvl.value}>{lvl.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">NISN</label>
        <Input placeholder="Nomor Induk Siswa Nasional" value={value.nisn} onChange={(e) => set("nisn", e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Program Pilihan *</label>
        <Select value={programId} onValueChange={onProgramChange}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih program" />
          </SelectTrigger>
          <SelectContent>
            {programs.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tahun Lulus</label>
        <Input type="number" placeholder="2026" value={value.graduationYear} onChange={(e) => set("graduationYear", e.target.value)} />
      </div>
    </div>
  );
}

function StepDocuments({
  registrationId,
  uploadedTypes,
  onUploaded,
}: {
  registrationId: string | null;
  uploadedTypes: Set<string>;
  onUploaded: (type: string) => void;
}) {
  const docs = [
    { label: "Akte Kelahiran", type: "BIRTH_CERTIFICATE", accept: ".pdf,.jpg,.jpeg,.png" },
    { label: "Kartu Keluarga", type: "FAMILY_CARD", accept: ".pdf,.jpg,.jpeg,.png" },
    { label: "Pas Foto", type: "PASSPORT_PHOTO", accept: ".jpg,.jpeg,.png", maxSizeMB: 2 },
    { label: "Ijazah / SKL", type: "DIPLOMA", accept: ".pdf,.jpg,.jpeg,.png" },
    { label: "KIP (jika ada)", type: "OTHER", accept: ".pdf,.jpg,.jpeg,.png" },
  ];

  return (
    <div className="space-y-6">
      {docs.map((doc) => (
        <div key={doc.type}>
          <FileUpload
            label={uploadedTypes.has(doc.type) ? `${doc.label} ✓` : doc.label}
            accept={doc.accept}
            maxSizeMB={doc.maxSizeMB}
            documentType={doc.type}
            registrationId={registrationId}
            onUploaded={() => onUploaded(doc.type)}
          />
        </div>
      ))}
    </div>
  );
}
