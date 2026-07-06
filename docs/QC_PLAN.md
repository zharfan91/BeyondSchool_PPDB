# Rencana QC — Beyond School PPDB

> Disusun 2026-07-03 berdasarkan audit menyeluruh (7 agen paralel, membaca kode sungguhan + `prisma/seed.ts`) atas laporan: *"data yang ditampilkan di halaman Profil Saya masih [salah], data pendaftar juga tidak sesuai."* Audit ini mengonfirmasi kedua laporan tersebut, dan menemukan pola yang sama di hampir seluruh halaman aplikasi, plus beberapa kerentanan keamanan nyata yang lebih mendesak daripada bug tampilan.

---

## 1. Ringkasan Eksekutif

**Akar masalah utama: proyek ini adalah UI mockup dengan skema database & service layer yang sudah lengkap, tapi hampir tidak ada yang benar-benar tersambung.** `registrationService`, `paymentService`, `documentService`, `notificationService`, `selectionService` — semuanya sudah lengkap secara kode, tapi **tidak pernah dipanggil dari satu pun halaman**. Hanya `applicantService` yang terpakai (itupun dengan bug bentuk data).

| Kategori | Jumlah rute terdampak | Contoh |
|---|---|---|
| **Halaman 100% hardcoded** (data statis, sama untuk semua user) | 13 halaman | `/profile`, `/dashboard`, `/status`, `/admin/dashboard`, `/admin/periods`, `/admin/settings`, `/finance/dashboard`, `/finance/payments`, `/selection/dashboard`, `/principal/dashboard`, `/principal/approvals`, `/documents`, `/announcements` |
| **Halaman fetch data asli tapi salah/rusak** | 2 halaman | `/staff/applicants` (field mismatch → kolom kosong), `/registration` (form tidak submit sama sekali) |
| **Tombol aksi mati** (tidak ada onClick/endpoint) | ≥15 tombol | Simpan Perubahan, Ganti Password, Nonaktifkan Akun, Tambah Pengguna, Tambah Periode, Simpan Pengaturan, Proses Seleksi, Setuju/Tolak (verifikasi & approval), Download PDF/Invoice, Export |
| **Endpoint API bocor data tanpa cek role** | 3 endpoint | `GET /api/users`, `GET /api/applicants`, `GET /api/verification` — bisa dipanggil APPLICANT sekalipun dan membocorkan seluruh data user/pendaftar lain |
| **Kerentanan keamanan kritis** | 1 endpoint | `POST /api/upload`: path traversal, tanpa batas ukuran/tipe file server-side, nama file bisa ditebak → dokumen pribadi (KTP/KK/akte) bisa diakses publik tanpa login |
| **Alur kerja inti yang sepenuhnya belum berfungsi** | 5 alur | Submit pendaftaran, pembayaran, verifikasi dokumen, verifikasi/approval staff & principal, reset password |

**Prioritas mendesak sebelum QC fungsional lanjut bisa bermakna:** lihat §7.

---

## 2. Prasyarat & Setup Lingkungan QC

### 2.1 Akun uji (dari `prisma/seed.ts`, password semua `password123`)

| Role | Email | Catatan data nyata |
|---|---|---|
| ADMIN | admin@beyondschool.sch.id | |
| STAFF | staff@beyondschool.sch.id | |
| FINANCE | finance@beyondschool.sch.id | |
| PRINCIPAL | principal@beyondschool.sch.id | |
| APPLICANT | ahmad@email.com | Registrasi `PPDB/2026/00001`, status **DRAFT**, program IPA, **belum ada Payment** |
| APPLICANT | siti@email.com | `PPDB/2026/00002`, status **SUBMITTED**, program IPS |
| APPLICANT | dewi@email.com | `PPDB/2026/00004`, status **COMPLETED**, stepCompleted=5, punya SelectionResult **PASSED** |
| APPLICANT | budi@email.com, rizky, dian, agus, rina, hendra, fitri | Lihat `prisma/seed.ts` untuk status/payment masing-masing (index genap = Payment PAID, ganjil = PENDING) |

Tidak ada akun **SUPER_ADMIN** ter-seed — buat manual via `PATCH /api/users/[id]` (login sebagai ADMIN, ubah salah satu akun) untuk menguji kapabilitas khusus SUPER_ADMIN.

