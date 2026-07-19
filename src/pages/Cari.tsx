import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, FileText } from "lucide-react";
import { Badge } from "../components/ui";
import { statusColor, regulasiLabel, formatTanggal } from "../lib/format";
import { JenisRegulasi, Regulasi } from "../data/types";
import { api, getErrorMessage } from "../lib/api";
import { mapRegulationToRegulasi, jenisToBackend, BackendRegulation } from "../lib/adapters";

const jenisOptions: (JenisRegulasi | "Semua")[] = ["Semua", "Perda", "Perbup", "SE", "Instruksi Bupati"];

export default function Cari() {
  const [query, setQuery] = useState("");
  const [jenis, setJenis] = useState<JenisRegulasi | "Semua">("Semua");
  const [showFilter, setShowFilter] = useState(false);
  const [results, setResults] = useState<Regulasi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Debounce ringan supaya tidak nembak API tiap ketikan huruf
    const timeout = setTimeout(() => {
      setIsLoading(true);
      setError(null);
      api
        .get<{ data: BackendRegulation[] }>("/regulations", {
          params: { search: query || undefined, jenis: jenisToBackend(jenis), per_page: 50 },
        })
        .then((res) => setResults(res.data.data.map(mapRegulationToRegulasi)))
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setIsLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, jenis]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold text-ink-900 sm:text-5xl">
          Cari Regulasi Daerah
        </h1>
        <p className="mt-4 text-lg text-ink-600">
          Telusuri seluruh Perda, Perbup, Surat Edaran, dan Instruksi Bupati Kabupaten Sidoarjo.
        </p>
      </div>

      <div className="mt-10">
        <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white px-5 py-4 shadow-xl focus-within:border-brass-400 focus-within:shadow-2xl focus-within:shadow-brass-200/30">
          <Search className="h-6 w-6 shrink-0 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Contoh: tarif pajak restoran, izin usaha mikro, jam layanan ramadan..."
            className="w-full bg-transparent text-base text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
          <button
            onClick={() => setShowFilter((v) => !v)}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
        </div>

        {showFilter && (
          <div className="mt-4 flex flex-wrap gap-3">
            {jenisOptions.map((j) => (
              <button
                key={j}
                onClick={() => setJenis(j)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  jenis === j
                    ? "border-brass-600 bg-gradient-to-r from-brass-600 to-brass-500 text-white shadow-lg shadow-brass-200"
                    : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50"
                }`}
              >
                {j === "SE" ? "Surat Edaran" : j}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between text-base text-ink-500">
        <span>{isLoading ? "Memuat..." : `${results.length} regulasi ditemukan`}</span>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-sirah-200 bg-sirah-50 p-5 text-base text-sirah-800">
          {error}
        </div>
      )}

      <div className="mt-4 space-y-4">
        {results.map((r) => (
          <Link
            key={r.id}
            to={`/regulasi/${r.id}`}
            className="block rounded-2xl border border-ink-200 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:border-brass-300 hover:shadow-2xl"
          >
            <div className="flex items-start gap-5">
              <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ink-900 to-ink-700 text-brass-300 shadow-md">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-brass-700">{regulasiLabel(r)}</span>
                  <Badge className={statusColor(r.status)}>{r.status}</Badge>
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-ink-900">
                  {r.judul}
                </h3>
                <p className="mt-3 line-clamp-2 text-base text-ink-600">{r.ringkasan}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-500">
                  <span>{r.opd}</span>
                  <span>·</span>
                  <span>Diterbitkan {formatTanggal(r.tanggalTerbit)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {!isLoading && results.length === 0 && !error && (
          <div className="rounded-2xl border border-dashed border-ink-300 p-12 text-center text-base text-ink-500">
            Tidak ditemukan regulasi yang cocok dengan pencarian Anda.
          </div>
        )}
      </div>
    </div>
  );
}
