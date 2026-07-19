# REGSIDA — Regulasi Daerah Satu Data & AI Navigator

Prototipe untuk Kompetisi KMIPN VIII 2026, Kategori E-Government.
Implementasi atas nama **Kabupaten Sidoarjo**.

## Menjalankan secara lokal

Frontend membutuhkan backend Laravel dan AI-service FastAPI yang sudah berjalan.

```bash
# Terminal 1 — AI Service (port 8000)
cd ../ai-service
uvicorn main:app --reload

# Terminal 2 — Laravel Backend (port 8001)
cd ../backend
php artisan serve --port=8001

# Terminal 3 — Frontend React (port 5173)
npm install
cp .env.example .env.local   # sesuaikan VITE_API_URL jika perlu
npm run dev
```

Buka `http://localhost:5173`.

## Environment Variables

| Variable | Default | Keterangan |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8001` | URL backend Laravel (semua request API lewat sini) |

> **Catatan keamanan:** API key Gemini **tidak** disimpan di frontend. Semua panggilan AI (RAG, embedding, klasifikasi) di-handle oleh backend Laravel → FastAPI.

## Akun ASN demo (password semua: `password123`)

| Role | NIP |
|---|---|
| Staf OPD | `198501012010011001` |
| Bagian Hukum | `198703152011012002` |
| Inspektorat | `198209202009011003` |

## Deploy ke Vercel (frontend)

1. Push repo ke GitHub.
2. Import project di https://vercel.com — framework Vite, build `npm run build`, output `dist`.
3. Set environment variable `VITE_API_URL` ke URL backend Laravel production.
4. Deploy.

Backend (Laravel) dan AI-service (FastAPI) perlu di-deploy terpisah (mis. Railway/Render).

## Struktur fitur

- **Portal Warga**: Pencarian regulasi, Tanya REGS (chatbot + suara), Verifikasi Klaim Petugas (anti-pungli).
- **Portal ASN**: Dasbor tata kelola, Conflict Graph Engine, Regulatory Decay Tracker (closed-loop), Dasbor Inspektorat (heatmap pungli).

## Dokumentasi arsitektur

Lihat `REGSIDA_Ringkasan_Arsitektur_API.md` untuk konsep sistem, alur data end-to-end, dan dokumentasi API lengkap.