### 2.2 Reset data antar sesi QC

Belum ada prosedur reset terdokumentasi. Sebelum tiap putaran QC besar: jalankan ulang `npm run db:seed` (akan `deleteMany` semua tabel lalu insert ulang — pastikan tidak ada uploaded file di `public/uploads` yang tertinggal orphan, karena upload tidak tercatat ke DB sama sekali saat ini).

### 2.3 Tools

- Browser + DevTools (Network tab wajib terbuka — banyak tombol yang "terlihat berhasil" padahal tidak mengirim request sama sekali).
- `curl` atau Postman untuk pengujian API langsung (bypass UI) — wajib untuk kasus negatif keamanan di §4.10.
- Dua sesi browser berbeda (atau satu normal + satu incognito) untuk kasus concurrent-session di §5.

---

## 3. Daftar Defect Terkonfirmasi (ranked by severity)

### 🔴 Kritis (keamanan / kebocoran data)

1. **Path traversal + upload tanpa batas di `POST /api/upload`** — field `type` dari client dipakai mentah untuk membentuk nama file sebelum `path.join`; bisa menulis file ke luar folder `uploads`. Tidak ada limit ukuran/tipe file di server (hanya client-side, mudah dilewati). File tersimpan di `public/uploads` yang publicly-served tanpa auth → **dokumen pribadi (KTP/KK/akte/pas foto) berpotensi diakses siapa saja** yang menebak pola nama file (`{type}-{epoch-ms}.{ext}`).
2. **`GET /api/users` tanpa cek auth/role** — user APPLICANT/STAFF/FINANCE/PRINCIPAL manapun bisa memanggil langsung dan mendapat seluruh daftar user (nama, email, role) termasuk akun admin.
3. **`GET /api/applicants` tanpa cek role** — APPLICANT bisa membaca data seluruh pendaftar lain (nama, email, program, status).
4. **`GET /api/verification` tanpa cek role** — sama seperti di atas, bocor ke role manapun yang sudah login.
5. **Cookie basi tidak benar-benar terhapus di produksi** — `middleware.ts` menghapus cookie `better-auth.session_token`, tapi di HTTPS/production nama cookie asli adalah `__Secure-better-auth.session_token`. Fix stale-cookie dari sesi sebelumnya **tidak bekerja di production**.

### 🟠 Tinggi (fungsionalitas inti tidak berfungsi)

6. **Seluruh alur tulis-data (write path) PPDB tidak berfungsi**: wizard `/registration` tidak mengirim data ke server sama sekali (kecuali file upload yang juga orphan); tidak ada `POST /api/registrations`, `/api/payments`, `/api/documents/:id/verify`, `/api/selection-results`. `registrationService`, `paymentService`, `documentService`, `selectionService`, `notificationService` ada tapi **tidak dipanggil dari mana pun**.
7. **`/profile` menampilkan data hardcode "Ahmad Fauzi"** untuk siapa pun yang login (laporan awal user, terkonfirmasi). Tombol Simpan Perubahan & Ganti Password tidak melakukan apa-apa. Tidak ada endpoint self-service profile update sama sekali.
8. **`/staff/applicants` fetch data asli tapi bentuk data tidak cocok** (laporan awal user, terkonfirmasi) — API mengembalikan `user.name`, `registration.status` (nested), tabel membaca `row.name`, `row.status` (flat) → kolom Nama/Program/Status/Tanggal kosong di semua baris, pencarian nama rusak total.
9. **Tombol Setuju/Tolak di `/staff/verification` dan `/principal/approvals` adalah dead button** — tidak ada `onClick`, tidak ada endpoint backend. Alur verifikasi & persetujuan akhir PPDB tidak bisa dijalankan sama sekali dari UI manapun.
10. **`/staff/applicants/[id]` mengabaikan parameter `id`** — selalu menampilkan persona statis "Ahmad Fauzi" untuk applicant ID apa pun, termasuk ID yang tidak ada di database (tidak ada 404 handling).
11. **`/forgot-password` dan `/reset-password` adalah stub palsu** (ada komentar `// TODO`) — selalu "berhasil" setelah delay 1 detik tanpa memverifikasi apa pun ke server. Reset password sungguhan tidak mungkin dilakukan.

