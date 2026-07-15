# Beyond School PPDB

Portal Penerimaan Peserta Didik Baru (PPDB) online untuk Beyond School — dibangun dengan Next.js 15 (App Router), Prisma, MySQL, dan better-auth.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Webpack)
- **Bahasa**: TypeScript
- **Database**: MySQL via Prisma ORM
- **Autentikasi**: better-auth (email/password + plugin admin bawaan untuk ban akun & manajemen sesi)
- **UI**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **PDF**: jsPDF + jspdf-autotable (laporan & invoice)
- **Email**: Nodemailer (opsional — tanpa `SMTP_HOST`, email reset password hanya dicatat ke log server)

## Memulai

### 1. Prasyarat

- Node.js 18+
- MySQL berjalan secara lokal (atau ubah `DATABASE_URL`)

### 2. Instalasi

```bash
npm install
cp .env.example .env.local
# lalu edit .env.local: DATABASE_URL, BETTER_AUTH_SECRET, dan (opsional) SMTP_*
```

### 3. Setup database

```bash
npm run db:push      # sinkronkan skema Prisma ke database
npm run db:seed      # isi data awal (akun uji + data contoh)
```

> ⚠️ `npm run db:seed` **menghapus semua data** di setiap tabel sebelum mengisi ulang. Jangan jalankan di database yang sudah berisi data produksi.

### 4. Jalankan aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Skrip lain

