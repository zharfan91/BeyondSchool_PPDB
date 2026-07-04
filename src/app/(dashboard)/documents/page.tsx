"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentRowCard } from "@/components/data/document-row-card";
import { VerificationLegend } from "@/components/data/verification-legend";
import { DocumentTileGrid } from "@/components/data/document-tile-grid";

type DocState = {
  label: string;
  status: "uploaded" | "pending" | "rejected" | "valid" | "revisi" | "none" | "uploading";
  filename?: string;
  rejectReason?: string;
  optional?: boolean;
};

const initialDocs: DocState[] = [
  { label: "Akte Kelahiran", status: "valid", filename: "akte_kelahiran.pdf" },
  { label: "Kartu Keluarga", status: "uploaded", filename: "kartu_keluarga.pdf" },
  { label: "Pas Foto 3x4", status: "revisi", filename: "pas_foto.jpg", rejectReason: "Foto terlalu buram, mohon unggah ulang dengan kualitas lebih baik." },
  { label: "Raport Semester 1-5", status: "pending" },
  { label: "Ijazah / SKL", status: "none", optional: true },
];

export default function DocumentsPage() {
  const [docs, setDocs] = useState(initialDocs);

  const handleUpload = (index: number, file: File) => {
    setDocs((prev) => prev.map((d, i) => (i === index ? { ...d, status: "uploading", filename: file.name } : d)));
    setTimeout(() => {
      setDocs((prev) => prev.map((d, i) => (i === index ? { ...d, status: "uploaded" } : d)));
    }, 1200);
  };

  const handleDelete = (index: number) => {
    setDocs((prev) => prev.map((d, i) => (i === index ? { ...d, status: "none", filename: undefined } : d)));
  };

  const archivedFiles = docs
    .filter((d) => d.filename && d.status !== "none")
    .map((d) => ({ name: d.filename! }));

  return (
    <div>
      <PageHeader
        title="Berkas Saya"
        description="Upload dan kelola dokumen persyaratan"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {docs.map((doc, i) => (
            <DocumentRowCard
              key={doc.label}
              label={doc.label}
              status={doc.status}
              filename={doc.filename}
              rejectReason={doc.rejectReason}
              optional={doc.optional}
              onUpload={(file) => handleUpload(i, file)}
              onDelete={() => handleDelete(i)}
            />
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-headline-md">Arsip Dokumen</CardTitle>
            </CardHeader>
            <CardContent>
              {archivedFiles.length > 0 ? (
                <DocumentTileGrid files={archivedFiles} />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada dokumen yang diunggah.</p>
              )}
            </CardContent>
          </Card>
          <VerificationLegend />
        </div>
      </div>
    </div>
  );
}