### 🟡 Sedang (data salah/menyesatkan, tapi tidak memblokir alur)

12. Statistik di `/admin/dashboard`, `/finance/dashboard`, `/finance/payments`, `/selection/dashboard`, `/principal/dashboard` semuanya hardcode dan **jauh menyimpang dari data asli** (mis. "1.234 pendaftar" vs 10 asli; "Rp 185 Juta" vs ~Rp 2-4 juta asli) — bisa menyesatkan pengambilan keputusan manajemen.
13. `/dashboard`, `/status` menampilkan HeroBanner/ResultHeroCard nama "Ahmad Fauzi" untuk semua user, dan status yang saling kontradiktif dalam satu halaman yang sama (`/status`: ResultHeroCard bilang "pending", StatusBadge di bawahnya bilang "VERIFIED").
14. Login dengan tab role yang salah (mis. akun APPLICANT tapi pilih tab "Administrator") berhasil signin lalu **dipantulkan diam-diam** oleh middleware ke `/dashboard?error=unauthorized` — **tidak ada halaman yang membaca/menampilkan parameter `?error`**, user tidak tahu aksesnya ditolak.
15. `/announcements` didaftarkan sebagai `publicRoutes` di middleware, tapi file halamannya ada di grup `(dashboard)` yang dirender dengan `MainLayout` (sidebar+topbar aplikasi internal) — pengunjung anonim yang klik "Cek Pengumuman" dari landing page akan melihat shell dashboard aplikasi, bukan tampilan publik.
16. `/contact` terdaftar sebagai public route di middleware tapi **tidak punya halaman sama sekali** → selalu 404.
17. `register/page.tsx`: field "Nomor WhatsApp" dikumpulkan tapi **tidak pernah dikirim** ke server (dibuang begitu saja); password minimal 8 karakter tidak divalidasi di client (hanya placeholder teks).

### 🟢 Rendah (UX/robustness)

18. Tidak ada `loading` state yang benar-benar dipakai di hampir semua halaman yang fetch data (`/staff/applicants`, `/staff/verification`, `/admin/users`) — loading dan kosong terlihat identik.
19. Error API hanya `console.error` — user tidak pernah melihat pesan error saat fetch gagal (kecuali `/admin/users` yang pakai `alert()` untuk error PATCH).
20. `PATCH /api/users/[id]` mengembalikan 500 generik untuk ID tidak ditemukan (seharusnya 404), dan tidak ada guard mencegah SUPER_ADMIN menurunkan role dirinya sendiri (potensi self-lockout).
21. Tidak ada rate-limiting terlihat pada login/register/forgot-password.
22. Tidak ada header `Cache-Control: no-store` pada halaman terproteksi — risiko bfcache menampilkan konten sensitif sesaat setelah logout + tombol Back.

---

## 4. Rencana Pengujian per Modul

Setiap sub-bagian: **Kondisi saat ini** (ringkas) → **Kasus Positif** → **Kasus Negatif**. Semua ditulis agar bisa langsung dieksekusi oleh QA tanpa perlu baca kode.

### 4.1 Halaman Publik — `/`, `/info`, `/faq` *(belum diaudit kode secara mendalam — prioritaskan smoke test)*

**Positif:**
- Buka `/`, `/info`, `/faq` tanpa login → tampil lengkap (hero carousel, kartu jenjang/jalur, timeline, FAQ accordion, footer) tanpa error console.
- Klik semua CTA di landing page ("Daftar Sekarang", "Cek Pengumuman", link footer) → mengarah ke route yang benar dan tidak 404.
- FAQ accordion bisa dibuka/tutup dengan benar.

**Negatif:**
- Akses `/contact` (didaftarkan "public" di middleware tapi tidak ada halamannya) → catat sebagai bug jika bukan 404 yang disengaja.
- Akses `/announcements` tanpa login dari incognito → **verifikasi apakah muncul shell dashboard internal** (sidebar/topbar dengan menu "Profil Saya"/"Keluar") alih-alih tampilan publik biasa — catat sebagai bug prioritas tinggi jika benar terjadi.
- Akses URL acak (mis. `/asdf123`) → pastikan halaman 404 (`not-found.tsx`) tampil wajar, tidak crash.

