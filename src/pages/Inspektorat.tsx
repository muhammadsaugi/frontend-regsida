import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, MapPin, AlertTriangle } from "lucide-react";
import { Badge } from "../components/ui";
import { fetchPungliHeatmap, fetchClaimHistory } from "../lib/admin-api";
import { mapClaimToPungliReport, mapHeatmapRow } from "../lib/adapters";
import { getErrorMessage } from "../lib/api";
import { PungliReport } from "../data/types";

const hasilColor: Record<string, string> = {
  tidak_ditemukan: "bg-sirah-100 text-sirah-700 border-sirah-200",
  ditemukan_sesuai: "bg-sawo-100 text-sawo-700 border-sawo-200",
  ditemukan_berbeda: "bg-brass-100 text-brass-700 border-brass-200",
};
const hasilLabel: Record<string, string> = {
  tidak_ditemukan: "Tidak Ditemukan",
  ditemukan_sesuai: "Ditemukan Sesuai",
  ditemukan_berbeda: "Ditemukan Berbeda",
};

export default function Inspektorat() {
  const [selectedKecamatan, setSelectedKecamatan] = useState<string | null>(null);
  const [heatmap, setHeatmap] = useState<ReturnType<typeof mapHeatmapRow>[]>([]);
  const [reports, setReports] = useState<PungliReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchPungliHeatmap(), fetchClaimHistory({ per_page: 50 })])
      .then(([heatmapRaw, claimsRaw]) => {
        const avg =
          heatmapRaw.length > 0
            ? heatmapRaw.reduce((a, h) => a + h.skor_risiko, 0) / heatmapRaw.length
            : 0;
        setHeatmap(heatmapRaw.map((h) => mapHeatmapRow(h, avg)));
        setReports(claimsRaw.data.map(mapClaimToPungliReport));
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  const maxKasus = useMemo(
    () => (heatmap.length ? Math.max(...heatmap.map((h) => h.jumlahKasus)) : 1),
    [heatmap]
  );

  const filteredReports = selectedKecamatan
    ? reports.filter((p) => p.kecamatan === selectedKecamatan)
    : reports;

  const tidakDitemukanCount = reports.filter((p) => p.hasilVerifikasi === "tidak_ditemukan").length;

  const topKecamatan = [...heatmap].sort((a, b) => b.jumlahKasus - a.jumlahKasus)[0];

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-ink-500">
        Memuat dasbor inspektorat...
      </div>
    );
  }

  if (error && reports.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-xl font-semibold text-ink-900">Gagal Memuat Data</h1>
        <p className="mt-2 text-sm text-ink-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest2 text-brass-700">
        <ShieldAlert className="h-3.5 w-3.5" /> Dasbor Inspektorat Daerah
      </div>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900">Peta Indikasi Pungutan Tidak Resmi</h1>
      <p className="mt-2 max-w-2xl text-ink-600">
        Diagregasi otomatis dari fitur Verifikasi Klaim warga — tanpa identitas pelapor.
        Konsentrasi kasus pada satu wilayah/layanan menjadi sinyal dini bagi pengawasan
        internal Inspektorat.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-sirah-200 bg-sirah-50 px-4 py-3 text-sm text-sirah-700">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-sirah-200 bg-sirah-50 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-sirah-800">
          <AlertTriangle className="h-4 w-4" />
          {tidakDitemukanCount} dari {reports.length} klaim terverifikasi sebagai "tidak ditemukan dalam regulasi resmi"
        </div>
        {topKecamatan && (
          <p className="mt-1.5 text-xs leading-relaxed text-sirah-700">
            Kecamatan {topKecamatan.kecamatan} menunjukkan skor risiko tertinggi ({topKecamatan.jumlahKasus} sinyal),
            dengan {topKecamatan.klaimTanpaDasar} klaim tanpa dasar hukum dan {topKecamatan.indikasiChat} indikasi dari chat.
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="rounded-xl border border-ink-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-800">
            <MapPin className="h-4 w-4 text-ink-400" /> Konsentrasi per Kecamatan
          </div>
          <div className="mt-4 space-y-3">
            {heatmap.length === 0 ? (
              <p className="text-sm text-ink-400">Belum ada data heatmap.</p>
            ) : (
              heatmap
                .slice()
                .sort((a, b) => b.jumlahKasus - a.jumlahKasus)
                .map((h) => (
                  <button
                    key={h.kecamatan}
                    onClick={() => setSelectedKecamatan(selectedKecamatan === h.kecamatan ? null : h.kecamatan)}
                    className={`block w-full rounded-lg border p-3.5 text-left transition-colors ${
                      selectedKecamatan === h.kecamatan ? "border-sirah-300 bg-sirah-50" : "border-ink-100 hover:border-ink-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ink-800">{h.kecamatan}</span>
                      <span className="font-mono text-sm font-semibold text-ink-900">{h.jumlahKasus}</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-100">
                      <div
                        className={`h-full rounded-full ${h.jumlahKasus > h.rataRataNasional * 2 ? "bg-sirah-500" : "bg-brass-400"}`}
                        style={{ width: `${(h.jumlahKasus / maxKasus) * 100}%` }}
                      />
                    </div>
                    <div className="mt-1 text-[11px] text-ink-400">
                      Rata-rata kecamatan lain: {h.rataRataNasional.toFixed(1)} kasus
                    </div>
                  </button>
                ))
            )}
          </div>
          {selectedKecamatan && (
            <button
              onClick={() => setSelectedKecamatan(null)}
              className="mt-3 text-xs font-medium text-ink-500 hover:text-ink-800"
            >
              Tampilkan semua kecamatan
            </button>
          )}
        </div>

        <div className="rounded-xl border border-ink-200 bg-white">
          <div className="border-b border-ink-100 p-5">
            <h3 className="font-display text-base font-semibold text-ink-900">
              Riwayat Verifikasi {selectedKecamatan ? `— Kecamatan ${selectedKecamatan}` : "(Semua Kecamatan)"}
            </h3>
            <p className="mt-1 text-xs text-ink-400">{filteredReports.length} entri ditemukan</p>
          </div>
          <div className="divide-y divide-ink-100">
            {filteredReports.length === 0 ? (
              <p className="p-4 text-sm text-ink-400">Belum ada riwayat verifikasi klaim.</p>
            ) : (
              filteredReports.map((p) => (
                <div key={p.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink-800">{p.layanan}</span>
                    <Badge className={hasilColor[p.hasilVerifikasi]}>{hasilLabel[p.hasilVerifikasi]}</Badge>
                  </div>
                  <p className="mt-1.5 text-sm text-ink-600">"{p.klaimDiajukan}"</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-ink-400">
                    <span>{p.kecamatan}</span>
                    <span>·</span>
                    <span>{new Date(p.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-ink-200 bg-ink-50/60 p-5 text-xs leading-relaxed text-ink-500">
        <strong className="text-ink-700">Catatan metodologi:</strong> Dashboard ini bersifat
        indikatif, bukan bukti hukum. Setiap konsentrasi kasus yang signifikan perlu
        ditindaklanjuti dengan investigasi lapangan oleh Inspektorat sebelum diambil
        tindakan administratif maupun hukum.
      </div>
    </div>
  );
}
