/**
 * Backend (Laravel) pakai snake_case + enum lowercase + id number.
 * Frontend (data/types.ts) pakai camelCase Indonesia + enum kapital + id string.
 * File ini adalah SATU-SATUNYA tempat konversi antara keduanya, supaya
 * komponen tampilan yang sudah ada (Cari.tsx, RegulasiDetail.tsx, dll)
 * tidak perlu dirombak total - cukup ganti sumber datanya saja.
 */

import {
  Regulasi,
  JenisRegulasi,
  StatusRegulasi,
  Pasal,
  ChatMessage,
  ConflictEdge,
  ClosedLoopItem,
  PungliReport,
} from "../data/types";
import { RagResponse, RagSource } from "./rag-api";

// ==================== Regulasi ====================

const JENIS_MAP: Record<string, JenisRegulasi> = {
  perda: "Perda",
  perbup: "Perbup",
  se: "SE",
  instruksi_bupati: "Instruksi Bupati",
};

const JENIS_MAP_REVERSE: Record<JenisRegulasi, string> = {
  Perda: "perda",
  Perbup: "perbup",
  SE: "se",
  "Instruksi Bupati": "instruksi_bupati",
};

const STATUS_MAP: Record<string, StatusRegulasi> = {
  berlaku: "Aktif",
  diubah: "Diubah Sebagian",
  dicabut: "Dicabut",
};

export interface BackendRegulationArticle {
  id: number;
  regulation_id: number;
  nomor_pasal: string;
  isi: string;
}

export interface BackendRegulation {
  id: number;
  jenis: string;
  nomor: string;
  tahun: number;
  judul: string;
  opd: string | null;
  tanggal_terbit: string | null;
  status: string;
  tags: string[] | null;
  ringkasan: string | null;
  decay_score: string | number;
  jumlah_dilihat: number;
  jumlah_ditanyakan: number;
  articles?: BackendRegulationArticle[];
}

export function jenisToBackend(jenis: JenisRegulasi | "Semua"): string | undefined {
  if (jenis === "Semua") return undefined;
  return JENIS_MAP_REVERSE[jenis];
}

export function mapRegulationToRegulasi(r: BackendRegulation): Regulasi {
  const tahunTerbit = r.tanggal_terbit ? new Date(r.tanggal_terbit).getFullYear() : r.tahun;
  const usiaTahun = new Date().getFullYear() - tahunTerbit;

  const pasalUtama: Pasal[] = (r.articles ?? []).map((a) => ({
    id: String(a.id),
    nomor: a.nomor_pasal,
    isi: a.isi,
  }));

  return {
    id: String(r.id),
    jenis: JENIS_MAP[r.jenis] ?? "Perda",
    nomor: r.nomor,
    tahun: r.tahun,
    judul: r.judul,
    opd: r.opd ?? "-",
    tanggalTerbit: r.tanggal_terbit ?? `${r.tahun}-01-01`,
    status: STATUS_MAP[r.status] ?? "Aktif",
    tags: r.tags ?? [],
    ringkasan: r.ringkasan ?? "",
    pasalUtama,
    decayScore: Number(r.decay_score),
    // Backend belum punya breakdown decay factor terpisah (cuma skor akhir) -
    // dekomposisi ini dihitung best-effort di sini, bukan dari data asli.
    decayFactors: {
      usiaTahun: Math.max(0, usiaTahun),
      frekuensiPertanyaan: r.jumlah_ditanyakan,
      avgConfidence: 0.7,
    },
    jumlahDilihat: r.jumlah_dilihat,
    jumlahDitanyakan: r.jumlah_ditanyakan,
  };
}

// ==================== Chat / RAG ====================

export function mapChatResponseToRagResponse(res: RagResponse): {
  answer: string;
  confidence: number;
  sources: RagSource[];
  consideredCount: number;
  groundedFromAI: boolean;
} {
  const sources: RagSource[] = res.sources.map((s) => ({
    regulasiId: String(s.regulation_id),
    judul: s.judul,
    jenis: JENIS_MAP[s.jenis] ?? s.jenis,
    nomor: s.nomor,
    tahun: s.tahun,
    pasal: s.article_id ? `Pasal ${s.article_id}` : "Ringkasan",
    isi: s.snippet,
    score: s.confidence,
  }));

  return {
    answer: res.answer,
    confidence: res.confidence,
    sources,
    consideredCount: res.sources.length,
    groundedFromAI: true, // backend selalu pakai Gemini, tidak ada mode fallback rule-based lagi
  };
}

export function newUserMessage(content: string): ChatMessage {
  return { id: `u-${Date.now()}`, role: "user", content, timestamp: Date.now() };
}

// ==================== Admin / Dashboard ====================

export interface BackendDashboardStats {
  total_regulasi: number;
  regulasi_per_jenis: Record<string, number>;
  konflik_terdeteksi: number;
  decay_score_tinggi: number;
  closed_loop_berjalan: number;
  total_interaksi_bulan_ini: number;
}

export interface BackendRegulationSummary {
  id: number;
  judul: string;
  jenis: string;
  nomor: string;
  tahun: number;
}

export interface BackendRelation {
  id: number;
  source_id: number;
  target_id: number;
  jenis_relasi: string;
  confidence: string | number;
  alasan: string | null;
  status_tinjau: string;
  source?: BackendRegulationSummary;
  target?: BackendRegulationSummary;
}