### 4.2 Autentikasi

**Login (`/login`) — Positif:**
- Login Calon Siswa dengan email+password benar → redirect `/dashboard`.
- Login Administrator dengan akun ber-role ADMIN/SUPER_ADMIN asli → redirect `/admin/dashboard`.
- Centang "Ingat saya" → sesi tetap ada setelah browser ditutup-buka lagi.
- Toggle show/hide password berfungsi.

**Login — Negatif:**
- Login `ahmad@email.com` (APPLICANT asli) dengan tab **"Administrator"** dipilih + password benar → signin berhasil, sempat diarahkan ke `/admin/dashboard`, lalu middleware memantulkan ke `/dashboard?error=unauthorized` **tanpa notifikasi apa pun** — catat sebagai bug UX (silent failure).
- Password salah → pesan error tampil (catat jika bahasa Inggris, tidak konsisten dengan UI Indonesia).
- Field kosong → diblokir HTML `required` saja.
- Input NISN (bukan email) di tab Calon Siswa → selalu gagal (backend tidak pernah lookup by NISN).
- Input XSS/SQL injection pada field identity/password → harus gagal aman, tidak ada script ter-eksekusi.
- User yang sudah login membuka `/login` manual → redirect ke `/dashboard`.
- Double-click cepat tombol Masuk → tidak boleh mengirim request ganda.

**Register (`/register`) — Positif:**
- Daftar dengan semua field valid (password ≥8 karakter) → akun dibuat dengan role APPLICANT (verifikasi via login admin → `/admin/users`), redirect ke `/login`.

**Register — Negatif:**
- Password < 8 karakter dengan konfirmasi identik → **lolos validasi client** (tidak ada pengecekan panjang) — verifikasi apakah server (better-auth) benar-benar menolak.
- Password ≠ konfirmasi → pesan error tampil, tidak ada request terkirim.
- Daftar lalu cek DB: field **"Nomor WhatsApp" harus TIDAK tersimpan** (bug terkonfirmasi — datanya dibuang sebelum sampai API).
- Email sudah terdaftar → pesan error (kemungkinan bahasa Inggris, catat).
- Input XSS pada field Nama → aman dari render di client, tapi cek jika dipakai di email lain tanpa escaping.

**Forgot/Reset Password (`/forgot-password`, `/reset-password`) — semua kasus berikut membuktikan fitur TIDAK berfungsi:**
- Isi email apa saja (terdaftar atau tidak) di `/forgot-password` → selalu "berhasil" setelah 1 detik, **tidak ada email sungguhan terkirim**.
- Akses `/reset-password?token=apa-saja-tidak-kosong` (termasuk token palsu/kadaluarsa) → form tetap tampil dan "berhasil" diproses tanpa verifikasi token ke server — **catat sebagai bug kritis** begitu fitur ini diimplementasikan sungguhan.
- Isi password baru ≠ konfirmasi di reset-password → **tidak ada pengecekan**, tetap "berhasil".
- Akses `/reset-password` tanpa parameter `token` → satu-satunya validasi nyata di flow ini, harus tampil "Tautan reset tidak valid".

### 4.3 Applicant / Calon Siswa

**`/dashboard` — Negatif (prioritas tinggi, ini akar laporan user):**
- Login sebagai `siti@email.com`, `dewi@email.com`, atau akun lain selain Ahmad → HeroBanner **harus** menampilkan nama akun yang login, StatCard status/berkas/pembayaran **harus** mencerminkan data asli (Registration.status, Document count, Payment.status) — saat ini SEMUA akun melihat "Ahmad Fauzi" dan status "Draf"/"0/5"/"Belum" yang sama persis.
- Buka `/dashboard?error=unauthorized` (hasil redirect middleware) → **tidak ada notifikasi apa pun muncul** — catat sebagai gap UX.
- Applicant baru tanpa record Registration sama sekali → harus tampil empty-state ajakan mulai daftar, bukan angka "0/5" yang menyiratkan progres palsu.

