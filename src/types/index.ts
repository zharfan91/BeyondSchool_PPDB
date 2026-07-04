export type UserRole =
  | "APPLICANT"
  | "PARENT"
  | "STAFF"
  | "ADMIN"
  | "PRINCIPAL"
  | "FINANCE"
  | "SUPER_ADMIN";

export type RegistrationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "VERIFIED"
  | "INCOMPLETE"
  | "COMPLETED";

export type SelectionStatus =
  | "PENDING"
  | "PASSED"
  | "WAITLIST"
  | "REJECTED"
  | "APPEALED";

export type PaymentStatus =
  | "PENDING"
  | "WAITING_PAYMENT"
  | "PAID"
  | "VERIFIED"
  | "EXPIRED"
  | "FAILED"
  | "REFUNDED";

export type DocumentType =
  | "BIRTH_CERTIFICATE"
  | "FAMILY_CARD"
  | "IDENTITY_CARD"
  | "PASSPORT_PHOTO"
  | "REPORT_CARD"
  | "DIPLOMA"
  | "ACHIEVEMENT"
  | "HEALTH_CERTIFICATE"
  | "PARENT_CONSENT"
  | "OTHER";

export type Gender = "MALE" | "FEMALE";

export type ParentType = "FATHER" | "MOTHER" | "GUARDIAN";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

export interface StatCardData {
  title: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  icon?: React.ComponentType<{ className?: string }>;
}

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface StepConfig {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}
