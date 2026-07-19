import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <div className="font-mono text-sm font-medium tracking-widest text-brass-600">404</div>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900">Halaman tidak ditemukan</h1>
      <p className="mt-3 text-ink-600">
        Halaman yang Anda cari tidak tersedia, atau mungkin telah dipindahkan.
        Coba telusuri regulasi melalui pencarian.
      </p>
      <Link
        to="/"
        className="mt-7 flex items-center gap-2 rounded-md bg-ink-900 px-5 py-3 text-sm font-semibold text-white hover:bg-ink-800"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
      </Link>
    </div>
  );
}
