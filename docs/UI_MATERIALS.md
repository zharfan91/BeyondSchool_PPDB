# UI Materials Catalog — BeyondSchool PPDB

> Extracted from all 12 HTML mockups in `../desain/*/code.html` (dashboard_calon_siswa, landing_page_ppdb_online, halaman_login_ppdb_online, form_pendaftaran_ppdb, profil_calon_siswa, pengumuman_terbaru, pengaturan_akun, pusat_bantuan_faq, status_seleksi_siswa, pendaftaran_berhasil, halaman_upload_dokumen, halaman_status_pembayaran).
>
> Purpose: translate the mockups' Material-3-style Tailwind markup into **this project's actual** design tokens (`tailwind.config.ts`, `src/app/globals.css`) and component set (`src/components/**`), so remaining pages can be built by reference instead of re-deriving styles from scratch.
>
> Status legend: ✅ built · ⚠️ partial (exists but missing states/variants) · ❌ not built yet

---

## 1. Key findings before using this catalog

1. **Design tokens are already reconciled.** Every mockup's inline Tailwind config has drifted/inconsistent tokens (a `primary-container` that isn't a tint of primary, an undefined `primary-hover`, duplicate `info`/`primary-container` hex, etc.). **Ignore those — `tailwind.config.ts` in this repo already has the corrected, consistent version** (`primary.DEFAULT #004ac6`, `primary.hover #1d4ed8`, `primary.container #2563eb`, full `success/warning/danger/info` scale, all `surface-container-*` steps). Copy component *structure*, not the mockups' color literals.
2. **Icon library mismatch.** All 12 mockups use Google **Material Symbols Outlined** (`<span class="material-symbols-outlined">name</span>`), but this project uses **`lucide-react`** (confirmed in `src/components/layout/sidebar.tsx`). Every icon reference below is given as `material_symbol_name → LucideName`. See §3 for the full mapping table.
3. **Spacing/typography scale mismatch.** Mockups use a custom named scale (`p-lg`, `text-h2 font-h2`, etc.) not present in this repo's Tailwind config. See §2 for the conversion table — use plain numeric Tailwind spacing and the existing `fontSize` keys (`display`, `headline-lg`, `headline-md`, `body-lg`, `body-md`, `label-md`).
4. **Layout shells are consistent** across all authenticated pages: fixed 260px sidebar (`w-sidebar`) + 72px sticky topbar (`h-navbar`) + breadcrumb/avatar header — already implemented in `main-layout.tsx` / `sidebar.tsx` / `topbar.tsx`. Public pages (landing, login, FAQ, success) use a lighter shared header+footer shell instead (`public-layout.tsx`).
5. **Gaps present in every mockup, not just missing components:** no error/invalid input state anywhere, no loading/disabled button states, no confirmation modal before destructive actions (Danger Zone), no upload-in-progress state, no pagination/empty states on lists. These need to be *designed fresh*, not copied — flagged inline below as "⚠️ not in source, design needed."

---

## 2. Spacing & Typography Conversion

| Mockup token | Value | Use in this project |
|---|---|---|
| `p/m/gap-xs` | 4px | `p/m/gap-1` |
| `p/m/gap-sm` | 8px | `p/m/gap-2` |
| `p/m/gap-md` | 16px | `p/m/gap-4` |
| `p/m/gap-lg` | 24px | `p/m/gap-6` |
| `p/m/gap-xl` | 32px | `p/m/gap-8` |
| `p/m/gap-xxl` | 48px | `p/m/gap-12` |
| `p/m/gap-huge` | 64px | `p/m/gap-16` |
| `navbar-height` | 72px | `h-navbar` (already defined) |
| `sidebar-width` | 260px | `w-sidebar` (already defined) |

| Mockup token | ~Size/weight | Use in this project |
|---|---|---|
| `text-h1 font-h1` | 36/700 | `text-display` |
| `text-h2 font-h2` | 30/600 | `text-headline-lg` (28px, closest) or `text-3xl font-semibold` |
| `text-h3 font-h3` | 24/600 | `text-2xl font-semibold` (no exact token — consider adding `headline-sm` if this recurs a lot) |
| `text-h4 font-h4` | 20/500 | `text-headline-md` |
| `text-body-lg font-body-lg` | 16/400 | `text-body-lg` |
| `text-body-md font-body-md` | 14/400 | `text-body-md` |
| `text-label font-label` | 12/600, tracked | `text-label-md` |
| `text-small font-small` | 12/400 | `text-xs` |

