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
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

export const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["APPLICANT", "STAFF", "ADMIN", "FINANCE", "PRINCIPAL", "SUPER_ADMIN"],
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
    roles: ["STAFF", "ADMIN"],
  },
  {
    title: "Verifikasi",
    href: "/staff/verification",
    icon: ShieldCheck,
    roles: ["STAFF"],
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
    roles: ["FINANCE", "ADMIN"],
  },
  {
    title: "Seleksi",
    href: "/selection/dashboard",
    icon: Award,
    roles: ["STAFF", "ADMIN"],
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
