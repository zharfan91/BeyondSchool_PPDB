"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { FormWizard } from "@/components/forms/form-wizard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/forms/file-upload";
import { SuccessCard } from "@/components/shared/success-card";

const steps = [
  { title: "Data Pribadi", description: "Lengkapi data diri Anda" },
  { title: "Alamat", description: "Alamat tempat tinggal" },
  { title: "Data Orang Tua", description: "Informasi orang tua/wali" },
  { title: "Data Akademik", description: "Riwayat pendidikan" },
  { title: "Upload Dokumen", description: "Unggah persyaratan" },
];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
      return;
    }
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  if (submitted) {
    return (
      <div>
        <PageHeader title="Formulir Pendaftaran" description="Lengkapi semua data dengan benar" />
        <SuccessCard
          title="Pendaftaran Berhasil Terkirim!"
          description="Data pendaftaran Anda telah kami terima dan akan segera diproses oleh tim verifikator."
          referenceLabel="ID Pendaftaran"
          referenceValue="REG-2026-00892"
          primaryAction={{ label: "Pantau Status di Dashboard", href: "/dashboard" }}
          secondaryAction={{ label: "Lihat Berkas Saya", href: "/documents" }}
          notice={{ title: "Cek Email Konfirmasi", description: "Kami telah mengirimkan detail pendaftaran ke email Anda." }}
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
        {currentStep === 0 && <StepPersonalData />}
        {currentStep === 1 && <StepAddress />}
        {currentStep === 2 && <StepParentInfo />}
        {currentStep === 3 && <StepAcademicInfo />}
        {currentStep === 4 && <StepDocuments />}
      </FormWizard>
    </div>
  );
}

function StepPersonalData() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Nama Lengkap *</label>
        <Input placeholder="Nama sesuai akte" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Nama Panggilan</label>
        <Input placeholder="Nama panggilan" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tempat Lahir *</label>
        <Input placeholder="Kota kelahiran" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tanggal Lahir *</label>
        <Input type="date" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Jenis Kelamin *</label>
        <Select>
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
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Pilih agama" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ISLAM">Islam</SelectItem>
            <SelectItem value="KRISTEN">Kristen</SelectItem>
            <SelectItem value="KATOLIK">Katolik</SelectItem>
            <SelectItem value="HINDU">Hindu</SelectItem>
            <SelectItem value="BUDDHA">Buddha</SelectItem>
            <SelectItem value="KONGHUCU">Konghucu</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Anak ke-</label>
        <Input type="number" placeholder="1" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Jumlah Saudara</label>
        <Input type="number" placeholder="0" />
      </div>
    </div>
  );
}

function StepAddress() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2 space-y-2">
        <label className="text-sm font-medium text-foreground">Alamat *</label>
        <Input placeholder="Nama jalan, RT/RW" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Kelurahan/Desa</label>
        <Input placeholder="Kelurahan" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Kecamatan *</label>
        <Input placeholder="Kecamatan" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Kota/Kabupaten *</label>
        <Input placeholder="Kota" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Provinsi *</label>
        <Input placeholder="Provinsi" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Kode Pos *</label>
        <Input placeholder="Kode pos" />
      </div>
    </div>
  );
}

function StepParentInfo() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Data Ayah</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nama Ayah *</label>
            <Input placeholder="Nama lengkap" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pekerjaan</label>
            <Input placeholder="Pekerjaan" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">No. WhatsApp *</label>
            <Input placeholder="081234567890" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pendidikan</label>
            <Select>
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
            <Input placeholder="Nama lengkap" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pekerjaan</label>
            <Input placeholder="Pekerjaan" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">No. WhatsApp *</label>
            <Input placeholder="081234567890" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pendidikan</label>
            <Select>
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

function StepAcademicInfo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Asal Sekolah *</label>
        <Input placeholder="Nama sekolah sebelumnya" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">NISN</label>
        <Input placeholder="Nomor Induk Siswa Nasional" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Program Pilihan *</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Pilih program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IPA">IPA</SelectItem>
            <SelectItem value="IPS">IPS</SelectItem>
            <SelectItem value="BAHASA">Bahasa</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tahun Lulus</label>
        <Input type="number" placeholder="2026" />
      </div>
    </div>
  );
}

function StepDocuments() {
  return (
    <div className="space-y-6">
      <FileUpload label="Akte Kelahiran" accept=".pdf,.jpg,.jpeg,.png" />
      <FileUpload label="Kartu Keluarga" accept=".pdf,.jpg,.jpeg,.png" />
      <FileUpload label="Pas Foto" accept=".jpg,.jpeg,.png" maxSizeMB={2} />
      <FileUpload label="Ijazah / SKL" accept=".pdf,.jpg,.jpeg,.png" />
      <FileUpload label="KIP (jika ada)" accept=".pdf,.jpg,.jpeg,.png" />
    </div>
  );
}
