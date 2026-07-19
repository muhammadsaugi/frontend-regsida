import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingDown, ChevronRight, Clock } from "lucide-react";
import { decayBarColor, decayColor, decayLabel, regulasiLabel, closedLoopColor, closedLoopLabel } from "../lib/format";
import { Badge } from "../components/ui";
import { fetchDecayRegulations, updateRevisionStatusAPI } from "../lib/admin-api";
import { mapRegulationToRegulasi, mapRevisionToClosedLoopItem, revisionStatusForUI } from "../lib/adapters";
import { getErrorMessage } from "../lib/api";
import { useAsnAuth } from "../context/AsnAuthContext";
import { ClosedLoopItem, Regulasi } from "../data/types";

const STATUS_FLOW = [
  "baru_terdeteksi",
  "sedang_ditinjau",
  "direkomendasikan_revisi",
  "diproses_dprd",
  "selesai_direvisi",
] as const;

const NEXT_STATUS: Record<string, string> = {
  terdeteksi: "ditinjau",
  ditinjau: "direkomendasikan",
  direkomendasikan: "diproses_dprd",
  diproses_dprd: "selesai",
};

export default function DecayTracker() {
  const { user } = useAsnAuth();
  const [regulasiList, setRegulasiList] = useState<Regulasi[]>([]);
  const [closedLoopItems, setClosedLoopItems] = useState<ClosedLoopItem[]>([]);
  const [sortDesc, setSortDesc] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const decay = await fetchDecayRegulations({ per_page: 100 });
      setRegulasiList(decay.data.map(mapRegulationToRegulasi));
      setClosedLoopItems(
        decay.data
          .filter((r) => r.latest_revision_tracking)
          .map((r) => mapRevisionToClosedLoopItem(r.latest_revision_tracking!, r))
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const sorted = useMemo(() => {
    const arr = [...regulasiList];
    arr.sort((a, b) => (sortDesc ? b.decayScore - a.decayScore : a.decayScore - b.decayScore));
    return arr;
  }, [regulasiList, sortDesc]);

  const avgDecay = regulasiList.length
    ? Math.round(regulasiList.reduce((a, r) => a + r.decayScore, 0) / regulasiList.length)
    : 0;

  async function handleAdvanceStatus(item: ClosedLoopItem) {
    const next = NEXT_STATUS[item.status];
    if (!next || user?.role !== "bagian_hukum") return;
    setUpdatingId(item.id);
    try {
      await updateRevisionStatusAPI(Number(item.id), { status: next });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-ink-500">
        Memuat Decay Tracker...
      </div>
    );
  }

  if (error && regulasiList.length === 0) {
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
        <TrendingDown className="h-3.5 w-3.5" /> Regulatory Decay Tracker
      </div>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900">Daftar Prioritas Revisi</h1>
      <p className="mt-2 max-w-2xl text-ink-600">
        Decay Score dihitung dari kombinasi usia regulasi, frekuensi pertanyaan warga/ASN,
        dan tingkat keyakinan AI saat menjawab — skor tinggi menandakan regulasi yang
        kemungkinan besar sudah usang atau ambigu.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-sirah-200 bg-sirah-50 px-4 py-3 text-sm text-sirah-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-ink-200 bg-white p-5">
          <div className="font-display text-2xl font-semibold text-ink-900">{avgDecay}</div>
          <div className="mt-1 text-xs text-ink-500">Rata-rata Decay Score basis data</div>
        </div>
        <div className="rounded-xl border border-ink-200 bg-white p-5">
          <div className="font-display text-2xl font-semibold text-sirah-600">
            {regulasiList.filter((r) => r.decayScore >= 70).length}
          </div>
          <div className="mt-1 text-xs text-ink-500">Prioritas tinggi (≥70)</div>
        </div>
        <div className="rounded-xl border border-ink-200 bg-white p-5">
          <div className="font-display text-2xl font-semibold text-sawo-600">
            {closedLoopItems.filter((c) => c.status === "selesai" || c.status === "selesai_direvisi").length}
          </div>
          <div className="mt-1 text-xs text-ink-500">Selesai direvisi (closed-loop)</div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink-900">Status Tindak Lanjut (Closed-Loop)</h2>
        <p className="mt-1 text-sm text-ink-500">
          Setiap temuan dilacak hingga tuntas — bukan sekadar terdeteksi lalu dibiarkan.
        </p>
        <div className="mt-4 space-y-3">
          {closedLoopItems.length === 0 ? (
            <p className="text-sm text-ink-400">Belum ada entri closed-loop tracking.</p>
          ) : (
            closedLoopItems.map((c) => {
              const uiStatus = revisionStatusForUI(c.status);
              const flowIndex = (STATUS_FLOW as readonly string[]).indexOf(uiStatus);
              const isExpanded = expandedId === c.id;
              const canAdvance = user?.role === "bagian_hukum" && NEXT_STATUS[c.status];

              return (
                <div key={c.id} className="rounded-xl border border-ink-200 bg-white p-5">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink-800">{c.judulRegulasi}</div>
                      <div className="mt-1 text-xs text-ink-400">{c.ditugaskanKe}</div>
                    </div>
                    <Badge className={closedLoopColor(c.status)}>{closedLoopLabel(c.status)}</Badge>
                    <ChevronRight className={`h-4 w-4 shrink-0 text-ink-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </button>

                  {c.status !== "ditolak" && flowIndex >= 0 && (
                    <div className="mt-4 flex items-center gap-1">
                      {STATUS_FLOW.map((s, i) => (
                        <div key={s} className="flex flex-1 items-center gap-1">
                          <div
                            className={`h-1.5 flex-1 rounded-full ${
                              i <= flowIndex ? "bg-brass-500" : "bg-ink-100"
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-4 space-y-3 border-t border-ink-100 pt-4">
                      <p className="text-sm text-ink-600">{c.catatan}</p>
                      {c.riwayat.length > 0 && (
                        <div className="space-y-2">
                          {c.riwayat.map((h, i) => (
                            <div key={i} className="flex gap-3 text-xs">
                              <div className="flex items-center gap-1.5 text-ink-400">
                                <Clock className="h-3 w-3" />
                                <span className="w-20 shrink-0 font-mono">
                                  {new Date(h.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "2-digit" })}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-ink-700">{closedLoopLabel(h.status)}</span>
                                <span className="text-ink-500"> — {h.catatan}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {canAdvance && (
                        <button
                          onClick={() => handleAdvanceStatus(c)}
                          disabled={updatingId === c.id}
                          className="rounded-md bg-brass-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brass-700 disabled:opacity-50"
                        >
                          {updatingId === c.id ? "Menyimpan..." : `Lanjut ke: ${closedLoopLabel(NEXT_STATUS[c.status])}`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Seluruh Regulasi — Diurutkan Decay Score</h2>
          <button
            onClick={() => setSortDesc((v) => !v)}
            className="text-xs font-medium text-ink-500 hover:text-ink-800"
          >
            Urutkan: {sortDesc ? "Tertinggi dulu" : "Terendah dulu"}
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-ink-200 bg-white">
          {sorted.map((r) => (
            <Link
              key={r.id}
              to={`/regulasi/${r.id}`}
              className="flex items-center gap-4 border-b border-ink-100 p-4 last:border-0 hover:bg-ink-50/60"
            >
              <div className="w-24 shrink-0">
                <div className={`font-mono text-sm font-semibold ${decayColor(r.decayScore)}`}>{r.decayScore}</div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                  <div className={`h-full rounded-full ${decayBarColor(r.decayScore)}`} style={{ width: `${r.decayScore}%` }} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-ink-800">{r.judul}</div>
                <div className="text-xs text-ink-400">{regulasiLabel(r)} · {r.opd}</div>
              </div>
              <div className="hidden shrink-0 text-right text-xs text-ink-400 sm:block">
                <div>Usia: {r.decayFactors.usiaTahun} thn</div>
                <div>Tanya: {r.decayFactors.frekuensiPertanyaan}/bln</div>
              </div>
              <Badge className={`shrink-0 ${decayColor(r.decayScore)} border-current/20 bg-current/5`}>
                {decayLabel(r.decayScore)}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
