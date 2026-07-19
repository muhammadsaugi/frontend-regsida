import axios, { AxiosError } from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8001";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 35_000, // generate jawaban AI kadang butuh 10-15 detik
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Sisipkan token ASN atau Citizen otomatis ke tiap request
api.interceptors.request.use((config) => {
  // Prioritize ASN token for /admin routes
  if (config.url?.startsWith("/admin") || config.url?.startsWith("/auth")) {
    const token = localStorage.getItem("regsida_asn_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    // For other routes, try citizen token first
    const citizenToken = localStorage.getItem("regsida_citizen_token");
    const asnToken = localStorage.getItem("regsida_asn_token");
    if (citizenToken) {
      config.headers.Authorization = `Bearer ${citizenToken}`;
    } else if (asnToken) {
      config.headers.Authorization = `Bearer ${asnToken}`;
    }
  }
  return config;
});

// Kalau token invalid/expired (401), bersihkan sesi otomatis
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Clear both tokens just in case
      localStorage.removeItem("regsida_asn_token");
      localStorage.removeItem("regsida_asn_user");
      localStorage.removeItem("regsida_citizen_token");
      localStorage.removeItem("regsida_citizen_user");
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    if (axiosError.response?.status === 403) return "Kamu tidak punya akses ke fitur ini.";
    if (axiosError.response?.status === 422) return "Data yang dikirim tidak valid.";
    if (!axiosError.response) return "Tidak bisa terhubung ke server. Cek koneksi kamu.";
    return "Terjadi kesalahan pada server. Silakan coba lagi.";
  }
  return "Terjadi kesalahan yang tidak diketahui.";
}
