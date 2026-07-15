export const SITE_NAME = "Beyond School PPDB";
export const SITE_DESCRIPTION = "Penerimaan Peserta Didik Baru - Beyond School";

export const ROLES = {
  APPLICANT: "APPLICANT",
  STAFF: "STAFF",
  ADMIN: "ADMIN",
  PRINCIPAL: "PRINCIPAL",
  FINANCE: "FINANCE",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

// Roles that require SUPER_ADMIN approval to create, promote to, or otherwise
// act on (a plain ADMIN cannot touch an account already at this tier or
// promote anyone into it). Deliberately typed as string[] (not `as const`) so
// it can be checked against plain `string` role values without a cast.
export const ELEVATED_ROLES: string[] = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

export const REGISTRATION_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  VERIFIED: "VERIFIED",
  INCOMPLETE: "INCOMPLETE",
  COMPLETED: "COMPLETED",
} as const;

export const SELECTION_STATUS = {
  PENDING: "PENDING",
  PASSED: "PASSED",
  WAITLIST: "WAITLIST",
  REJECTED: "REJECTED",
  APPEALED: "APPEALED",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  WAITING_PAYMENT: "WAITING_PAYMENT",
  PAID: "PAID",
  VERIFIED: "VERIFIED",
  EXPIRED: "EXPIRED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export const DOCUMENT_TYPES = [
  { value: "BIRTH_CERTIFICATE", label: "Akte Kelahiran" },
  { value: "FAMILY_CARD", label: "Kartu Keluarga" },
  { value: "IDENTITY_CARD", label: "KTP" },
  { value: "PASSPORT_PHOTO", label: "Pas Foto" },
  { value: "REPORT_CARD", label: "Raport" },
  { value: "DIPLOMA", label: "Ijazah" },
  { value: "ACHIEVEMENT", label: "Piagam Prestasi" },
  { value: "HEALTH_CERTIFICATE", label: "Surat Sehat" },
  { value: "PARENT_CONSENT", label: "Surat Izin Orang Tua" },
  { value: "OTHER", label: "Lainnya" },
] as const;

export const EDUCATION_LEVELS = [
  { value: "TK", label: "TK" },
  { value: "SD", label: "SD" },
  { value: "SMP", label: "SMP" },
  { value: "SMA", label: "SMA" },
  { value: "SMK", label: "SMK" },
  { value: "D1", label: "D1" },
  { value: "D2", label: "D2" },
  { value: "D3", label: "D3" },
  { value: "D4", label: "D4" },
  { value: "S1", label: "S1" },
  { value: "S2", label: "S2" },
  { value: "S3", label: "S3" },
] as const;
