import {
  LayoutDashboard,
  UserPlus,
  FileText,
  CreditCard,
  ClipboardCheck,
  BarChart3,
  Users,
  Settings,
  BookOpen,
  DollarSign,
  Award,
  ShieldCheck,
  History,
  CheckCircle2,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

export const navigation: NavItem[] = [
  // "Dashboard" is split per role rather than one shared entry: ADMIN, FINANCE,
  // and PRINCIPAL each have their own dashboard page (with real, role-specific
  // stats) that used to have no sidebar link at all — every role landed on the
  // generic APPLICANT /dashboard instead. STAFF has no dedicated dashboard
  // page, so it isn't listed here; "Data Pendaftar" is effectively their
  // landing view.
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["APPLICANT"],
  },
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    title: "Dashboard",
    href: "/finance/dashboard",
    icon: LayoutDashboard,
    roles: ["FINANCE"],
  },
  {
    title: "Dashboard",
    href: "/principal/dashboard",
    icon: LayoutDashboard,
    roles: ["PRINCIPAL"],
  },
  {
    title: "Pendaftaran",
    href: "/registration",
    icon: UserPlus,
    roles: ["APPLICANT"],
  },
  {
    title: "Berkas Saya",
    href: "/documents",
    icon: FileText,
    roles: ["APPLICANT"],
  },
  {
    title: "Pembayaran",
    href: "/payment",
    icon: CreditCard,
    roles: ["APPLICANT"],
  },
  {
    title: "Status Seleksi",
    href: "/status",
    icon: ClipboardCheck,
    roles: ["APPLICANT"],
  },
  {
    title: "Data Pendaftar",
    href: "/staff/applicants",
    icon: Users,
    roles: ["STAFF", "ADMIN", "SUPER_ADMIN"],
  },
  {
    title: "Verifikasi",
    href: "/staff/verification",
    icon: ShieldCheck,
    roles: ["STAFF", "ADMIN", "SUPER_ADMIN"],
  },
  {
    title: "Manajemen Pengguna",
    href: "/admin/users",
    icon: Users,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    title: "Periode & Kuota",
    href: "/admin/periods",
    icon: BookOpen,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    title: "Pembayaran",
    href: "/finance/payments",
    icon: DollarSign,
    roles: ["FINANCE", "ADMIN", "SUPER_ADMIN"],
  },
  {
    title: "Seleksi",
    href: "/selection/dashboard",
    icon: Award,
    roles: ["STAFF", "ADMIN", "SUPER_ADMIN"],
  },
  {
    title: "Persetujuan Akhir",
    href: "/principal/approvals",
    icon: CheckCircle2,
    roles: ["PRINCIPAL", "ADMIN", "SUPER_ADMIN"],
  },
  {
    title: "Laporan",
    href: "/reports",
    icon: BarChart3,
    roles: ["ADMIN", "PRINCIPAL", "SUPER_ADMIN"],
  },
  {
    title: "Pengaturan",
    href: "/admin/settings",
    icon: Settings,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    title: "Audit Log",
    href: "/super-admin/audit-log",
    icon: History,
    roles: ["SUPER_ADMIN"],
  },
];
