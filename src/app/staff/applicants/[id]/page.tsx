"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UserX } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/data/status-badge";
import { EmptyState } from "@/components/data/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { DOCUMENT_TYPES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ApplicantDetail {
  id: string;
  registrationNumber: string | null;
  firstName: string;
  lastName: string | null;
  birthPlace: string;
  birthDate: string;
  gender: string;
  religion: string;
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
  registration: {
    status: string;
    submittedAt: string | null;
    createdAt: string;
    academicPeriod?: { name: string } | null;
    program?: { name: string } | null;
    documents: {
      id: string;
      type: string;
      originalName: string;
      isVerified: boolean;
    }[];
    payments: {
      id: string;
      invoiceNumber: string;
      amount: string | number;
      status: string;
    }[];
    selectionResults: {
      id: string;
      status: string;
      score: string | number | null;
      rank: number | null;
    }[];
  } | null;
  parents: {
    id: string;
    type: string;
    name: string;
    phone: string;
    occupation: string | null;
  }[];
  addresses: {
    id: string;
    type: string;
    street: string;
    district: string;
    city: string;
    province: string;
    postalCode: string;
  }[];
  academicHistories: {
    id: string;
    level: string;
    institutionName: string;
    city: string;
    graduationYear: number;
  }[];
}

const genderLabels: Record<string, string> = {
  MALE: "Laki-laki",
  FEMALE: "Perempuan",
};

const parentTypeLabels: Record<string, string> = {
  FATHER: "Ayah",
  MOTHER: "Ibu",
  GUARDIAN: "Wali",
};

const addressTypeLabels: Record<string, string> = {
  HOME: "Rumah",
  PARENT: "Orang Tua",
  DOMICILE: "Domisili",
};

function documentLabel(type: string) {
  return DOCUMENT_TYPES.find((doc) => doc.value === type)?.label ?? type;
}

export default function ApplicantDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [applicant, setApplicant] = useState<ApplicantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setNotFound(false);

    fetch(`/api/applicants/${id}`)
      .then(async (res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch applicant");
        }
        return res.json();
      })
      .then((data) => {
        if (data) setApplicant(data);
      })
      .catch((err) => {
        console.error(err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Detail Pendaftar" description="Memuat data pendaftar..." />
        <LoadingState />
      </div>
    );
  }

  if (notFound || !applicant) {
    return (
      <div>
        <PageHeader title="Detail Pendaftar" />
        <EmptyState
          icon={UserX}
          title="Pendaftar tidak ditemukan"
          description="Data pendaftar dengan ID ini tidak ditemukan atau telah dihapus."
        />
      </div>
    );
  }

  const fullName = [applicant.firstName, applicant.lastName].filter(Boolean).join(" ");
  const registration = applicant.registration;

  return (
    <div>
      <PageHeader
        title="Detail Pendaftar"
        description={
          applicant.registrationNumber
            ? `${applicant.registrationNumber} - ${fullName}`
            : fullName
        }
        actions={
          <>
            <Button variant="outline" disabled title="Segera hadir">
              Catatan
            </Button>
            <Button disabled title="Segera hadir">
              Verifikasi
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Data Pribadi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-label-md text-muted-foreground">Nama Lengkap</p>
              <p className="text-body-md font-medium">{fullName}</p>
            </div>
            <div>
              <p className="text-label-md text-muted-foreground">Tempat, Tgl Lahir</p>
              <p className="text-body-md font-medium">
                {applicant.birthPlace}, {formatDate(applicant.birthDate)}
              </p>
            </div>
            <div>
              <p className="text-label-md text-muted-foreground">Jenis Kelamin</p>
              <p className="text-body-md font-medium">
                {genderLabels[applicant.gender] ?? applicant.gender}
              </p>
            </div>
            <div>
              <p className="text-label-md text-muted-foreground">Agama</p>
              <p className="text-body-md font-medium">{applicant.religion}</p>
            </div>
          </CardContent>
        </Card>

        {registration && (
          <Card>
            <CardHeader>
              <CardTitle className="text-headline-md">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-label-md text-muted-foreground">Status Pendaftaran</p>
                <StatusBadge status={registration.status} className="mt-1" />
              </div>
              {registration.program && (
                <div>
                  <p className="text-label-md text-muted-foreground">Program</p>
                  <p className="text-body-md font-medium">{registration.program.name}</p>
                </div>
              )}
              <div>
                <p className="text-label-md text-muted-foreground">Tanggal Daftar</p>
                <p className="text-body-md font-medium">
                  {formatDate(registration.submittedAt ?? registration.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-label-md text-muted-foreground">Berkas</p>
                <p className="text-body-md font-medium">
                  {registration.documents.length} berkas diunggah
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {registration && (
          <Card>
            <CardHeader>
              <CardTitle className="text-headline-md">Berkas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {registration.documents.length === 0 ? (
                <p className="text-body-md text-muted-foreground">
                  Belum ada berkas diunggah.
                </p>
              ) : (
                registration.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                  >
                    <span className="text-sm">{documentLabel(doc.type)}</span>
                    <Badge variant={doc.isVerified ? "success" : "warning"}>
                      {doc.isVerified ? "Terverifikasi" : "Menunggu"}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {(applicant.parents.length > 0 || applicant.addresses.length > 0) && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {applicant.parents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-headline-md">Data Orang Tua/Wali</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {applicant.parents.map((parent) => (
                  <div key={parent.id} className="rounded-md border border-border px-3 py-2">
                    <p className="text-label-md text-muted-foreground">
                      {parentTypeLabels[parent.type] ?? parent.type}
                    </p>
                    <p className="text-body-md font-medium">{parent.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {parent.phone}
                      {parent.occupation ? ` • ${parent.occupation}` : ""}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {applicant.addresses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-headline-md">Alamat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {applicant.addresses.map((address) => (
                  <div key={address.id} className="rounded-md border border-border px-3 py-2">
                    <p className="text-label-md text-muted-foreground">
                      {addressTypeLabels[address.type] ?? address.type}
                    </p>
                    <p className="text-body-md font-medium">
                      {address.street}, {address.district}, {address.city}, {address.province}{" "}
                      {address.postalCode}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {(applicant.academicHistories.length > 0 ||
        (registration?.payments.length ?? 0) > 0) && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {applicant.academicHistories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-headline-md">Riwayat Akademik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {applicant.academicHistories.map((history) => (
                  <div key={history.id} className="rounded-md border border-border px-3 py-2">
                    <p className="text-label-md text-muted-foreground">{history.level}</p>
                    <p className="text-body-md font-medium">{history.institutionName}</p>
                    <p className="text-sm text-muted-foreground">
                      {history.city}, {history.graduationYear}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {registration && registration.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-headline-md">Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {registration.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{payment.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(Number(payment.amount))}
                      </p>
                    </div>
                    <StatusBadge status={payment.status} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {registration && registration.selectionResults.length > 0 && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-headline-md">Hasil Seleksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {registration.selectionResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge status={result.status} />
                    {result.rank !== null && (
                      <span className="text-sm text-muted-foreground">
                        Peringkat {result.rank}
                      </span>
                    )}
                  </div>
                  {result.score !== null && (
                    <span className="text-sm font-medium">Skor {Number(result.score)}</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