**`/profile` — Negatif (laporan awal user, prioritas tertinggi):**
- Login sebagai `siti@email.com` → field Nama/Email **harus** "Siti Nurhaliza"/"siti@email.com", **BUKAN** "Ahmad Fauzi"/"ahmad@email.com" yang selalu tampil saat ini.
- Ubah Nama Lengkap, klik "Simpan Perubahan", reload halaman → perubahan **hilang total** (tombol tidak memanggil API apa pun) — bug kritis fungsi utama halaman.
- Isi password baru & konfirmasi berbeda, klik "Ganti Password" → **tidak ada validasi maupun request terkirim**.
- Toggle preferensi notifikasi, reload → kembali ke default (tidak tersimpan).
- Klik "Nonaktifkan Akun" → konfirmasi di dialog → **tidak ada efek nyata** (fake delay 800ms, akun tetap aktif, tidak logout).

**`/registration` (wizard 5 langkah) — Negatif (fitur inti tidak berfungsi):**
- Isi semua field Step 1-4 dengan data apa pun (termasuk kosong semua) → **wizard tetap bisa lanjut tanpa validasi apa pun** — tidak ada field yang benar-benar required secara fungsional.
- Selesaikan wizard sampai submit → cek database: **tidak ada Registration/RegistrationStep baru tercipta** — ID Pendaftaran yang ditampilkan di layar sukses adalah string statis `REG-2026-00892`, sama untuk semua orang.
- Refresh browser di tengah pengisian → **seluruh progress hilang** (state lokal saja, tidak ada auto-save).
- Upload dokumen di Step 5 → file benar-benar terkirim ke `/api/upload` dan tersimpan di disk, **TAPI tidak pernah tercatat sebagai Document di database** (orphan file, tidak terhubung ke registrationId manapun karena Registration itu sendiri tidak pernah dibuat).
- Submit tanpa upload dokumen wajib sama sekali → tetap lolos ke layar "Berhasil".

**`/documents` — Negatif:**
- Daftar dokumen & status yang tampil ("Akte Kelahiran: Valid", dst.) **sama persis untuk semua user** — tidak berasal dari data pengguna yang login.
- "Upload" dokumen baru → animasi loading 1.2 detik lalu selalu "berhasil" tanpa benar-benar mengirim file ke server (berbeda dari upload di wizard registrasi yang memang mengirim ke `/api/upload`).
- Reload halaman setelah "upload" → kembali ke data hardcode awal, upload yang "berhasil" tadi hilang total.
- Hapus dokumen berstatus "Valid" (sudah diverifikasi) → seharusnya diblokir/perlu konfirmasi khusus, saat ini semudah menghapus dokumen pending.

**`/payment` — Negatif:**
- Rincian tagihan ("Biaya Kegiatan Rp750.000") **tidak cocok** dengan `PaymentType` asli di database (yang benar: Rp500.000) — dan tidak menampilkan tipe biaya lain yang memang ada (Buku Pelajaran, dll).
- 3 nomor Virtual Account yang ditampilkan adalah angka fiktif **identik untuk semua user** — bukan VA asli per pembayaran.
- Login sebagai user yang `Payment.status = PAID` di seed → halaman **tetap** menampilkan form "pilih metode pembayaran" seolah belum bayar — tidak ada state "sudah lunas".
- Klik "Download Invoice" → tidak melakukan apa-apa (dead button, tidak ada href/onClick).

**`/status` — Negatif:**
- Login sebagai `ahmad@email.com` (status asli: DRAFT, belum submit) → halaman menampilkan status **"VERIFIED"** dan Timeline "Verifikasi Berkas: selesai" yang sama sekali salah untuk kondisi Ahmad yang sebenarnya.
- Perhatikan **inkonsistensi internal**: ResultHeroCard di atas bilang status "pending", StatusBadge beberapa baris di bawahnya bilang "VERIFIED" — dua sumber kebenaran yang berbeda di halaman yang sama.
- No. Registrasi & Program yang tampil ("PPDB/2026/00001", "IPA") kebetulan cocok untuk Ahmad tapi akan salah total untuk user lain (mis. Siti seharusnya "PPDB/2026/00002").

**`/announcements` — Negatif:**
- Daftar pengumuman (4 item tetap) **sama untuk semua orang selamanya** — tidak ada model Announcement di database sama sekali, tidak mungkin admin menambah pengumuman baru.

### 4.4 Staff

