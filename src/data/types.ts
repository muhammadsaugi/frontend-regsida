// Tipe data inti untuk seluruh entitas regulasi REGSIDA

export type JenisRegulasi = "Perda" | "Perbup" | "SE" | "Instruksi Bupati";
export type StatusRegulasi = "Aktif" | "Diubah Sebagian" | "Dicabut";

export interface Pasal {
  id: string;
  nomor: string; // "Pasal 4"
  isi: string;
}

export interface Regulasi {
  id: string;
  jenis: JenisRegulasi;
  nomor: string; // "1"
  tahun: number;
  judul: string;
  opd: string; // OPD pengampu/pemrakarsa
  tanggalTerbit: string; // ISO date
  status: StatusRegulasi;
  tags: string[];
  ringkasan: string;
  pasalUtama: Pasal[];
  dicabutOleh?: string; // id regulasi yang mencabut
  mencabut?: string[]; // id regulasi yang dicabut oleh ini
  merujuk?: string[]; // id regulasi yang dirujuk
  decayScore: number; // 0-100, makin tinggi makin perlu ditinjau
  decayFactors: {
    usiaTahun: number;
    frekuensiPertanyaan: number; // per bulan
    avgConfidence: number; // 0-1
  };
  jumlahDilihat: number;
  jumlahDitanyakan: number;
}

export interface ConflictEdge {
  id: string;
  sourceId: string;
  targetId: string;
  jenisRelasi: "mencabut" | "mengubah" | "merujuk" | "berpotensi_konflik";
  confidence: number; // 0-1
  alasan: string;
  statusTinjau: "belum_ditinjau" | "valid" | "tidak_relevan";
}

export interface ClosedLoopItem {
  id: string;
  regulasiId: string;
  judulRegulasi: string;
  status:
    | "baru_terdeteksi"
    | "sedang_ditinjau"
    | "direkomendasikan_revisi"
    | "diproses_dprd"
    | "selesai_direvisi"
    | "ditolak"
    // Backend revision_tracking (snake_case lifecycle)
    | "terdeteksi"
    | "ditinjau"
    | "direkomendasikan"
    | "selesai";
  catatan: string;
  ditugaskanKe: string;
  tanggalUpdate: string;
  riwayat: { status: string; tanggal: string; catatan: string }[];
}

export interface PungliReport {
  id: string;
  kecamatan: string;
  layanan: string;
  opd: string;
  tanggal: string;
  klaimDiajukan: string;
  hasilVerifikasi: "tidak_ditemukan" | "ditemukan_sesuai" | "ditemukan_berbeda";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { regulasiId: string; pasal: string; score: number }[];
  confidence?: number;
  timestamp: number;
}