| Perintah | Fungsi |
|---|---|
| `npm run build` / `npm run start` | Build & jalankan versi produksi |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:studio` | Buka Prisma Studio (GUI database) |
| `npm run db:migrate` | Migrasi Prisma (mode development) |

## Akun Uji (dari `prisma/seed.ts`)

Semua akun memakai password **`password123`**.

| Role | Email |
|---|---|
| SUPER_ADMIN | `superadmin@beyondschool.sch.id` |
| ADMIN | `admin@beyondschool.sch.id` |
| STAFF | `staff@beyondschool.sch.id` |
| FINANCE | `finance@beyondschool.sch.id` |
| PRINCIPAL | `principal@beyondschool.sch.id` |
| APPLICANT | `ahmad@email.com`, `siti@email.com`, `budi@email.com`, `dewi@email.com`, `rizky@email.com`, `dian@email.com`, `agus@email.com`, `rina@email.com`, `hendra@email.com`, `fitri@email.com` |

## Peran & Otorisasi

Ada 6 role: `APPLICANT`, `STAFF`, `ADMIN`, `PRINCIPAL`, `FINANCE`, `SUPER_ADMIN`.

Batas keamanan sesungguhnya ada di **`src/middleware.ts`** (`roleProtectedRoutes`) — setiap prefix rute dipetakan ke daftar role yang diizinkan; pengguna yang login tapi salah role akan di-redirect ke `/dashboard?error=unauthorized`. Menu sidebar (`src/config/navigation.ts`) hanya kontrol tampilan (UX), bukan keamanan — keduanya harus disinkronkan manual setiap kali menambah rute baru.

```
{ prefix: "/admin",       roles: ["ADMIN", "SUPER_ADMIN"] }
{ prefix: "/staff",       roles: ["STAFF", "ADMIN", "SUPER_ADMIN"] }
{ prefix: "/finance",     roles: ["FINANCE", "ADMIN", "SUPER_ADMIN"] }
{ prefix: "/principal",   roles: ["PRINCIPAL", "ADMIN", "SUPER_ADMIN"] }
{ prefix: "/selection",   roles: ["STAFF", "ADMIN", "SUPER_ADMIN"] }
{ prefix: "/reports",     roles: ["ADMIN", "PRINCIPAL", "SUPER_ADMIN"] }
{ prefix: "/super-admin", roles: ["SUPER_ADMIN"] }
```

Rute lain (`/dashboard`, `/profile`, `/registration`, `/documents`, `/payment`, `/status`) hanya mensyaratkan **sudah login** (role apa pun) — kontennya sendiri diperuntukkan bagi APPLICANT.

## Sitemap per Role

Semua rute berikut menggunakan layout `MainLayout` (sidebar + topbar) kecuali disebutkan lain. "Sumber" menunjukkan cara rute itu dijangkau di UI — `sidebar`, `topbar` (menu dropdown akun), atau **tidak ada** kalau halamannya hanya bisa diakses lewat URL langsung.

### 🌐 Publik (tanpa login)

| Rute | Halaman | Sumber |
|---|---|---|
| `/` | Landing page | — |
| `/info` | Informasi PPDB | navbar publik |
| `/faq` | FAQ | navbar publik |
| `/announcements` | Pengumuman | navbar publik |
| `/contact` | Kontak | navbar publik |
| `/login` | Masuk | — |
| `/register` | Daftar akun baru | — |
| `/forgot-password` | Lupa password | link di halaman login |
| `/reset-password` | Atur ulang password | link dari email reset |

### 🎓 APPLICANT (Calon Siswa)

| Rute | Halaman | Sumber |
|---|---|---|
| `/dashboard` | Dashboard pendaftar (progress, ringkasan) | sidebar |
| `/registration` | Formulir pendaftaran 5 langkah | sidebar |
| `/documents` | Berkas Saya (upload dokumen) | sidebar |
| `/payment` | Pembayaran (tagihan, konfirmasi transfer) | sidebar |
| `/status` | Status Seleksi | sidebar |
| `/profile` | Profil Saya (ubah data, ganti password, nonaktifkan akun) | topbar |

### 🧑‍💼 STAFF

Tidak punya halaman "Dashboard" sendiri — "Data Pendaftar" adalah landing view utama mereka setelah login.

| Rute | Halaman | Sumber |
|---|---|---|
| `/staff/applicants` | Data Pendaftar (daftar semua pendaftar) | sidebar |
| `/staff/applicants/[id]` | Detail satu pendaftar | klik baris di Data Pendaftar |
| `/staff/verification` | Verifikasi berkas (setujui/tolak) | sidebar |
| `/selection/dashboard` | Seleksi (kuota per program, proses seleksi otomatis) | sidebar |
| `/dashboard` | Dashboard umum milik APPLICANT — dapat diakses (butuh login saja, bukan role-restricted) tapi tidak relevan untuk STAFF | tidak ada di sidebar STAFF |
| `/profile` | Profil Saya | topbar |

### 🛡️ ADMIN

Semua rute STAFF di atas, ditambah:

| Rute | Halaman | Sumber |
|---|---|---|
| `/admin/dashboard` | Dashboard admin (statistik ringkas) | sidebar |
| `/admin/users` | Manajemen Pengguna (buat akun, ubah role, nonaktifkan/aktifkan, lihat sesi) | sidebar |
| `/admin/periods` | Periode & Kuota (tahun ajaran, kuota per program) | sidebar |
| `/admin/settings` | Pengaturan sistem (nama sekolah, rekening pembayaran) | sidebar |
| `/finance/payments` | Pembayaran (verifikasi transaksi) | sidebar |
| `/principal/approvals` | Persetujuan Akhir hasil seleksi | sidebar |
| `/reports` | Laporan (PDF pendaftar/keuangan/seleksi, export CSV) | sidebar |

### 💰 FINANCE

| Rute | Halaman | Sumber |
|---|---|---|
| `/finance/dashboard` | Dashboard keuangan (statistik pemasukan) | sidebar |
| `/finance/payments` | Pembayaran (verifikasi transaksi) | sidebar |
| `/profile` | Profil Saya | topbar |

### 🏫 PRINCIPAL (Kepala Sekolah)

| Rute | Halaman | Sumber |
|---|---|---|
| `/principal/dashboard` | Dashboard eksekutif (ringkasan seleksi & realisasi) | sidebar |
| `/principal/approvals` | Persetujuan Akhir hasil seleksi | sidebar |
| `/reports` | Laporan | sidebar |
| `/profile` | Profil Saya | topbar |

### 👑 SUPER_ADMIN

Semua rute ADMIN di atas, ditambah:

| Rute | Halaman | Sumber |
|---|---|---|
| `/super-admin/audit-log` | Audit Log (riwayat aksi sensitif: buat/ubah role pengguna, ban akun, ubah pengaturan) | sidebar — **satu-satunya rute yang benar-benar ditolak untuk ADMIN biasa**, semua rute lain di atas dapat diakses ADMIN juga |

> Setelah login, setiap role diarahkan otomatis ke dashboard-nya sendiri (`src/app/(auth)/login/page.tsx`'s `ROLE_DASHBOARD` map) — sebelumnya semua role (kecuali yang memilih tab "Administrator") selalu diarahkan ke `/dashboard` milik APPLICANT terlepas dari role sebenarnya. Item sidebar "Dashboard" kini juga dipecah per role di `src/config/navigation.ts` alih-alih satu entri generik untuk semua orang.

## Status Kesiapan Produksi (per 2026-07-15)

✅ **Terverifikasi lulus:**
- `npm run build` sukses tanpa error (52 rute ter-generate, 0 error ESLint/TypeScript).
- Regresi penuh: setiap rute × keenam role diuji lewat `npm run start` (server produksi sungguhan, bukan `next dev`) — akses positif & negatif 100% sesuai matriks `middleware.ts`.
- Alur kunci diuji ulang di mode produksi: ban/unban akun, reset password (link tercatat benar), proteksi upload (tolak path-traversal & tipe file salah), pencarian di tabel data, audit log, pengaturan sistem, periode & kuota.

⚠️ **Wajib diisi sebelum deploy sungguhan** (bukan bug kode, tapi konfigurasi lingkungan):
- `BETTER_AUTH_SECRET` — nilai di `.env.example`/`.env` masih placeholder `"change-me-to-a-random-string"`. Generate secret acak sungguhan untuk lingkungan produksi (mis. `openssl rand -base64 32`).
- `DATABASE_URL` — arahkan ke database produksi, bukan MySQL lokal.
- `SMTP_*` — tanpa ini, email reset password hanya tercatat di log server, tidak benar-benar terkirim.
- Payment gateway — belum ada; alur saat ini transfer manual + konfirmasi Finance (lihat di bawah).

- **Pembayaran**: belum ada payment gateway — alur saat ini adalah transfer manual + konfirmasi ("Saya Sudah Transfer") yang diverifikasi manual oleh Finance.
- **Seleksi otomatis**: algoritma di `/selection/dashboard` mengurutkan berdasarkan skor lalu tanggal daftar (siapa cepat), lalu mengisi kuota per program — belum ada kriteria penilaian yang lebih kaya.
- Detail lengkap arsitektur & keputusan desain ada di `docs/QC_PLAN.md` (riwayat audit QC — sebagian sudah diperbaiki sejak ditulis, cek kode terkini untuk status pasti).

## Struktur Proyek (ringkas)

```
prisma/            Skema database & seed data
src/app/           Route Next.js (App Router) — dikelompokkan per role/fitur
src/components/    Komponen UI (ui/, layout/, data/, shared/, forms/)
src/lib/           Utilitas inti: auth.ts, prisma.ts, audit.ts, email.ts, pdf.ts, constants.ts
src/config/        Konfigurasi navigasi sidebar
src/services/      Service layer (registrationService, paymentService, dll.)
src/middleware.ts  Batas keamanan role-based (lihat bagian Peran & Otorisasi)
```
