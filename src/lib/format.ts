import { Regulasi, StatusRegulasi } from "../data/types";

export function formatTanggal(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function regulasiLabel(r: Pick<Regulasi, "jenis" | "nomor" | "tahun">): string {
  return `${r.jenis} No. ${r.nomor} Tahun ${r.tahun}`;
}

export function statusColor(status: StatusRegulasi): string {
  switch (status) {
    case "Aktif":
      return "text-sawo-700 bg-sawo-100 border-sawo-200";
    case "Diubah Sebagian":
      return "text-brass-700 bg-brass-100 border-brass-200";
    case "Dicabut":
      return "text-sirah-700 bg-sirah-100 border-sirah-200";
  }
}

export function decayColor(score: number): string {
  if (score >= 70) return "text-sirah-600";
  if (score >= 40) return "text-brass-600";
  return "text-sawo-600";
}

export function decayBarColor(score: number): string {
  if (score >= 70) return "bg-sirah-500";
  if (score >= 40) return "bg-brass-500";
  return "bg-sawo-500";
}

export function decayLabel(score: number): string {
  if (score >= 70) return "Prioritas Tinggi";
  if (score >= 40) return "Perlu Ditinjau";
  return "Sehat";
}

export function closedLoopLabel(status: string): string {
  const map: Record<string, string> = {
    // Frontend (legacy mock)
    baru_terdeteksi: "Baru Terdeteksi",
    sedang_ditinjau: "Sedang Ditinjau",
    direkomendasikan_revisi: "Direkomendasikan Revisi",
    diproses_dprd: "Diproses DPRD",
    selesai_direvisi: "Selesai Direvisi",
    ditolak: "Ditolak",
    // Backend (revision_tracking)
    terdeteksi: "Baru Terdeteksi",
    ditinjau: "Sedang Ditinjau",
    direkomendasikan: "Direkomendasikan Revisi",
    selesai: "Selesai Direvisi",
  };
  return map[status] ?? status;
}

export function closedLoopColor(status: string): string {
  const map: Record<string, string> = {
    baru_terdeteksi: "bg-ink-100 text-ink-700 border-ink-200",
    sedang_ditinjau: "bg-brass-100 text-brass-700 border-brass-200",
    direkomendasikan_revisi: "bg-blue-50 text-blue-700 border-blue-200",
    diproses_dprd: "bg-purple-50 text-purple-700 border-purple-200",
    selesai_direvisi: "bg-sawo-100 text-sawo-700 border-sawo-200",
    ditolak: "bg-sirah-100 text-sirah-700 border-sirah-200",
    terdeteksi: "bg-ink-100 text-ink-700 border-ink-200",
    ditinjau: "bg-brass-100 text-brass-700 border-brass-200",
    direkomendasikan: "bg-blue-50 text-blue-700 border-blue-200",
    selesai: "bg-sawo-100 text-sawo-700 border-sawo-200",
  };
  return map[status] ?? "bg-ink-100 text-ink-700";
}

export function relasiLabel(jenis: string): string {
  const map: Record<string, string> = {
    mencabut: "Mencabut",
    dicabut_oleh: "Dicabut oleh",
    mengubah: "Mengubah",
    diubah_oleh: "Diubah oleh",
    merujuk: "Merujuk pada",
    dirujuk_oleh: "Dirujuk oleh",
    konflik: "Berpotensi Konflik",
    berpotensi_konflik: "Berpotensi Konflik", // kompatibilitas data lama
  };
  return map[jenis] ?? jenis;
}