| Mockup color role | Project class |
|---|---|
| `primary` | `bg-primary` / `text-primary` |
| `primary-hover` (hover state) | `hover:bg-primary-hover` |
| `primary-container` | `bg-primary-container` |
| `secondary-container` | `bg-secondary-container` (sidebar active bg) |
| `success` / `warning` / `danger` / `info` | `bg-success`, `bg-warning`, `bg-danger`, `bg-info` (+ `.bg`/`.border` light tint variants already defined for each) |
| `surface`, `surface-container(-low/-high/-highest/-lowest)` | identical names already defined |
| `outline`, `outline-variant` | identical names already defined |
| `on-surface`, `on-background`, `text-text-secondary` (M3-leftover naming in mockups) | `text-foreground` / `text-muted-foreground` respectively |
| `border` (mockup's flat gray) | `border-border` |

---

## 3. Icon Mapping (Material Symbols → lucide-react)

Every icon actually used across the 12 mockups:

| Material Symbol | lucide-react | Material Symbol | lucide-react |
|---|---|---|---|
| `dashboard` | `LayoutDashboard` | `how_to_reg` | `UserCheck` |
| `upload_file` / `cloud_upload` / `file_upload` | `UploadCloud` | `payments` | `Wallet` |
| `assignment_turned_in` / `fact_check` | `ClipboardCheck` | `campaign` | `Megaphone` |
| `person` | `User` | `family_restroom` | `Users` |
| `logout` | `LogOut` | `settings` | `Settings` |
| `help_outline` | `HelpCircle` | `chevron_right` | `ChevronRight` |
| `expand_more` | `ChevronDown` | `check_circle` | `CheckCircle2` |
| `check` | `Check` | `notifications` | `Bell` |
| `notifications_active` | `BellRing` | `search` | `Search` |
| `arrow_forward` | `ArrowRight` | `calendar_today` / `event_note` | `Calendar` / `CalendarClock` |
| `description` | `FileText` | `picture_as_pdf` | `FileText` |
| `image` | `Image` | `delete` | `Trash2` |
| `replay` / `refresh` | `RotateCcw` | `error` / `info` | `AlertCircle` / `Info` |
| `visibility` | `Eye` | `visibility_off` | `EyeOff` |
| `lock` | `Lock` | `content_copy` | `Copy` |
| `download` | `Download` | `send` | `Send` |
| `save` | `Save` | `add` | `Plus` |
| `remove` | `Minus` | `filter_list` | `SlidersHorizontal` |
| `menu` | `Menu` | `mail` / `alternate_email` | `Mail` |
| `call` | `Phone` | `location_on` | `MapPin` |
| `verified_user` | `ShieldCheck` | `school` | `GraduationCap` |
| `child_care` | `Baby` | `history_edu` | `BookOpen` |
| `architecture` | `Building2` | `engineering` | `Wrench` |
| `military_tech` | `Award` | `volunteer_activism` | `HandHeart` |
| `open_in_new` | `ExternalLink` | `app_registration` | `FilePenLine` |
| `task` | `ListChecks` | `done_all` | `CheckCheck` |
| `photo_camera` | `Camera` | `pending_actions` | `Clock` |
| `receipt_long` | `Receipt` | `support_agent` | `Headset` |
| `chat` | `MessageCircle` | `rocket_launch` | `Rocket` |
| `event_repeat` | `CalendarClock` | `stars` | `Star` |
| `priority_high` | `AlertTriangle` | `auto_stories` | `BookOpenCheck` |
| `social_leaderboard` | `Share2` | `local_post_office` | `Mail` |
| `account_balance_wallet` | `Wallet` | `event_available` | `CalendarCheck` |
| `assignment` | `FileText` | `badge` / `portrait` | `IdCard` |
| `workspace_premium` | `Award` |

---

## 4. Component Catalog

### A. Navigation & Shell

| Component | Seen in | States | Status |
|---|---|---|---|
| **SideNavBar** (260px, logo + nav list + active pill w/ right accent border + logout footer) | all authenticated pages (identical shell) | default / hover / active (`bg-secondary-container text-primary border-r-4 border-primary`) | ✅ `layout/sidebar.tsx` |
| **AppTopBar** (breadcrumb + user name/NISN + avatar, sticky) | all authenticated pages | static | ✅ `layout/topbar.tsx` |
| **Public TopNavBar** (logo, nav links, Masuk/Daftar buttons) | landing, login, faq, register-form, success | active link (bold + underline), hover | ✅ `layout/public-layout.tsx` (verify nav-active state exists) |
| **Mobile bottom tab bar** (4-icon grid, `md:hidden`) | pengumuman, status_seleksi | active (filled icon + `text-primary`) vs inactive | ❌ not built — needed if mobile nav is in scope |
| **Shared Footer** (brand + link row + copyright; landing page also has 4-col contact/map variant) | all pages | — | ⚠️ check `public-layout.tsx` footer covers both the simple and 4-column variant |
| **Breadcrumb** (`Beranda / Current Page`, `chevron_right` separator) | most authenticated pages | current-page item styled `text-primary font-semibold` | ✅ part of `page-header.tsx` — confirm chevron separator matches |

### B. Buttons & Tabs

| Component | Variants found | Status |
|---|---|---|
| **Button** | filled primary, outline/secondary, ghost/text, danger/destructive, icon-only circular, full-width, inverse (`bg-foreground text-background` on FAQ page) | ✅ `ui/button.tsx` — verify an `inverse` variant exists; not seen in current file list |
| **Segmented Pill Tabs** (raised active chip in a track — login role toggle, Ayah/Ibu/Wali switch) | active = `bg-surface shadow-sm text-primary`, inactive = plain + hover | ❌ not built — needed for `LoginCard` role toggle and parent-data form section |
| **Underline Tabs** (settings page: `border-b-2 border-primary` active) | active / inactive / hover | ✅ `ui/tabs.tsx` (shadcn base) — style to match underline look, no native content-switching shown in mockup so verify real tab panels are wired |
| **Carousel prev/next circular icon buttons** | hover only | ❌ not built — only needed if landing page "Jalur Pendaftaran" becomes an actual carousel (currently static grid in mockup) |

### C. Badges & Status

| Component | Variants | Status |
|---|---|---|
| **Badge / StatusBadge** (pill) | success/warning/danger/neutral, tint (`bg-success/10`) vs solid (`bg-danger` for high-severity "Rejected"), ribbon/corner variant (`absolute -top-3`, "Populer" tag) | ✅ `data/status-badge.tsx` — confirm both tint and solid variants + a `ribbon` layout option exist |
| **IconBadge/IconChip** (icon in `bg-{color}/10` rounded box, reused everywhere: stat cards, contact tiles, doc rows) | color-by-semantic (success/primary/warning/neutral) | ⚠️ likely inlined ad hoc in `stat-card.tsx` — worth extracting as its own small atom since it repeats in ~8 of the 12 mockups |
| **Dot separator** (`w-1 h-1 rounded-full`, used between metadata items instead of icon/pipe) | — | not a component, just a utility pattern — use inline |

### D. Cards

| Component | Seen in | Notes | Status |
|---|---|---|---|
| **StatCard / KPI card** | dashboard, landing info strip, profile stat tiles | icon chip + label + value + optional trend/progress bar; has a "highlighted" variant with colored border | ✅ `data/stat-card.tsx`, `data/kpi-card.tsx` |
| **Hero banner (dashboard welcome)** | dashboard_calon_siswa | colored bg, decorative blurred blob circles, status pill, 2 CTA buttons | ✅ `shared/hero-banner.tsx` |
| **Hero banner (public landing)** | landing_page_ppdb_online | announcement pill, headline, dual CTA, media card w/ gradient caption + carousel dots | ❌ not built — landing page (`(public)/page.tsx`) needs this |
| **Bento feature card** (Jenjang Pendidikan / Jalur Pendaftaran) | landing_page_ppdb_online | icon tile that inverts color on card hover (`group-hover:bg-primary`), key/value mini list, outline CTA; "featured" variant has a ribbon badge | ❌ not built — this is the `JenjangCard`/`JalurCard` gap noted previously |
| **Composite status/summary card** (3 variants: done/action-required/locked) | dashboard | icon chip + pill badge + title + description + variable footer (link, full-width CTA, or thin progress bar) | ✅ likely covered by `document-row-card.tsx` pattern — verify the 3 footer variants (link/CTA/progress) are all supported |
| **Promo/CTA solid card** (inverted bg-primary, white text, pill button) | pengumuman_terbaru ("Aktifkan Notifikasi") | — | ❌ not built |
| **Notice/Info callout** (tinted bg + icon + title + body, variants by color) | profil_calon_siswa, form_pendaftaran, pendaftaran_berhasil, halaman_upload_dokumen | info/success/warning/danger variants all use the same `bg-{c}/5 border-{c}/20` shell | ⚠️ check if `ui/alert` equivalent exists — not seen in component list, likely needs a small `Callout` component |
| **Danger Zone card** (destructive section) | pengaturan_akun | tinted error bg + destructive button; **mockup has no confirmation modal — add one** | ❌ not built — pair with `shared/confirm-dialog.tsx` (already exists) when built |
| **Result/Verdict hero card** (accepted/rejected/pending) | status_seleksi_siswa | mockup only shows the "accepted" state — rejected/pending states must be designed fresh (icon+badge+copy swap) | ❌ not built |
| **Contact channel tile** (icon circle + title + value, `group-hover:scale-110`) | pusat_bantuan_faq | success/info/primary color variants | ❌ not built |

### E. Forms & Inputs

| Component | States/variants found | Status |
|---|---|---|
| **Text Input** | default, focus ring, leading-icon variant, success/validated variant (`border-success` + inline check icon) — **no error state exists in any mockup, must design fresh** | ✅ `ui/input.tsx` — add error-state styling + success-state icon slot |
| **PasswordInput** (icon + trailing show/hide toggle) | mockup's toggle is visually present but **not functionally wired** — build real show/hide logic | ❌ not built |
| **Select** | native styled, no custom chevron | ✅ `ui/select.tsx` |
| **Radio group** | native, `text-primary` accent | ❌ no dedicated component seen — likely fine as plain HTML radios styled via Tailwind Forms-equivalent |
| **Checkbox** | plain (settings page) and chip-grid variant (bordered card per option, max-N-selection hint, extracurricular picker in registration form) | ❌ chip-grid variant not built |
| **Toggle Switch** | CSS-only `peer`/`after:` trick in mockup — **replace with shadcn/Radix `Switch`**; mockup explicitly suppresses focus ring (`peer-focus:outline-none`) — do NOT copy that, add a real focus ring for a11y | ❌ not built — no `switch.tsx` in component list |
| **Textarea** | default only | ✅ likely covered by `ui/input.tsx` pattern or needs `ui/textarea.tsx` — not seen in file list, confirm |
| **Read-only "locked value" field** (styled div resembling a selected input, e.g. system-determined "Gelombang") | form_pendaftaran_ppdb | distinct from `disabled` input — has icon + colored border | ❌ not built |
| **FormSectionCard** (icon + title + bottom divider header wrapping a field grid) | profil, form_pendaftaran, pengaturan_akun | repeats identically across every form page | ✅ `forms/form-section.tsx` |
| **Agreement checkbox with embedded link** | form_pendaftaran_ppdb | `group-hover` text color shift | not a component — inline pattern using existing Checkbox |

### F. Progress & Wayfinding

| Component | States | Status |
|---|---|---|
| **Horizontal Stepper** (registration progress) | complete (`bg-success` + check + colored connector) / active (`bg-primary` + ring glow) / inactive (neutral) | ✅ `forms/stepper.tsx` — verify all 3 states + connector-line color logic are implemented |
| **Vertical Timeline / Activity Log** (dot-on-line, absolutely positioned nodes) | completed / active(ring glow) / pending(dimmed, `opacity-40`) | ✅ `data/timeline.tsx`, `data/activity-log.tsx` — verify the "pending/future" dimmed state is supported, not just done/active |
| **Linear progress bar** (thin, `h-1.5`/`h-2`, track+fill) | width-driven | ✅ likely `ui/progress` equivalent — confirm exists (not explicitly in file list, may need `ui/progress.tsx`) |
| **Sidebar anchor-nav w/ mini progress %** (form_pendaftaran_ppdb sidebar shows "Progress: 15%" + thin bar) | — | ⚠️ specific to the registration form page — reuse Stepper progress value + Sidebar together |

### G. Data Display

| Component | Variants | Status |
|---|---|---|
| **DataTable** (sticky header, hover rows, status badges in cells, icon-button row actions) | seen in halaman_upload_dokumen (doc list) and halaman_status_pembayaran (transaction history) | ✅ `data/data-table.tsx` — confirm it composes with `StatusBadge` + icon action buttons cleanly |
| **Document Upload Card** (4 states: uploaded / pending-empty / rejected-with-reason / no-file) | form_pendaftaran_ppdb, halaman_upload_dokumen | rejected state has inline reason callout + reupload CTA; **no "uploading/in-progress" state exists anywhere — must design fresh** | ✅ `data/document-row-card.tsx` — verify all 4 terminal states + confirm an "uploading" state is added since it's a genuine gap |
| **Document/File tile grid** (square aspect-ratio tiles, icon-by-filetype + filename) | dashboard_calon_siswa | hover border→primary | ❌ not built — distinct from the row-based DocumentUploadCard |
| **Verification legend** (static icon+text glossary explaining status colors) | halaman_upload_dokumen | — | ❌ not built — small, cheap to add |
| **Announcement/News card** (3 shape variants: featured/large-image, compact-grid, horizontal-row) | pengumuman_terbaru | one logical entity, 3 renderings — model as one component with a `variant` prop | ✅ `shared/announcement-panel.tsx` — confirm all 3 variants are supported, not just one |
| **Agenda/Timeline widget** (compact vertical timeline sidebar widget, distinct from full Activity Log) | pengumuman_terbaru | emphasized "next" item vs default items | ⚠️ can likely reuse `data/timeline.tsx` in compact mode |
| **Date chip** (calendar-style day/month box) | dashboard announcements | — | ❌ small atom, not built |
| **Payment Method selector card** (radio-card list, selected = 2px primary border + check icon) | halaman_status_pembayaran | selected / unselected / hover | ❌ not built |
| **Virtual Account display** (large tracked-out number + copy button) | halaman_status_pembayaran | — | ❌ not built |
| **ID/Reference display + copy** (label + bold value + copy-to-clipboard button) | pendaftaran_berhasil | generalizable to VA number, registration ID, invoice number | ❌ not built — build once, reuse for both success page and payment page |
| **Fee breakdown / invoice line items** (dashed dividers between rows, undashed emphasized total) | halaman_status_pembayaran | — | ❌ not built |

### H. Feedback & Overlays

| Component | Notes | Status |
|---|---|---|
| **FAQ Accordion** | mockup uses native `<details>/<summary>` with CSS-only chevron rotation — **port to shadcn/Radix `Accordion`** for consistent height animation and a11y; preserve "first item open by default" | ❌ not built — no `accordion.tsx` in component list |
| **SuccessConfirmationCard** (icon badge + heading + ID display + copy + dual next-step CTAs + inline notice) | pendaftaran_berhasil | whole card is a strong single-component candidate | ❌ not built |
| **Trust badge row** (grayscale → hover:grayscale-0 reveal, divided by `|`) | halaman_login | odd hover-reveal on a `cursor-default` static row — keep or drop is a product call | ❌ not built, low priority |
| **ConfirmDialog** | for Danger Zone / destructive actions (missing from every mockup that needs it) | ✅ `shared/confirm-dialog.tsx` already exists — wire it into Danger Zone / delete-document flows |
| **EmptyState** | not present in any mockup (announcements/news feed has no empty variant shown) | ✅ `data/empty-state.tsx` exists — use proactively even where the mockup doesn't show one |
| **LoadingState** | no loading/skeleton shown in any mockup | ✅ `shared/loading-state.tsx`, `ui/skeleton.tsx` exist — apply proactively |

### I. Decorative / Layout Patterns (not components, but recurring conventions)

- **Ambient blurred blob backgrounds** (`absolute ... blur-3xl rounded-full`, low-opacity brand color) — used on hero banner, login page, success page. Keep as a plain utility pattern, not a component.
- **Bento asymmetric grids** (`col-span-2` + `col-span-1` mixes) — page-level composition choice, appears on dashboard, landing, pengumuman, status_seleksi, halaman_status_pembayaran. No component needed, just document the column-span recipe per page when building it.
- **Carousel dots** (static, non-interactive pills) — only meaningful if an actual carousel is implemented; otherwise skip.

---

## 5. Priority suggestion for next build pass

Based on what's ❌ missing and how many pages depend on it:

1. **High reuse, blocks multiple pages:** IconBadge/IconChip atom, Callout/Notice component, Segmented Pill Tabs, PasswordInput, Toggle Switch (shadcn `Switch`), Accordion (shadcn).
2. **Needed for specific unbuilt pages:** Landing page hero + JenjangCard/JalurCard (public landing), Payment Method card + VA display + fee breakdown (payment page), SuccessConfirmationCard (registration success), Result/Verdict hero card (selection status), Danger Zone card (account settings).
3. **Small/cheap, do alongside the above:** Date chip, Document file-tile grid, Verification legend, Contact channel tile.
4. **Gaps to design fresh (not in any mockup) before or during implementation:** input error state, button loading/disabled states, upload-in-progress state, confirmation modal for destructive actions, mobile bottom nav (if mobile is in scope), empty states for lists.

See the companion visual reference: `docs/ui-materials-styleguide.html` (open directly in a browser) for a rendered look at the higher-priority components using this project's actual tokens.
