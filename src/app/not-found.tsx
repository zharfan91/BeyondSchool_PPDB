import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-display text-primary mb-4">404</h1>
        <p className="text-body-lg text-muted-foreground mb-8">
          Halaman yang Anda cari tidak ditemukan.
        </p>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-soft-drop transition-colors hover:bg-primary-hover"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
