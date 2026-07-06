"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentRowCard } from "@/components/data/document-row-card";
import { VerificationLegend } from "@/components/data/verification-legend";
import { DocumentTileGrid } from "@/components/data/document-tile-grid";
import { DOCUMENT_TYPES } from "@/lib/constants";

type DocState = {
  type: string;
  label: string;
  status: "uploaded" | "pending" | "rejected" | "valid" | "revisi" | "none" | "uploading";
  id?: string;
  filename?: string;
  rejectReason?: string;
  optional?: boolean;
};

type DocumentRecord = {
  id: string;
  type: string;
  fileName: string;
  originalName: string;
  filePath: string;
  isVerified: boolean;
  rejectionNote: string | null;
  createdAt: string;
};

function buildDocs(records: DocumentRecord[]): DocState[] {
  return DOCUMENT_TYPES.map((docType) => {
    const optional = docType.value === "OTHER";
    const record = records.find((r) => r.type === docType.value);

    if (!record) {
      return {
        type: docType.value,
        label: docType.label,
        status: optional ? "none" : "pending",
        optional,
      };
    }

    const status: DocState["status"] = record.isVerified
      ? "valid"
      : record.rejectionNote
        ? "revisi"
        : "uploaded";

    return {
      type: docType.value,
      label: docType.label,
      status,
      id: record.id,
      filename: record.originalName,
      rejectReason: record.rejectionNote ?? undefined,
      optional,
    };
  });
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocState[]>(() => buildDocs([]));
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setRegistrationId(data.registrationId ?? null);
      setDocs(buildDocs(data.documents ?? []));
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (index: number, file: File) => {
    if (!registrationId) {
      alert("Registrasi belum ditemukan");
      return;
    }

    const docType = docs[index];
    setDocs((prev) =>
      prev.map((d, i) => (i === index ? { ...d, status: "uploading", filename: file.name } : d))
    );

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", docType.type);
      formData.append("registrationId", registrationId);

      const res = await fetch("/api/upload", { method: "POST", body: formData });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.error ?? "Gagal mengunggah dokumen");
        await fetchDocuments();
        return;
      }

      await fetchDocuments();
    } catch (error) {
      console.error("Failed to upload document:", error);
      alert("Gagal mengunggah dokumen");
      await fetchDocuments();
    }
  };

  const handleDelete = async (index: number) => {
    const doc = docs[index];
    if (!doc.id) return;

    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.error ?? "Gagal menghapus dokumen");
        return;
      }

      await fetchDocuments();
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Gagal menghapus dokumen");
    }
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
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Memuat dokumen...</p>
          ) : (
            docs.map((doc, i) => (
              <DocumentRowCard
                key={doc.type}
                label={doc.label}
                status={doc.status}
                filename={doc.filename}
                rejectReason={doc.rejectReason}
                optional={doc.optional}
                onUpload={(file) => handleUpload(i, file)}
                onDelete={() => handleDelete(i)}
              />
            ))
          )}
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
