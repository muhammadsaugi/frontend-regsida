import { useState } from "react";
import { ChevronDown, FileSearch, Info } from "lucide-react";
import { RagSource } from "../lib/rag-api";
import { Link } from "react-router-dom";

export default function ExplainabilityPanel({
  sources,
  consideredCount,
  confidence,
  groundedFromAI,
}: {
  sources: RagSource[];
  consideredCount: number;
  confidence: number;
  groundedFromAI: boolean;
}) {
  const [open, setOpen] = useState(false);
  const confidencePct = Math.round(confidence * 100);

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-ink-200 bg-ink-50/60">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-ink-100/60"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <FileSearch className="h-4 w-4 text-brass-600" />
          Lihat bagaimana REGS menjawab
        </span>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-ink-400 sm:inline">
            {consideredCount} dokumen dipertimbangkan
          </span>
          <ChevronDown className={`h-4 w-4 text-ink-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-ink-200 bg-white px-4 py-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between text-xs text-ink-500">
                <span>Tingkat keyakinan jawaban</span>
                <span className="font-mono font-medium">{confidencePct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                <div
                  className={`h-full rounded-full ${
                    confidencePct >= 70 ? "bg-sawo-500" : confidencePct >= 45 ? "bg-brass-500" : "bg-sirah-500"
                  }`}
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
            </div>
          </div>

          {sources.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Dokumen sumber yang dipertimbangkan
              </div>
              {sources.map((s, i) => (
                <Link
                  to={`/regulasi/${s.regulasiId}`}
                  key={i}
                  className="block rounded-md border border-ink-150 bg-ink-50/50 p-3 transition-colors hover:border-brass-300 hover:bg-brass-50/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-ink-800">
                        {s.jenis} No. {s.nomor}/{s.tahun}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-ink-500">{s.judul}</div>
                      <div className="mt-1.5 line-clamp-2 text-xs text-ink-600">
                        <span className="font-mono text-[10px] text-brass-700">{s.pasal}</span> — {s.isi}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-xs font-semibold text-ink-700">
                        {Math.round(s.score * 100)}%
                      </div>
                      <div className="text-[10px] text-ink-400">relevansi</div>
                    </div>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full bg-brass-400" style={{ width: `${s.score * 100}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-500">Tidak ada dokumen relevan yang ditemukan dalam basis data.</p>
          )}

          <div className="mt-3 flex items-start gap-2 rounded-md bg-ink-50 p-3 text-xs leading-relaxed text-ink-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
            <span>
              Panel ini menjelaskan dasar pengambilan dokumen (proses retrieval) yang digunakan sistem —
              bukan klaim membuka seluruh proses penalaran model bahasa secara internal.
              {groundedFromAI ? " Jawaban di atas disusun oleh model AI berdasarkan dokumen yang ditampilkan di sini." : " Jawaban di atas disusun secara otomatis dari kutipan dokumen yang paling relevan."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
