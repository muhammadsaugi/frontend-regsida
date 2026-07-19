import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Network, TrendingDown, ShieldAlert, ArrowRight, AlertCircle } from "lucide-react";
import { StatCard, SectionEyebrow } from "../components/ui";
import { closedLoopColor, closedLoopLabel, decayColor } from "../lib/format";
import { fetchDashboardStats, fetchDecayRegulations } from "../lib/admin-api";
import { mapRegulationToRegulasi, mapRevisionToClosedLoopItem } from "../lib/adapters";
import { getErrorMessage } from "../lib/api";
import { ClosedLoopItem, Regulasi } from "../data/types";

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    totalRegulasi: number;
    conflictCount: number;
    highDecay: number;
    openLoop: number;
  } | null>(null);
  const [topDecay, setTopDecay] = useState<Regulasi[]>([]);
  const [closedLoopPreview, setClosedLoopPreview] = useState<ClosedLoopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchDashboardStats(), fetchDecayRegulations({ per_page: 100 })])
      .then(([dash, decay]) => {
        setStats({
          totalRegulasi: dash.total_regulasi,
          conflictCount: dash.konflik_terdeteksi,
          highDecay: dash.decay_score_tinggi,
          openLoop: dash.closed_loop_berjalan,
        });

        const regulasi = decay.data.map(mapRegulationToRegulasi);
        setTopDecay([...regulasi].sort((a, b) => b.decayScore - a.decayScore).slice(0, 4));

        const loops = decay.data
          .filter((r) => r.latest_revision_tracking)
          .map((r) => mapRevisionToClosedLoopItem(r.latest_revision_tracking!, r))
          .filter((c) => c.status !== "selesai" && c.status !== "selesai_direvisi")
          .slice(0, 4);
        setClosedLoopPreview(loops);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-ink-500">
        Memuat dasbor...
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-xl font-semibold text-ink-900">Gagal Memuat Dasbor</h1>
        <p className="mt-2 text-sm text-ink-500">{error ?? "Data tidak tersedia."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionEyebrow>Portal ASN — Bagian Hukum Setda</SectionEyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900">Dasbor Tata Kelola Regulasi</h1>
      <p className="mt-2 max-w-2xl text-ink-600">
        Ringkasan kondisi basis regulasi Kabupaten Sidoarjo: dokumen terindeks, potensi
        konflik, regulasi yang perlu ditinjau, dan status tindak lanjut.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard value={String(stats.totalRegulasi)} label="Total regulasi terindeks" />
        <StatCard value={String(stats.conflictCount)} label="Potensi konflik terdeteksi" sub="perlu verifikasi manual" />
        <StatCard value={String(stats.highDecay)} label="Decay Score tinggi" sub="kandidat revisi" />
        <StatCard value={String(stats.openLoop)} label="Tindak lanjut berjalan" sub="closed-loop tracking" />
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <Link
          to="/admin/graf"
          className="group rounded-xl border border-ink-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brass-300 hover:shadow-elevated"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-900 text-brass-400">
            <Network className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">Conflict Graph Engine</h3>
          <p className="mt-2 text-sm text-ink-600">
            Jelajahi jaringan relasi antar-regulasi dan tinjau potensi konflik.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brass-700">
            Buka graf <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        <Link
          to="/admin/decay"
          className="group rounded-xl border border-ink-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brass-300 hover:shadow-elevated"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-900 text-brass-400">
            <TrendingDown className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">Regulatory Decay Tracker</h3>
          <p className="mt-2 text-sm text-ink-600">
            Pantau regulasi yang usang dan kelola status tindak lanjutnya.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brass-700">
            Buka tracker <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        <Link
          to="/admin/inspektorat"
          className="group rounded-xl border border-ink-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brass-300 hover:shadow-elevated"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-900 text-brass-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">Dasbor Inspektorat</h3>
          <p className="mt-2 text-sm text-ink-600">
            Peta panas indikasi pungutan tidak resmi berdasarkan data Verifikasi Klaim.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brass-700">
            Buka dasbor <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-ink-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink-900">Regulasi Prioritas Tinjau</h3>
            <Link to="/admin/decay" className="text-xs font-medium text-brass-700">Lihat semua</Link>
          </div>
          <div className="mt-4 space-y-3">
            {topDecay.length === 0 ? (
              <p className="text-sm text-ink-400">Belum ada data regulasi.</p>
            ) : (
              topDecay.map((r) => (
                <Link
                  key={r.id}
                  to={`/regulasi/${r.id}`}
                  className="flex items-center justify-between rounded-md border border-ink-100 p-3 hover:border-brass-300"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ink-800">{r.judul}</div>
                    <div className="text-xs text-ink-400">{r.jenis} No. {r.nomor}/{r.tahun}</div>
                  </div>
                  <div className={`ml-3 shrink-0 font-mono text-sm font-semibold ${decayColor(r.decayScore)}`}>
                    {r.decayScore}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-ink-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink-900">Status Closed-Loop Tracking</h3>
            <Link to="/admin/decay" className="text-xs font-medium text-brass-700">Lihat semua</Link>
          </div>
          <div className="mt-4 space-y-3">
            {closedLoopPreview.length === 0 ? (
              <p className="text-sm text-ink-400">Belum ada tindak lanjut berjalan.</p>
            ) : (
              closedLoopPreview.map((c) => (
                <div key={c.id} className="rounded-md border border-ink-100 p-3">
                  <div className="truncate text-sm font-medium text-ink-800">{c.judulRegulasi}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${closedLoopColor(c.status)}`}>
                      {closedLoopLabel(c.status)}
                    </span>
                    <span className="text-[11px] text-ink-400">{c.ditugaskanKe}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-xl border border-brass-200 bg-brass-50 p-5 text-sm text-brass-800">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Data pada dasbor ini dihitung otomatis dari basis regulasi, relasi graf,
          closed-loop revisi, dan log interaksi warga yang teragregasi.
        </p>
      </div>
    </div>
  );
}
