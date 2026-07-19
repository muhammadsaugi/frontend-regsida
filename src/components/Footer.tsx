export default function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-ink-900 text-ink-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="inline-block rounded-xl bg-white px-3 py-2 shadow-sm">
              <img 
                src="/logoregsida.png" 
                alt="Logo REGSIDA Kabupaten Sidoarjo" 
                className="h-7 w-auto object-contain"
              />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-400">
              Regulasi Daerah Satu Data &amp; AI Navigator — prototipe untuk Pemerintah Kabupaten Sidoarjo.
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest2 text-ink-500">Portal Warga</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="/cari" className="hover:text-white">Cari Regulasi</a></li>
              <li><a href="/tanya" className="hover:text-white">Tanya REGS (AI)</a></li>
              <li><a href="/verifikasi" className="hover:text-white">Verifikasi Klaim Petugas</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest2 text-ink-500">Portal ASN</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="/admin" className="hover:text-white">Dasbor Bagian Hukum</a></li>
              <li><a href="/admin/graf" className="hover:text-white">Conflict Graph Engine</a></li>
              <li><a href="/admin/decay" className="hover:text-white">Regulatory Decay Tracker</a></li>
              <li><a href="/admin/inspektorat" className="hover:text-white">Dasbor Inspektorat</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest2 text-ink-500">Tentang Prototipe</div>
            <p className="mt-3 text-sm leading-relaxed text-ink-400">
              Dibangun untuk Kompetisi KMIPN VIII 2026 — Kategori E-Government.
              Data regulasi pada prototipe ini disusun merujuk nomenklatur resmi
              produk hukum Kabupaten Sidoarjo untuk keperluan demonstrasi.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Prototipe REGSIDA — Tidak terafiliasi resmi dengan Pemerintah Kabupaten Sidoarjo.</span>
          <span>Inovasi Informatika Vokasional untuk Transformasi Digital Berkelanjutan</span>
        </div>
      </div>
    </footer>
  );
}