**`/staff/applicants` — Negatif (laporan awal user, terkonfirmasi):**
- Buka halaman → kolom **Nama, Program, Status, Tanggal Daftar tampil KOSONG di semua 10 baris** (hanya No. Registrasi yang benar) — bug bentuk data API vs kolom tabel.
- Cari nama pendaftar (mis. "Ahmad") di kotak pencarian → **tidak ditemukan** meski datanya ada di DB (pencarian nama rusak karena field selalu `undefined`).
- Klik salah satu baris → **tidak ada navigasi** ke halaman detail (hanya `console.log`).
- Klik "Export" atau "Tambah" → dead button.

**`/staff/applicants/[id]` — Negatif:**
- Buka dengan ID pendaftar Siti Nurhaliza yang asli → **tetap menampilkan data "Ahmad Fauzi"** yang sama seperti ID manapun (parameter `id` diabaikan total).
- Buka dengan ID yang tidak ada di database → tetap render persona palsu dengan status 200, **tidak ada 404 handling**.
- Klik tombol "Verifikasi"/"Catatan" → dead button.

**`/staff/verification` — Negatif (bug kritis alur kerja):**
- Halaman menampilkan data ASLI dengan benar (hanya SUBMITTED/COMPLETED yang muncul) — ini yang bekerja.
- Klik tombol **"Setuju" atau "Tolak"** pada baris manapun → **tidak ada request network, tidak ada perubahan status, tidak ada feedback apa pun** — silent no-op total. Ini memblokir seluruh alur verifikasi staff.

### 4.5 Admin

**`/admin/dashboard`, `/admin/periods`, `/admin/settings` — Negatif:**
- Bandingkan semua angka statistik dengan data asli di database → **semuanya jauh menyimpang** (1.234 vs 10 pendaftar asli, dst. — lihat §3 poin 12).
- Klik "Tambah Periode", "Simpan Pengaturan", "Simpan Template" → semua dead button, tidak ada perubahan tersimpan setelah reload.
- Ubah "Tahun Ajaran Aktif" di Settings → tidak berpengaruh ke `AcademicPeriod.isActive` di DB (Select tidak terhubung ke apa pun).

**`/admin/users` — Positif (referensi implementasi yang benar):**
- SUPER_ADMIN mengubah role user APPLICANT → STAFF via dropdown → berhasil, tersimpan.
- ADMIN (bukan super) mengubah role APPLICANT → FINANCE → berhasil (non-elevated).
- Pencarian nama/email berfungsi dengan benar.

**`/admin/users` — Negatif:**
- Klik "Tambah Pengguna" → dead button.
- Sebagai ADMIN (bukan SUPER_ADMIN), panggil langsung `PATCH /api/users/{id}` dengan `{"role":"SUPER_ADMIN"}` via curl/devtools (bypass dropdown UI) → **harus tetap ditolak 403** (verifikasi proteksi server-side, bukan cuma UI).
- PATCH ke user ID yang tidak ada → saat ini 500 generik, idealnya 404.
- Uji SUPER_ADMIN mengubah role dirinya sendiri menjadi APPLICANT → **tidak ada guard** — verifikasi apakah ini bisa mengunci akses SUPER_ADMIN terakhir (keputusan produk diperlukan).
- Matikan koneksi DB / simulasikan API 500 → tabel hanya tampil "Tidak ada data ditemukan" tanpa indikasi error ke admin.

### 4.6 Finance

**`/finance/dashboard`, `/finance/payments` — Negatif:**
- Semua angka statistik hardcode, jauh dari data Payment asli (8 baris seed, max Rp4 juta vs tampilan Rp185 juta/823 transaksi).
- `/finance/payments`: 10 baris tabel + status "WAITING_PAYMENT"/"EXPIRED" yang **tidak ada satupun di data seed asli** (seed hanya PAID/PENDING).
- Tidak ada tombol/aksi untuk memverifikasi pembayaran PENDING → `paymentService.verify()` ada tapi tidak pernah dipanggil dari mana pun.

### 4.7 Principal

