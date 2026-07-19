import { api } from "./api";
import {
  BackendRegulation,
  BackendDashboardStats,
  BackendRelation,
  BackendRevisionTracking,
  BackendHeatmapRow,
  BackendClaimVerification,
  BackendRegulationWithRevision,
} from "./adapters";

/** GET /api/admin/dashboard */
export async function fetchDashboardStats(): Promise<BackendDashboardStats> {
  const res = await api.get<BackendDashboardStats>("/admin/dashboard");
  return res.data;
}

/** GET /api/admin/decay */
export async function fetchDecayRegulations(params?: {
  min_score?: number;
  per_page?: number;
  page?: number;
}) {
  const res = await api.get<{ data: BackendRegulationWithRevision[]; total: number }>("/admin/decay", { params });
  return res.data;
}

/** GET /api/admin/relations */
export async function fetchAllRelations(): Promise<BackendRelation[]> {
  const res = await api.get<BackendRelation[]>("/admin/relations");
  return res.data;
}

/** PATCH /api/admin/relations/{id} — validasi/tolak relasi (bagian_hukum) */
export async function validateRelationAPI(id: number, status_tinjau: "divalidasi" | "ditolak") {
  const res = await api.patch<BackendRelation>(`/admin/relations/${id}`, { status_tinjau });
  return res.data;
}

/** PATCH /api/admin/revisions/{id} — update status closed-loop (bagian_hukum) */
export async function updateRevisionStatusAPI(
  id: number,
  payload: { status: string; catatan?: string }
): Promise<BackendRevisionTracking> {
  const res = await api.patch<BackendRevisionTracking>(`/admin/revisions/${id}`, payload);
  return res.data;
}

/** GET /api/admin/inspektorat/pungli-heatmap */
export async function fetchPungliHeatmap(): Promise<BackendHeatmapRow[]> {
  const res = await api.get<BackendHeatmapRow[]>("/admin/inspektorat/pungli-heatmap");
  return res.data;
}

/** GET /api/admin/inspektorat/claim-history */
export async function fetchClaimHistory(params?: {
  kecamatan?: string;
  layanan?: string;
  hasil_verifikasi?: string;
  per_page?: number;
  page?: number;
}) {
  const res = await api.get<{ data: BackendClaimVerification[]; total: number }>(
    "/admin/inspektorat/claim-history",
    { params }
  );
  return res.data;
}

/** GET /api/regulations — untuk statistik publik di Home */
export async function fetchRegulationsTotal(): Promise<{ total: number; perJenis: Record<string, number> }> {
  const res = await api.get<{ data: BackendRegulation[]; total: number }>("/regulations", {
    params: { per_page: 1 },
  });
  const all = await api.get<{ data: BackendRegulation[]; total: number }>("/regulations", {
    params: { per_page: 100 },
  });
  const perJenis: Record<string, number> = {};
  for (const r of all.data.data) {
    perJenis[r.jenis] = (perJenis[r.jenis] ?? 0) + 1;
  }
  return { total: res.data.total, perJenis };
}

/** GET /api/admin/regulations (list all regulations for management) */
export async function fetchRegulationsForAdmin(params?: {
  per_page?: number;
  page?: number;
  search?: string;
  jenis?: string;
}) {
  const res = await api.get<{ data: BackendRegulation[]; total: number }>("/regulations", { params });
  return res.data;
}

/** POST /api/admin/regulations (create new regulation) */
export async function createRegulation(payload: {
  judul: string;
  jenis: string;
  nomor: string;
  tahun: number;
  tentang: string;
  opd: string;
}) {
  const res = await api.post<BackendRegulation>("/admin/regulations", payload);
  return res.data;
}

/** PUT /api/admin/regulations/{id} (update regulation) */
export async function updateRegulation(id: number, payload: Partial<{
  judul: string;
  jenis: string;
  nomor: string;
  tahun: number;
  tentang: string;
  opd: string;
}>) {
  const res = await api.put<BackendRegulation>(`/admin/regulations/${id}`, payload);
  return res.data;
}

/** POST /admin/regulations/{id}/upload-pdf (upload PDF and re-embed) */
export async function uploadRegulationPdf(id: number, file: File, onProgress?: (progress: number) => void) {
  const formData = new FormData();
  formData.append("pdf", file);
  const res = await api.post(`/admin/regulations/${id}/upload-pdf`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
      }
    },
  });
  return res.data;
}

/** GET /api/admin/civic-insights (Suara Warga data) */
export async function fetchCivicInsights() {
  const res = await api.get("/admin/civic-insights");
  return res.data;
}
