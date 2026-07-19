import { api, getErrorMessage } from "./api";
import { getOrCreateSessionId } from "./session";

export interface RagSourceRaw {
  regulation_id: number;
  article_id: number | null;
  judul: string;
  jenis: string;
  nomor: string;
  tahun: number;
  snippet: string;
  confidence: number;
}

export interface RagResponse {
  answer: string;
  sources: RagSourceRaw[];
  confidence: number;
}

export interface RagSource {
  regulasiId: string;
  judul: string;
  jenis: string;
  nomor: string;
  tahun: number;
  pasal: string;
  isi: string;
  score: number;
}

/** POST /api/chat - dipakai halaman Tanya REGS */
export async function askRegsidaAPI(query: string): Promise<RagResponse> {
  const sessionId = getOrCreateSessionId();
  const response = await api.post<RagResponse>("/chat", { query, session_id: sessionId });
  return response.data;
}

export interface VerifyClaimResponse {
  id: number;
  hasil_verifikasi: "ditemukan" | "tidak_ditemukan" | "sebagian_sesuai";
  answer: string;
  sources: RagSourceRaw[];
  confidence: number;
  show_lapor_cta: boolean;
}

/** POST /api/verify-claim - dipakai halaman Verifikasi Klaim */
export async function verifyClaimAPI(
  klaimText: string,
  opts?: { layanan?: string; kecamatan?: string }
): Promise<VerifyClaimResponse> {
  const sessionId = getOrCreateSessionId();
  const response = await api.post<VerifyClaimResponse>("/verify-claim", {
    session_id: sessionId,
    klaim_text: klaimText,
    layanan: opts?.layanan,
    kecamatan: opts?.kecamatan,
  });
  return response.data;
}

export { getErrorMessage };
