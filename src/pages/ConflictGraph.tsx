import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Network, AlertTriangle, CheckCircle2, HelpCircle, X } from "lucide-react";
import { ConflictEdge, JenisRegulasi } from "../data/types";
import { relasiLabel } from "../lib/format";
import { fetchAllRelations, validateRelationAPI } from "../lib/admin-api";
import { mapRelationToConflictEdge, BackendRelation } from "../lib/adapters";
import { getErrorMessage } from "../lib/api";
import { useAsnAuth } from "../context/AsnAuthContext";

const jenisColor: Record<JenisRegulasi, string> = {
  Perda: "#b9852f",
  Perbup: "#465c66",
  SE: "#7c9d5b",
  "Instruksi Bupati": "#9f3f29",
};

const JENIS_MAP: Record<string, JenisRegulasi> = {
  perda: "Perda",
  perbup: "Perbup",
  se: "SE",
  instruksi_bupati: "Instruksi Bupati",
};

function computeLayout(ids: string[], width: number, height: number) {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 2 - 70;
  const positions: Record<string, { x: number; y: number }> = {};
  ids.forEach((id, i) => {
    const angle = (i / ids.length) * 2 * Math.PI - Math.PI / 2;
    positions[id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  return positions;
}

const relasiColor: Record<ConflictEdge["jenisRelasi"], string> = {
  mencabut: "#9f3f29",
  mengubah: "#b9852f",
  merujuk: "#647a83",
  berpotensi_konflik: "#bd5940",
};

function regLabelFromRelation(r: BackendRelation, id: number) {
  const reg = r.source?.id === id ? r.source : r.target?.id === id ? r.target : null;
  if (!reg) return `Regulasi #${id}`;
  const jenis = JENIS_MAP[reg.jenis] ?? reg.jenis;
  return `${jenis === "Instruksi Bupati" ? "Instr." : jenis} ${reg.nomor}/${reg.tahun}`;
}

function regDetailFromRelation(r: BackendRelation, id: number) {
  const reg = r.source?.id === id ? r.source : r.target?.id === id ? r.target : null;
  if (!reg) return null;
  return {
    id: String(reg.id),
    jenis: JENIS_MAP[reg.jenis] ?? "Perda",
    nomor: reg.nomor,
    tahun: reg.tahun,
    judul: reg.judul,
  };
}

export default function ConflictGraph() {
  const { user } = useAsnAuth();
  const [edges, setEdges] = useState<ConflictEdge[]>([]);
  const [rawRelations, setRawRelations] = useState<BackendRelation[]>([]);
  const [selectedEdge, setSelectedEdge] = useState<ConflictEdge | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [filter, setFilter] = useState<"semua" | "konflik" | "valid">("semua");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  async function loadRelations() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllRelations();
      setRawRelations(data);
      setEdges(data.map(mapRelationToConflictEdge));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRelations();
  }, []);

  const nodeIds = useMemo(
    () => Array.from(new Set(edges.flatMap((e) => [e.sourceId, e.targetId]))),
    [edges]
  );

  const width = 760;
  const height = 560;
  const positions = useMemo(() => computeLayout(nodeIds, width, height), [nodeIds]);

  const visibleEdges = edges.filter((e) => {
    if (filter === "konflik") return e.jenisRelasi === "berpotensi_konflik";
    if (filter === "valid") return e.statusTinjau === "valid";
    return true;
  });

  const unresolvedConflicts = edges.filter(
    (e) => e.jenisRelasi === "berpotensi_konflik" && e.statusTinjau === "belum_ditinjau"
  );

  const selectedRaw = selectedEdge
    ? rawRelations.find((r) => String(r.id) === selectedEdge.id)
    : null;

  async function handleValidate(status_tinjau: "divalidasi" | "ditolak") {
    if (!selectedEdge || user?.role !== "bagian_hukum") return;
    setValidating(true);
    try {
      await validateRelationAPI(Number(selectedEdge.id), status_tinjau);
      await loadRelations();
      setSelectedEdge(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setValidating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-ink-500">
        Memuat graf relasi...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest2 text-brass-700">
        <Network className="h-3.5 w-3.5" /> Conflict &amp; Redundancy Graph Engine
      </div>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900">Peta Relasi Regulasi</h1>
      <p className="mt-2 max-w-2xl text-ink-600">
        Visualisasi jaringan hubungan antar-regulasi: pencabutan, perubahan, rujukan, dan
        potensi konflik. Setiap relasi memiliki skor keyakinan (confidence) yang
        menunjukkan tingkat kepastian deteksi otomatis.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-sirah-200 bg-sirah-50 px-4 py-3 text-sm text-sirah-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["semua", "konflik", "valid"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === f ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 bg-white text-ink-600 hover:border-ink-300"
            }`}
          >
            {f === "konflik" ? "Berpotensi konflik" : f === "valid" ? "Sudah divalidasi" : "Semua relasi"}
          </button>
        ))}
      </div>

      {edges.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-ink-300 p-12 text-center text-sm text-ink-500">
          Belum ada relasi antar-regulasi. Tambahkan via POST /admin/relations atau jalankan DemoDataSeeder.
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#94a5ac" />
                </marker>
              </defs>

              {visibleEdges.map((e) => {
                const s = positions[e.sourceId];
                const t = positions[e.targetId];
                if (!s || !t) return null;
                const isDashed = e.confidence < 0.6;
                const isHighlighted = hoveredNode === e.sourceId || hoveredNode === e.targetId;
                return (
                  <g key={e.id} className="cursor-pointer" onClick={() => setSelectedEdge(e)}>
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={relasiColor[e.jenisRelasi]}
                      strokeWidth={isHighlighted ? 2.5 : 1.5}
                      strokeDasharray={isDashed ? "5,4" : undefined}
                      opacity={isHighlighted || !hoveredNode ? 0.85 : 0.15}
                      markerEnd="url(#arrow)"
                    />
                    <circle
                      cx={(s.x + t.x) / 2}
                      cy={(s.y + t.y) / 2}
                      r={9}
                      fill="white"
                      stroke={relasiColor[e.jenisRelasi]}
                      strokeWidth={1.2}
                      opacity={isHighlighted || !hoveredNode ? 1 : 0.2}
                    />
                    <text
                      x={(s.x + t.x) / 2}
                      y={(s.y + t.y) / 2 + 3}
                      textAnchor="middle"
                      fontSize="9"
                      fill={relasiColor[e.jenisRelasi]}
                      opacity={isHighlighted || !hoveredNode ? 1 : 0.2}
                    >
                      {Math.round(e.confidence * 100)}
                    </text>
                  </g>
                );
              })}

              {nodeIds.map((id) => {
                const pos = positions[id];
                const raw = rawRelations.find((r) => String(r.source_id) === id || String(r.target_id) === id);
                if (!pos || !raw) return null;
                const reg = regDetailFromRelation(raw, Number(id));
                if (!reg) return null;
                const isHovered = hoveredNode === id;
                return (
                  <g
                    key={id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredNode(id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <circle r={isHovered ? 26 : 22} fill={jenisColor[reg.jenis]} opacity={0.12} />
                    <circle r={9} fill={jenisColor[reg.jenis]} stroke="white" strokeWidth={2} />
                    <text
                      y={isHovered ? -30 : 18}
                      textAnchor="middle"
                      fontSize="10.5"
                      fontWeight={600}
                      fill="#1d2832"
                      className="font-sans"
                    >
                      {reg.jenis === "Instruksi Bupati" ? "Instr." : reg.jenis} {reg.nomor}/{reg.tahun}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-ink-100 pt-3 text-xs text-ink-500">
              {Object.entries(jenisColor).map(([k, c]) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} /> {k}
                </span>
              ))}
              <span className="flex items-center gap-1.5">
                <span className="h-px w-4 border-t border-dashed border-ink-400" /> Confidence rendah (&lt;60%)
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-sirah-200 bg-sirah-50 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-sirah-800">
                <AlertTriangle className="h-4 w-4" /> {unresolvedConflicts.length} Konflik Belum Ditinjau
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-sirah-700">
                Memerlukan verifikasi staf hukum sebelum ditindaklanjuti. Klik relasi pada
                graf untuk melihat detail dan alasan deteksi.
              </p>
            </div>

            {selectedEdge && selectedRaw ? (
              <div className="rounded-xl border border-ink-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {selectedEdge.jenisRelasi === "berpotensi_konflik" ? (
                      <AlertTriangle className="h-4 w-4 text-sirah-600" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-sawo-600" />
                    )}
                    <span className="text-sm font-semibold text-ink-900">{relasiLabel(selectedEdge.jenisRelasi)}</span>
                  </div>
                  <button onClick={() => setSelectedEdge(null)} className="text-ink-400 hover:text-ink-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-1.5 text-sm">
                  <Link to={`/regulasi/${selectedEdge.sourceId}`} className="block font-medium text-ink-700 hover:text-brass-700">
                    {regLabelFromRelation(selectedRaw, Number(selectedEdge.sourceId))}
                  </Link>
                  <div className="text-xs text-ink-400">↓</div>
                  <Link to={`/regulasi/${selectedEdge.targetId}`} className="block font-medium text-ink-700 hover:text-brass-700">
                    {regLabelFromRelation(selectedRaw, Number(selectedEdge.targetId))}
                  </Link>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-ink-500">
                    <span>Confidence score</span>
                    <span className="font-mono font-medium">{Math.round(selectedEdge.confidence * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${selectedEdge.confidence * 100}%`, background: relasiColor[selectedEdge.jenisRelasi] }}
                    />
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-ink-600">{selectedEdge.alasan}</p>

                {selectedEdge.statusTinjau === "belum_ditinjau" && user?.role === "bagian_hukum" && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleValidate("divalidasi")}
                      disabled={validating}
                      className="flex-1 rounded-md bg-sawo-600 py-2 text-xs font-semibold text-white hover:bg-sawo-700 disabled:opacity-50"
                    >
                      Tandai Valid
                    </button>
                    <button
                      onClick={() => handleValidate("ditolak")}
                      disabled={validating}
                      className="flex-1 rounded-md border border-ink-200 py-2 text-xs font-semibold text-ink-600 hover:bg-ink-50 disabled:opacity-50"
                    >
                      Tandai Tidak Relevan
                    </button>
                  </div>
                )}
                {selectedEdge.statusTinjau !== "belum_ditinjau" && (
                  <div className="mt-4 rounded-md bg-ink-50 px-3 py-2 text-xs font-medium text-ink-600">
                    Status: {selectedEdge.statusTinjau === "valid" ? "Sudah divalidasi staf hukum" : "Ditandai tidak relevan"}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-ink-300 p-8 text-center">
                <HelpCircle className="h-5 w-5 text-ink-400" />
                <p className="text-xs text-ink-500">Klik salah satu relasi (lingkaran kecil pada garis) untuk melihat detail dan alasan deteksi.</p>
              </div>
            )}

            <div className="rounded-xl border border-ink-200 bg-ink-50/60 p-5 text-xs leading-relaxed text-ink-500">
              <strong className="text-ink-700">Catatan validasi:</strong> Setiap edge konflik
              disertai confidence score dan dapat dikoreksi manual oleh staf hukum (human-in-the-loop).
              Relasi dengan confidence di bawah 60% ditampilkan dengan garis putus-putus sebagai
              sinyal bahwa deteksi memerlukan kehati-hatian lebih.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