**`/principal/dashboard`, `/principal/approvals` — Negatif:**
- Statistik hardcode (angka 1.234/890/185Jt **sama persis copy-paste** dari halaman admin/finance/selection — bukti mockup belum diganti per-role).
- `/principal/approvals`: status "PENDING_APPROVAL" pada data hardcode **tidak ada di enum SelectionStatus manapun** di skema Prisma — akan tampil badge abu-abu tak dikenal jika ini pernah jadi data asli.
- Klik "Detail"/"Setujui"/"Tolak" → semua dead button — **alur persetujuan akhir PPDB oleh kepala sekolah tidak bisa dijalankan sama sekali**.

### 4.8 Selection

**`/selection/dashboard` — Negatif:**
- Angka breakdown per program (500/400/200) tidak cocok kuota asli (120/90/60).
- Klik "Proses Seleksi" → dead button.
- Saat ini di DB hanya ada 4 SelectionResult, semuanya "PASSED" (0 WAITLIST, 0 REJECTED) — kontradiksi dengan tampilan hardcode "Cadangan 200 / Tidak Lulus 144".

### 4.9 Reports

**`/reports` — Negatif:**
- Klik salah satu dari 4 tombol "Download PDF"/"Download" → dead button; **tidak ada library PDF/Excel apa pun terpasang** di proyek, fitur ini belum punya kapabilitas backend sama sekali, bukan cuma UI yang belum tersambung.
- Perhatikan: role **FINANCE tidak diberi akses** ke `/reports` meski ada tab "Keuangan" di dalamnya — konfirmasi apakah ini bug atau keputusan bisnis yang disengaja.

### 4.10 Pengujian Langsung API (bypass UI, wajib pakai curl/Postman)

| Endpoint | Kasus Negatif |
|---|---|
| `GET /api/users` | Login sebagai APPLICANT biasa, panggil endpoint ini langsung → **saat ini 200 dengan seluruh data user termasuk admin** (harus 403) |
| `GET /api/applicants` | Sama seperti di atas — APPLICANT bisa baca data pendaftar lain (harus 403) |
| `GET /api/verification` | Sama seperti di atas (harus 403) |
| `PATCH /api/users/[id]` | Body `{"role":"HACKER"}` → harus 400. Tanpa sesi → harus 401. Role STAFF/FINANCE/PRINCIPAL/APPLICANT → harus 403 (verifikasi ini sudah benar, jangan sampai regresi) |
| `POST /api/upload` | File 100MB via curl (lewati batas client 5MB) → **saat ini diterima 200**, harus ditolak. File `.html`/`.svg` berisi `<script>` → **saat ini tersimpan dan bisa diakses publik** di `/uploads/...` tanpa login — buktikan stored-XSS/PII-leak. Field `type` berisi `../../../` → cek apakah file tertulis di luar folder `uploads` (path traversal) |
| `POST /api/auth/sign-up/email` | Body dengan `role: "ADMIN"` disisipkan → harus tetap dibuat sebagai APPLICANT (proteksi `input:false` sudah ada, verifikasi tidak regresi) |

### 4.11 Matriks Middleware / Role (regresi — sudah diverifikasi benar sebelumnya, uji ulang tiap rilis)

| Role | Boleh akses | Harus ditolak (→ `/dashboard?error=unauthorized`) |
|---|---|---|
| APPLICANT | `/dashboard`, `/profile`, `/registration`, `/documents`, `/payment`, `/status` | `/admin/*`, `/staff/*`, `/finance/*`, `/principal/*`, `/selection/*`, `/reports` |
| STAFF | + `/staff/*`, `/selection/*` | `/admin/*`, `/finance/*`, `/principal/*`, `/reports` |
| FINANCE | + `/finance/*` | `/admin/*`, `/staff/*`, `/principal/*`, `/selection/*`, `/reports` ⚠️ *(cek §3 poin bisnis)* |
| PRINCIPAL | + `/principal/*`, `/reports` | `/admin/*`, `/staff/*`, `/finance/*`, `/selection/*` |
| ADMIN / SUPER_ADMIN | Semua rute di atas | — |
| Tanpa sesi | `/`, `/info`, `/faq`, `/announcements` *(lihat catatan §3 poin 15)*, `/login`, `/register` | Semua rute lain → redirect `/login?callbackUrl=...` |

---

## 5. Pengujian Lintas-Fitur

