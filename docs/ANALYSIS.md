# Beyond School PPDB — Complete Analysis

> Generated from: AGENTS_ppdb.md, docs/*, Google Stitch MCP (4 projects)

---

## 1. DESIGN INVENTORY

### 1.1 Design Authority: Google Stitch MCP

**Primary Design System:** Beyond School PPDB (asset: `6c496df44f474aee92e870a2882b9a55`)
- **Theme:** Modern SaaS / Minimalist, inspired by Stripe, Linear, Notion
- **Philosophy:** Precision over Ornament, Data-First Hierarchy, Premium Utility

### 1.2 Color System

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#4F46E5` | Primary actions, brand elements |
| Primary Container | `#3525CD` | Active states, selected items |
| Secondary | `#3B82F6` | Secondary interactive, nav cues |
| Background | `#F8FAFC` | App canvas |
| Surface | `#FFFFFF` | Cards, modals, containers |
| Surface Container | `#EDEEEF` | Sidebar, container headers |
| Border | `#E5E7EB` | Dividers, input borders |
| Text Primary | `#111827` | Headings |
| Text Secondary | `#64748B` | Labels, captions |
| Success | `#16A34A` | Status badges |
| Warning | `#F59E0B` | Pending states |
| Danger | `#DC2626` | Error, rejected |
| Info | `#2563EB` | Info callouts |

### 1.3 Typography Scale

| Level | Size | Weight | Line Height |
|-------|------|--------|-------------|
| Display | 36px | 700 | 44px |
| Headline LG | 28px | 600 | 36px |
| Headline MD | 20px | 600 | 28px |
| Body LG | 16px | 400 | 24px |
| Body MD | 14px | 400 | 20px |
| Label MD | 12px | 500 | 16px |
| Code | 13px | 400 | 20px |
| Headline LG Mobile | 24px | 600 | 32px |

- **Font:** Inter (primary), JetBrains Mono (code/data)
- **Label Letter-spacing:** 0.05em

### 1.4 Spacing System

| Token | Value |
|-------|-------|
| Unit | 4px |
| XS | 4px |
| SM | 8px |
| MD | 16px |
| LG | 24px |
| XL | 32px |
| Gutter | 24px |
| Margin Mobile | 16px |
| Margin Desktop | 40px |
| Max Width | 1440px |

### 1.5 Roundness

| Level | Value |
|-------|-------|
| SM | 0.125rem (2px) |
| DEFAULT | 0.25rem (4px) |
| MD | 0.375rem (6px) |
| LG | 0.5rem (8px) |
| XL | 0.75rem (12px) |
| FULL | 9999px (pills/badges) |

### 1.6 Elevation

- **Card Shadow:** `0px 1px 3px rgba(0,0,0,0.1), 0px 10px 20px rgba(0,0,0,0.02)`
- **Modal Shadow:** Larger blur (24px) for high elevation
- **Borders:** 1px `#E5E7EB` for containers; Indigo 2px for active states

### 1.7 Stitch Screens Inventory

#### Beyond School PPDB Platform (primary)
| Screen | Description |
|--------|-------------|
| Public Landing Page | Hero, timeline, admission info, FAQ, CTA |
| Registration Step 1 | Applicant personal info |
| Registration Step 2 | Address info |
| Registration Step 3 | Parent/guardian info |
| Registration Step 4 | Academic info, program selection |
| Registration Step 5 | Document upload |
| Applicant Dashboard | Progress tracking, status, quick actions |
| Applicant Management | Staff portal table view |

#### PPDB Online Portal (reference)
| Screen | Description |
|--------|-------------|
| Landing Page PPDB Online | Hero, info sections |
| Form Pendaftaran PPDB | Multi-step registration |
| Dashboard Calon Siswa | Applicant dashboard |
| Daftar Verifikasi | Staff verification list |
| Admin Overview Dashboard | Stats, charts, tables |
| Admin Finance Dashboard | Payment tracking |
| Detail Pendaftaran | Applicant detail view |
| Profil Calon Siswa | Profile management |
| Upload Dokumen | Document upload |
| Status Pembayaran | Payment status |
| Status Seleksi | Selection results |
| Pengaturan Periode & Kuota | Period & quota settings |
| Pengaturan Akun | Account settings |
| Pusat Bantuan & FAQ | Help center |
| Pendaftaran Berhasil | Success screen |
| Pengumuman Terbaru | Announcements |

#### Integrated School Admission Portal (reference)
| Screen | Description |
|--------|-------------|
| Registration Wizard - Personal Data | Step-by-step form |
| Registration Wizard - Program Selection | Program picker |
| Registration Wizard - Academic History | Academic info |
| Registration Wizard - Document Upload | File upload step |
| Registration Submitted - Next Steps | Post-submit screen |
| Applicant Portal - Redesign | Dashboard variant |
| Payment & Billing - Redesign | Payment flow |
| Admission Result Status | Result display |

#### Enterprise School Management Dashboard (reference)
| Screen | Description |
|--------|-------------|
| Super Admin Dashboard - EduControl | KPI cards, analytics, data tables |

---

## 2. COMPONENT INVENTORY

### 2.1 Core UI Components (from Stitch + Shadcn)

| Component | Variants | Source |
|-----------|----------|--------|
| **Button** | Primary (Indigo), Secondary (outlined), Ghost, Danger | Stitch DS |
| **Input** | Default, Focus (Indigo ring), Error (red), Disabled | Stitch DS |
| **Select/Dropdown** | Single select, searchable | Shadcn |
| **Card** | Dashboard widget, form card, stat card | Stitch DS |
| **Badge** | Status: approved (green), pending (orange), rejected (red), draft (gray) | Stitch DS |
| **Modal** | Blur backdrop, large padding, smooth animation | Stitch DS |
| **Data Table** | Fixed header, sortable, filterable, paginated, 52px rows | Stitch DS |
| **Stepper** | Horizontal multi-step progress, Indigo line + checkmarks | Stitch DS |
| **File Upload** | Drag & drop, progress, preview, validation | Stitch DS |
| **Tabs** | Content navigation | Shadcn |
| **Dialog/Alert** | Confirmation dialogs | Shadcn |
| **Sheet** | Slide-over panels | Shadcn |
| **Dropdown Menu** | Context menus | Shadcn |
| **Avatar** | User photo placeholder | Shadcn |
| **Skeleton** | Loading placeholders | Shadcn |
| **Toast** | Notification toasts | Shadcn |
| **Pagination** | Page navigation for tables | Shadcn |
| **Tooltip** | Hover information | Shadcn |
| **Progress** | Linear progress bars | Shadcn |
| **Checkbox** | Multi-select | Shadcn |
| **Radio** | Single select | Shadcn |
| **Textarea** | Multi-line input | Shadcn |
| **Date Picker** | Date range/select | Shadcn |
| **Command/Palette** | Searchable command menu | Shadcn |

### 2.2 Composite Components (from Stitch screens)

| Component | Screens Used | Props |
|-----------|-------------|-------|
| **StatCard (KPI)** | All dashboards | label, value, trend, icon |
| **Timeline** | Applicant dashboard | steps[], currentStep, status |
| **ProgressBar** | Registration wizard | percent, steps[], current |
| **StatusBadge** | Tables, detail views | status: enum, size |
| **DataTable** | Applicant management, finance | columns[], data[], sort, filter |
| **SearchInput** | Tables, navbars | placeholder, onChange, debounce |
| **SidebarNav** | All authenticated layouts | items[], active, collapsed |
| **TopNavbar** | All authenticated layouts | breadcrumb, user, notifications |
| **FilterBar** | Table views | filters[], onApply, onReset |
| **ActionMenu** | Table rows | actions[], onSelect |
| **EmptyState** | All pages | icon, title, description, cta |
| **ErrorState** | All pages | message, retry |
| **SectionHeader** | Widgets, form sections | title, action, description |

### 2.3 Layout Components

| Component | Location | Description |
|-----------|----------|-------------|
| **MainLayout** | Root auth layout | Sidebar + Topbar + Content |
| **PublicLayout** | Root public layout | Header + content + footer |
| **Sidebar** | Left panel | 260px width, sticky, scrollable |
| **TopNavbar** | Top bar | 72px height, sticky, blur |
| **ContentArea** | Center | Max 1440px, fluid padding |
| **FormWizard** | Registration flow | Multi-step container |
| **PageHeader** | Each page | Title, breadcrumb, actions |

---

## 3. GAP ANALYSIS

### 3.1 Stitch Screens vs. Module Requirements

| Module | Stitch Screens Available | Missing |
|--------|------------------------|---------|
| **Public Website** | Landing page ✓ | Blog/news, school profile, contact |
| **Registration** | Steps 1-5, success ✓ | Preview/submit step, edit draft flow |
| **Authentication** | None ❌ | Login, register, forgot password, email verification, 2FA |
| **Applicant Dashboard** | Basic dashboard ✓ | Detailed status timeline, notifications panel, download documents |
| **Staff Portal** | Applicant list, detail view, verification list ✓ | Bulk actions, note/comment system, assignment workflow |
| **Admin** | Overview dashboard ✓ | User management, role management, audit logs, system config |
| **Finance** | Finance dashboard ✓ | Invoice generation, receipt printing, refund workflow, payment gateway integration |
| **Selection/Acceptance** | Selection status ✓ | Scoring system, ranking, auto-accept/reject, appeals |
| **Reports** | None ❌ | Analytics dashboard, export (PDF/Excel), custom reports, charts |
| **Settings** | Period/quota, account ✓ | Email templates, document config, academic year management |

### 3.2 Design System Gaps

| Area | Status | Action |
|------|--------|--------|
| TailwindCSS config parity with Stitch tokens | ❌ Missing | Generate `tailwind.config.ts` with all design tokens |
| Shadcn component theme | ❌ Missing | Configure shadcn with Stitch color primitives |
| CSS variable mapping | ❌ Missing | Map Stitch colors to CSS custom properties |
| Dark mode architecture | ⚠️ Stubbed | Add CSS variable structure, no dark mode implementation needed yet |
| Responsive breakpoints | ⚠️ Partial | Document 375/768/1280/1440px breakpoints |
| Animation system | ❌ Missing | Define transition timing, easing curves |

### 3.3 Technology Gaps

| Area | Status | Details |
|------|--------|---------|
| Next.js 15 project | ❌ Not created | Must bootstrap with App Router |
| TypeScript strict | ❌ Not configured | `tsconfig.json` needs strict mode |
| Prisma schema | ❌ Not created | Need full schema (see Section 5) |
| Better Auth | ❌ Not configured | Auth setup, providers, session management |
| MySQL database | ❌ Not created | Need migration after schema |
| Package dependencies | ❌ Not installed | `package.json` empty |
| TailwindCSS v3 | ❌ Not configured | Config, plugins |
| Shadcn UI | ❌ Not initialized | Component installation |

### 3.4 Missing Pages by Module

| Module | Pages to Build |
|--------|--------------|
| **Public** | `/` (landing), `/info`, `/faq`, `/contact`, `/blog`, `/announcements` |
| **Auth** | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email` |
| **Applicant** | `/dashboard`, `/register` (steps 1-5), `/documents`, `/payment`, `/status`, `/profile` |
| **Staff** | `/staff/applicants`, `/staff/applicants/[id]`, `/staff/verification`, `/staff/assignments` |
| **Admin** | `/admin/dashboard`, `/admin/users`, `/admin/roles`, `/admin/periods`, `/admin/settings` |
| **Finance** | `/finance/dashboard`, `/finance/payments`, `/finance/invoices` |
| **Selection** | `/selection/dashboard`, `/selection/scoring`, `/selection/results` |
| **Reports** | `/reports`, `/reports/[type]` |
| **Principal** | `/principal/dashboard`, `/principal/reports`, `/principal/approvals` |

---

## 4. FOLDER STRUCTURE

```
beyond-school-ppdb/
├── .vscode/
│   └── settings.json
├── docs/                          # Documentation
│   ├── ANALYSIS.md
│   ├── api_specification.md
│   ├── architecture.md
│   ├── database_design.md
│   ├── development_roadmap.md
│   ├── module_specifications.md
│   ├── product_requirements.md
│   ├── routing_structure.md
│   ├── ui_ux_guidelines.md
│   └── user_roles.md
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Seed data
├── public/
│   ├── images/
│   │   └── ...
│   ├── fonts/
│   │   └── ...
│   └── favicon.ico
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (public)/               # Public website layout
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── info/
│   │   │   ├── faq/
│   │   │   ├── contact/
│   │   │   ├── announcements/
│   │   │   └── blog/
│   │   ├── (auth)/                 # Auth routes
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/            # Authenticated dashboard
│   │   │   ├── layout.tsx          # Sidebar + Topbar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   ├── page.tsx
│   │   │   │   └── steps/
│   │   │   ├── documents/
│   │   │   ├── payment/
│   │   │   ├── status/
│   │   │   └── profile/
│   │   ├── staff/                  # Staff portal
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── applicants/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   └── verification/
│   │   ├── admin/                  # Admin portal
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── periods/
│   │   │   └── settings/
│   │   ├── finance/                # Finance portal
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── payments/
│   │   │   └── invoices/
│   │   ├── selection/              # Selection portal
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── scoring/
│   │   │   └── results/
│   │   ├── reports/                # Reports portal
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── [type]/
│   │   ├── principal/              # Principal portal
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── reports/
│   │   │   └── approvals/
│   │   ├── api/                    # API route handlers
│   │   │   ├── auth/
│   │   │   │   └── [...route]/
│   │   │   ├── applicants/
│   │   │   ├── registrations/
│   │   │   ├── documents/
│   │   │   ├── payments/
│   │   │   ├── users/
│   │   │   ├── periods/
│   │   │   ├── programs/
│   │   │   ├── reports/
│   │   │   └── notifications/
│   │   ├── globals.css             # Tailwind imports + CSS variables
│   │   ├── layout.tsx              # Root layout
│   │   └── not-found.tsx           # 404 page
│   ├── components/
│   │   ├── ui/                     # Shadcn UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── progress.tsx
│   │   │   └── ...                 # Other shadcn components
│   │   ├── layout/                 # Layout components
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   ├── main-layout.tsx
│   │   │   ├── public-layout.tsx
│   │   │   └── page-header.tsx
│   │   ├── forms/                  # Form components
│   │   │   ├── form-wizard.tsx
│   │   │   ├── stepper.tsx
│   │   │   ├── file-upload.tsx
│   │   │   ├── address-input.tsx
│   │   │   └── parent-info.tsx
│   │   ├── data/                   # Data display
│   │   │   ├── data-table.tsx
│   │   │   ├── filter-bar.tsx
│   │   │   ├── stat-card.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── timeline.tsx
│   │   │   ├── kpi-card.tsx
│   │   │   └── empty-state.tsx
│   │   ├── charts/                 # Chart components
│   │   │   ├── line-chart.tsx
│   │   │   ├── bar-chart.tsx
│   │   │   ├── pie-chart.tsx
│   │   │   └── area-chart.tsx
│   │   └── shared/                 # Shared components
│   │       ├── search-input.tsx
│   │       ├── confirm-dialog.tsx
│   │       ├── loading-state.tsx
│   │       ├── error-state.tsx
│   │       ├── announcement-bar.tsx
│   │       └── notification-bell.tsx
│   ├── lib/                        # Utilities
│   │   ├── utils.ts                # cn() helper
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── auth.ts                 # Better Auth config
│   │   ├── upload.ts               # File upload helpers
│   │   ├── format.ts               # Date, currency, number formatters
│   │   ├── validations.ts          # Zod schemas
│   │   └── constants.ts            # Enums, constants
│   ├── hooks/                      # Custom React hooks
│   │   ├── use-debounce.ts
│   │   ├── use-media-query.ts
│   │   ├── use-local-storage.ts
│   │   └── use-current-role.ts
│   ├── services/                   # Server actions / service layer
│   │   ├── applicant-service.ts
│   │   ├── registration-service.ts
│   │   ├── document-service.ts
│   │   ├── payment-service.ts
│   │   ├── user-service.ts
│   │   ├── period-service.ts
│   │   ├── selection-service.ts
│   │   ├── report-service.ts
│   │   └── notification-service.ts
│   ├── types/                      # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── applicant.ts
│   │   ├── registration.ts
│   │   ├── payment.ts
│   │   ├── user.ts
│   │   └── prisma.ts               # Generated Prisma types
│   ├── middleware.ts               # Next.js middleware (auth guard)
│   └── config/
│       ├── navigation.ts           # Sidebar nav items by role
│       └── site.ts                 # Site metadata
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
├── postcss.config.js
├── components.json                 # Shadcn config
├── .env.example
├── .env.local
├── .gitignore
└── README.md
```

---

## 5. DATABASE SCHEMA

### 5.1 Entity Relationship Summary

```
users ──1:N──> accounts (Better Auth)
users ──1:1──> profiles
users ──1:N──> sessions (Better Auth)
users ──1:N──> verifications (Better Auth)

users ──1:N──> applicants
applicants ──1:1──> registrations
registrations ──1:N──> registration_steps
registrations ──N:1──> programs
registrations ──N:1──> academic_periods
registrations ──1:N──> documents
registrations ──1:N──> payments
registrations ──1:N──> selection_results
registrations ──1:N──> notes

applicants ──1:N──> parents
applicants ──1:N──> addresses
applicants ──1:N──> academic_histories

payments ──N:1──> payment_types

programs ──N:1──> academic_periods
programs ──1:N──> program_quotas

selection_results ──1:1──> selection_criteria_scores

users ──1:N──> notifications
notifications ──N:1──> notification_templates
```

### 5.2 Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ============ AUTH (Better Auth) ============

model User {
  id          String   @id @default(cuid())
  name        String
  email       String   @unique
  emailVerified Boolean @default(false)
  image       String?
  phone       String?
  role        UserRole @default(APPLICANT)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  accounts      Account[]
  sessions      Session[]
  profile       Profile?
  applicants    Applicant[]
  notifications Notification[]
  notes         Note[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  accountId         String
  providerId        String
  accessToken       String?
  refreshToken      String?
  accessTokenExpiresAt DateTime?
  refreshTokenExpiresAt DateTime?
  scope             String?
  idToken           String?
  password          String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("accounts")
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("verifications")
}

model Profile {
  id           String   @id @default(cuid())
  userId       String   @unique
  phone        String?
  address      String?
  city         String?
  province     String?
  postalCode   String?
  birthDate    DateTime?
  birthPlace   String?
  gender       Gender?
  religion     String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

// ============ APPLICATION ============

model Applicant {
  id            String   @id @default(cuid())
  userId        String   @unique
  registrationNumber String? @unique
  firstName     String
  lastName      String?
  nickName      String?
  birthPlace    String
  birthDate     DateTime
  gender        Gender
  religion      String
  nationality   String   @default("WNI")
  childNumber   Int?
  siblingsCount Int?
  photo         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user              User               @relation(fields: [userId], references: [id])
  registration      Registration?
  parents           Parent[]
  addresses         Address[]
  academicHistories AcademicHistory[]

  @@map("applicants")
}

model Parent {
  id          String          @id @default(cuid())
  applicantId String
  type        ParentType
  name        String
  birthPlace  String?
  birthDate   DateTime?
  education   EducationLevel?
  occupation  String?
  employer    String?
  income      Decimal?
  phone       String
  email       String?
  isAlive     Boolean         @default(true)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  applicant Applicant @relation(fields: [applicantId], references: [id], onDelete: Cascade)

  @@map("parents")
}

model Address {
  id          String   @id @default(cuid())
  applicantId String
  type        AddressType
  street      String
  village     String?
  subDistrict String?
  district    String
  city        String
  province    String
  postalCode  String
  rt          String?
  rw          String?
  isDomisili  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  applicant Applicant @relation(fields: [applicantId], references: [id], onDelete: Cascade)

  @@map("addresses")
}

model AcademicHistory {
  id              String          @id @default(cuid())
  applicantId     String
  level           EducationLevel
  institutionName String
  city            String
  province        String
  graduationYear  Int
  nisn            String?
  npsn            String?
  major           String?
  finalGrade      Decimal?
  isPreviousSchool Boolean         @default(false)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  applicant Applicant @relation(fields: [applicantId], references: [id], onDelete: Cascade)

  @@map("academic_histories")
}

// ============ REGISTRATION ============

model Registration {
  id              String         @id @default(cuid())
  applicantId     String         @unique
  academicPeriodId String
  programId       String
  status          RegistrationStatus @default(DRAFT)
  stepCompleted   Int            @default(0)
  appliedAt       DateTime?
  verifiedAt      DateTime?
  verifiedBy      String?
  submittedAt     DateTime?
  reviewNotes     String?
  decisionAt      DateTime?
  decisionBy      String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  applicant        Applicant         @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  academicPeriod   AcademicPeriod    @relation(fields: [academicPeriodId], references: [id])
  program          Program           @relation(fields: [programId], references: [id])
  documents        Document[]
  payments         Payment[]
  selectionResults SelectionResult[]
  notes            Note[]

  @@map("registrations")
}

model RegistrationStep {
  id             String   @id @default(cuid())
  registrationId String
  stepNumber     Int
  stepName       String
  status         StepStatus @default(PENDING)
  completedAt    DateTime?
  data           Json?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  registration Registration @relation(fields: [registrationId], references: [id], onDelete: Cascade)

  @@map("registration_steps")
}

// ============ ACADEMIC CONFIG ============

model AcademicPeriod {
  id          String   @id @default(cuid())
  name        String
  year        Int
  semester    Semester
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean  @default(false)
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  registrations Registration[]
  programs      Program[]
  programQuotas ProgramQuota[]

  @@map("academic_periods")
}

model Program {
  id               String   @id @default(cuid())
  academicPeriodId String
  code             String
  name             String
  description      String?
  capacity         Int
  minAge           Int?
  maxAge           Int?
  minGrade         Decimal?
  requirements     Json?
  isActive         Boolean  @default(true)
  fee              Decimal?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  academicPeriod  AcademicPeriod  @relation(fields: [academicPeriodId], references: [id])
  registrations   Registration[]
  programQuotas   ProgramQuota[]

  @@map("programs")
}

model ProgramQuota {
  id               String   @id @default(cuid())
  academicPeriodId String
  programId        String
  totalQuota       Int
  filledQuota      Int      @default(0)
  quotaType        QuotaType
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  academicPeriod AcademicPeriod @relation(fields: [academicPeriodId], references: [id])
  program        Program        @relation(fields: [programId], references: [id])

  @@map("program_quotas")
}

// ============ DOCUMENTS ============

model Document {
  id             String   @id @default(cuid())
  registrationId String
  type           DocumentType
  fileName       String
  originalName   String
  fileSize       Int
  mimeType       String
  filePath       String
  isVerified     Boolean  @default(false)
  verifiedAt     DateTime?
  verifiedBy     String?
  rejectionNote  String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  registration Registration @relation(fields: [registrationId], references: [id], onDelete: Cascade)

  @@map("documents")
}

// ============ PAYMENTS ============

model Payment {
  id             String        @id @default(cuid())
  registrationId String
  paymentTypeId  String
  invoiceNumber  String        @unique
  amount         Decimal
  paidAmount     Decimal       @default(0)
  status         PaymentStatus @default(PENDING)
  method         String?
  vaNumber       String?
  bankName       String?
  billKey        String?
  billCode       String?
  paidAt         DateTime?
  expiredAt      DateTime?
  proofFile      String?
  notes          String?
  approvedBy     String?
  approvedAt     DateTime?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  registration Registration  @relation(fields: [registrationId], references: [id])
  paymentType  PaymentType   @relation(fields: [paymentTypeId], references: [id])

  @@map("payments")
}

model PaymentType {
  id          String    @id @default(cuid())
  code        String    @unique
  name        String
  description String?
  amount      Decimal
  isMandatory Boolean   @default(false)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  payments Payment[]

  @@map("payment_types")
}

// ============ SELECTION ============

model SelectionResult {
  id             String   @id @default(cuid())
  registrationId String   @unique
  status         SelectionStatus @default(PENDING)
  score          Decimal?
  rank           Int?
  notes          String?
  decidedBy      String?
  decidedAt      DateTime?
  appealNote     String?
  appealFile     String?
  appealStatus   AppealStatus?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  registration Registration @relation(fields: [registrationId], references: [id], onDelete: Cascade)
  criteriaScores SelectionCriteriaScore[]

  @@map("selection_results")
}

model SelectionCriteriaScore {
  id               String  @id @default(cuid())
  selectionResultId String
  criteriaName    String
  score           Decimal
  maxScore        Decimal
  weight          Decimal @default(1.0)
  notes           String?

  selectionResult SelectionResult @relation(fields: [selectionResultId], references: [id], onDelete: Cascade)

  @@map("selection_criteria_scores")
}

// ============ COMMUNICATION ============

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  message   String
  type      NotificationType
  link      String?
  isRead    Boolean  @default(false)
  readAt    DateTime?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}

model Note {
  id             String   @id @default(cuid())
  userId         String
  registrationId String
  content        String
  isInternal     Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user         User         @relation(fields: [userId], references: [id])
  registration Registration @relation(fields: [registrationId], references: [id])

  @@map("notes")
}

// ============ ENUMS ============

enum UserRole {
  APPLICANT
  PARENT
  STAFF
  ADMIN
  PRINCIPAL
  FINANCE
  SUPER_ADMIN
}

enum Gender {
  MALE
  FEMALE
}

enum ParentType {
  FATHER
  MOTHER
  GUARDIAN
}

enum EducationLevel {
  TK
  SD
  SMP
  SMA
  SMK
  D1
  D2
  D3
  D4
  S1
  S2
  S3
}

enum AddressType {
  HOME
  PARENT
  DOMICILE
}

enum Semester {
  ODD
  EVEN
}

enum QuotaType {
  REGULAR
  PRESTASI
  AFIRMASI
  PINDAHAN
  LAINNYA
}

enum RegistrationStatus {
  DRAFT
  SUBMITTED
  VERIFIED
  INCOMPLETE
  COMPLETED
}

enum StepStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  SKIPPED
}

enum DocumentType {
  BIRTH_CERTIFICATE
  FAMILY_CARD
  IDENTITY_CARD
  PASSPORT_PHOTO
  REPORT_CARD
  DIPLOMA
  ACHIEVEMENT
  HEALTH_CERTIFICATE
  PARENT_CONSENT
  SCHOLARSHIP_LETTER
  TRANSFER_LETTER
  OTHER
}

enum PaymentStatus {
  PENDING
  WAITING_PAYMENT
  PAID
  VERIFIED
  EXPIRED
  FAILED
  REFUNDED
}

enum SelectionStatus {
  PENDING
  PASSED
  WAITLIST
  REJECTED
  APPEALED
}

enum AppealStatus {
  SUBMITTED
  APPROVED
  REJECTED
}

enum NotificationType {
  INFO
  SUCCESS
  WARNING
  ERROR
  REMINDER
}
```

---

## DELIVERY SUMMARY

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | **Design Inventory** — Complete color, typography, spacing, elevation tokens from Stitch DS | ✅ |
| 2 | **Component Inventory** — All UI primitives + composite components mapped | ✅ |
| 3 | **Gap Analysis** — Missing pages, screens, features, and configuration gaps identified | ✅ |
| 4 | **Folder Structure** — Full Next.js 15 App Router directory tree with service layer | ✅ |
| 5 | **Database Schema** — Complete Prisma schema with 20+ models, enums, relations | ✅ |

**Next:** Awaiting your approval to begin code generation (bootstrap Next.js, install deps, configure tailwind/shadcn/prisma).