export interface BackendRevisionHistory {
  id: number;
  revision_tracking_id: number;
  status: string;
  catatan: string | null;
  created_at: string;
}

export interface BackendRevisionTracking {
  id: number;
  regulation_id: number;
  status: string;
  catatan: string | null;
  ditugaskan_ke: number | null;
  updated_at?: string;
  assignee?: { id: number; name: string };
  history?: BackendRevisionHistory[];
  regulation?: BackendRegulationSummary;
}

export interface BackendRegulationWithRevision extends BackendRegulation {
  latest_revision_tracking?: BackendRevisionTracking | null;
}

export interface BackendHeatmapRow {
  kecamatan: string;
  total_klaim_diverifikasi: number;
  klaim_tanpa_dasar_hukum: number;
  klaim_sebagian_sesuai: number;
  indikasi_pungli_dari_chat: number;
  skor_risiko: number;
}

export interface BackendClaimVerification {
  id: number;
  klaim_text: string;
  hasil_verifikasi: string;
  kecamatan: string | null;
  layanan: string | null;
  created_at: string;
}

const RELASI_JENIS_MAP: Record<string, ConflictEdge["jenisRelasi"]> = {
  mencabut: "mencabut",
  mengubah: "mengubah",
  merujuk: "merujuk",
  konflik: "berpotensi_konflik",
};

const RELASI_STATUS_MAP: Record<string, ConflictEdge["statusTinjau"]> = {
  belum_ditinjau: "belum_ditinjau",
  divalidasi: "valid",
  ditolak: "tidak_relevan",
};

const HASIL_KLAIM_MAP: Record<string, PungliReport["hasilVerifikasi"]> = {
  tidak_ditemukan: "tidak_ditemukan",
  ditemukan: "ditemukan_sesuai",
  sebagian_sesuai: "ditemukan_berbeda",
};

export function mapRelationToConflictEdge(r: BackendRelation): ConflictEdge {
  return {
    id: String(r.id),
    sourceId: String(r.source_id),
    targetId: String(r.target_id),
    jenisRelasi: RELASI_JENIS_MAP[r.jenis_relasi] ?? "merujuk",
    confidence: Number(r.confidence),
    alasan: r.alasan ?? "",
    statusTinjau: RELASI_STATUS_MAP[r.status_tinjau] ?? "belum_ditinjau",
  };
}

export function mapRevisionToClosedLoopItem(
  rev: BackendRevisionTracking,
  regulation?: BackendRegulation | BackendRegulationSummary
): ClosedLoopItem {
  const reg = regulation ?? rev.regulation;
  const judul =
    reg != null
      ? `${JENIS_MAP[reg.jenis] ?? reg.jenis} No. ${reg.nomor} Tahun ${reg.tahun} — ${reg.judul}`
      : "Regulasi";

  return {
    id: String(rev.id),
    regulasiId: String(rev.regulation_id),
    judulRegulasi: judul,
    status: rev.status as ClosedLoopItem["status"],
    catatan: rev.catatan ?? "",
    ditugaskanKe: rev.assignee?.name ?? "Belum ditugaskan",
    tanggalUpdate: rev.updated_at ?? new Date().toISOString(),
    riwayat: (rev.history ?? []).map((h) => ({
      status: h.status,
      tanggal: h.created_at,
      catatan: h.catatan ?? "",
    })),
  };
}

export function mapClaimToPungliReport(c: BackendClaimVerification): PungliReport {
  return {
    id: String(c.id),
    kecamatan: c.kecamatan ?? "-",
    layanan: c.layanan ?? "-",
    opd: "-",
    tanggal: c.created_at,
    klaimDiajukan: c.klaim_text,
    hasilVerifikasi: HASIL_KLAIM_MAP[c.hasil_verifikasi] ?? "tidak_ditemukan",
  };
}

export function mapHeatmapRow(h: BackendHeatmapRow, rataRata: number) {
  return {
    kecamatan: h.kecamatan,
    jumlahKasus: h.skor_risiko,
    rataRataNasional: rataRata,
    klaimTanpaDasar: h.klaim_tanpa_dasar_hukum,
    indikasiChat: h.indikasi_pungli_dari_chat,
  };
}

/** Status closed-loop backend → frontend (untuk progress bar UI) */
export function revisionStatusForUI(status: string): ClosedLoopItem["status"] {
  const map: Record<string, ClosedLoopItem["status"]> = {
    terdeteksi: "baru_terdeteksi",
    ditinjau: "sedang_ditinjau",
    direkomendasikan: "direkomendasikan_revisi",
    diproses_dprd: "diproses_dprd",
    selesai: "selesai_direvisi",
  };
  return map[status] ?? (status as ClosedLoopItem["status"]);
}

/** Status frontend → backend untuk PATCH /admin/revisions/{id} */
export function revisionStatusToBackend(status: ClosedLoopItem["status"]): string {
  const map: Record<string, string> = {
    baru_terdeteksi: "terdeteksi",
    sedang_ditinjau: "ditinjau",
    direkomendasikan_revisi: "direkomendasikan",
    diproses_dprd: "diproses_dprd",
    selesai_direvisi: "selesai",
  };
  return map[status] ?? status;
}