1. **Perubahan role saat sesi korban masih aktif**: Login sebagai user role X di Browser A. Sebagai SUPER_ADMIN di Browser B, ubah role user tsb (atau nonaktifkan). Tanpa logout di Browser A, refresh halaman → middleware membaca role dari DB tiap request (tidak ada cookie cache), jadi akses **harus langsung berubah** tanpa perlu re-login. Verifikasi ini benar-benar terjadi.
2. **Tombol Back setelah logout**: Login → buka halaman dashboard apa saja → logout → tekan Back di browser → pastikan tidak ada konten sensitif dari bfcache yang sempat terlihat sebelum redirect.
3. **Responsive/mobile**: Uji semua halaman dashboard/staff/admin/finance/principal di viewport 375px dan 768px — sidebar memakai `fixed` + `pl-sidebar` tanpa toggle mobile terlihat; verifikasi apakah sidebar menutupi konten atau ada mekanisme collapse.
4. **Dua akun login bersamaan** (2 browser berbeda) — pastikan data yang tampil di masing-masing dashboard **berbeda** sesuai akun masing-masing (saat ini pasti identik karena hardcode — akan otomatis ter-fix begitu §7 dikerjakan, tapi jadikan kriteria lulus).
5. **Reset seed antar sesi QC** — jalankan `npm run db:seed` di antara dua putaran pengujian, pastikan tidak ada error constraint dan state kembali deterministik.

---

## 6. Urutan Eksekusi

Karena sebagian besar fitur belum tersambung ke backend, banyak kasus negatif di atas **tidak bisa benar-benar "gagal" secara realistis** — mereka gagal karena fiturnya memang belum ada, bukan karena ditemukan bug logika. Disarankan urutan:

1. **Fase 0 — Keamanan (§3 kategori 🔴)**: uji & laporkan sebagai bug/incident terpisah dari QC fungsional biasa; ini butuh perbaikan segera terlepas dari roadmap fitur.
2. **Fase 1 — Regresi apa yang SUDAH benar**: `/admin/users` (role management), matriks middleware (§4.11), auth dasar (login/register happy path), upload file dasar (tanpa kasus abuse) — pastikan pekerjaan sebelumnya tidak regresi saat fitur baru ditambahkan.
3. **Fase 2 — Setelah backend disambungkan** (di luar cakupan QC, perlu development): jalankan ulang seluruh kasus positif di §4.3-4.9 yang saat ini gagal karena "belum ada backend", sebagai acceptance test fitur baru.
4. **Fase 3 — Regresi penuh + lintas-fitur (§5)** sebelum rilis ke produksi.

---

## 7. Rekomendasi Prioritas Perbaikan (agar QC lanjutan bermakna)

1. Tutup 3 kebocoran API (`/api/users`, `/api/applicants`, `/api/verification`) — tambahkan cek role, pola sudah ada di `PATCH /api/users/[id]` sebagai contoh.
2. Perbaiki `/api/upload`: validasi ukuran & tipe file di server, sanitasi/hilangkan penggunaan input client untuk membentuk path file, ganti nama file dengan UUID acak, dan **hubungkan hasil upload ke `documentService.create()`**.
3. Sambungkan `/profile` ke sesi nyata (baca + endpoint PATCH self-service baru).
4. Perbaiki bentuk data `/staff/applicants` agar cocok dengan kolom tabel (flatten response atau ubah accessor kolom).
5. Sambungkan tombol Setuju/Tolak di `/staff/verification` dan `/principal/approvals` ke `registrationService`/`selectionService` yang sudah ada.
6. Sambungkan wizard `/registration` ke backend (buat `POST /api/registrations` + panggil dari tiap step).
7. Setelah 1-6, baru lanjutkan mengganti seluruh angka statistik hardcode di dashboard admin/finance/principal/selection dengan query agregat asli.

**Why:** User melaporkan dua bug spesifik ("Profil Saya" salah, "data pendaftar" tidak sesuai) dan meminta rencana QC menyeluruh dari kasus positif sampai negatif. Audit paralel (Workflow, 6 modul + 1 completeness critic) mengonfirmasi kedua laporan tersebut secara tepat DAN menemukan pola yang sama meluas ke hampir seluruh aplikasi, plus kerentanan keamanan yang lebih mendesak.
