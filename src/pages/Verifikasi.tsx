import { useState } from "react";
import { ShieldAlert, CheckCircle2, XCircle, ExternalLink, Mic, Square, User } from "lucide-react";
import { verifyClaimAPI, getErrorMessage, VerifyClaimResponse } from "../lib/rag-api";
import { useVoiceInput } from "../lib/voice";
import { Link } from "react-router-dom";
import { useCitizenAuth } from "../context/CitizenAuthContext";

export default function Verifikasi() {
  const { citizen } = useCitizenAuth();
  const [claim, setClaim] = useState("");
  const [result, setResult] = useState<VerifyClaimResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isListening, transcript, isSupported, start, stop } = useVoiceInput();

  function handleVoiceToggle() {
    if (isListening) {
      stop();
      if (transcript) setClaim(transcript);
    } else {
      start();
    }
  }

  async function handleCheck() {
    if (!claim.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await verifyClaimAPI(claim);
      setResult(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const notFound = result?.hasil_verifikasi === "tidak_ditemukan";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sirah-100 text-sirah-700">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink-900">Verifikasi Klaim Petugas</h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-600">
          Diminta membayar biaya atau memenuhi prosedur yang terasa tidak biasa? Tuliskan
          atau ucapkan klaim tersebut, dan REGSIDA akan memeriksa apakah hal itu benar-benar
          diatur dalam regulasi resmi Kabupaten Sidoarjo.
        </p>
        {citizen && (
          <div className="mt-4 mx-auto max-w-xl flex items-center justify-center gap-2 rounded-lg border border-brass-200 bg-brass-50 px-3 py-2 text-xs text-brass-800">
            <User className="h-3.5 w-3.5" />
            <span>Kamu masuk sebagai <strong>{citizen.name}</strong> — klaimmu akan tercatat atas namamu.</span>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-brass-200 bg-brass-50 px-4 py-3 text-sm text-brass-800">
        <strong>Penting:</strong> Fitur ini untuk memverifikasi apakah klaim petugas memiliki dasar hukum.
        Hasil verifikasi ini akan dicatat dan digunakan sebagai indikator pengawasan oleh Inspektorat.
        Jika Anda hanya ingin mencari informasi regulasi, silakan gunakan fitur <Link to="/tanya" className="font-medium underline">Tanya REGS</Link>.
      </div>

      <div className="mt-8 rounded-2xl border border-ink-200 bg-white p-6 shadow-card sm:p-8">
        <label className="text-sm font-medium text-ink-700">Tuliskan klaim yang disampaikan petugas</label>
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-ink-200 p-2 focus-within:border-brass-400">
          <textarea
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder='Contoh: "Petugas minta biaya tambahan Rp150.000 untuk percepatan proses izin usaha mikro."'
            rows={3}
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
          {isSupported && (
            <button
              onClick={handleVoiceToggle}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                isListening ? "bg-sirah-500 text-white animate-pulse-ring" : "bg-ink-100 text-ink-600 hover:bg-ink-200"
              }`}
            >
              {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}
        </div>

        <button
          onClick={handleCheck}
          disabled={!claim.trim() || loading}
          className="mt-4 w-full rounded-lg bg-sirah-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-sirah-800 disabled:opacity-30"
        >
          {loading ? "Memproses Verifikasi..." : "Verifikasi & Catat Klaim Ini"}
        </button>

        {error && <p className="mt-3 text-sm text-sirah-700">{error}</p>}
      </div>

      {result && (
        <div
          className={`mt-6 rounded-2xl border p-6 sm:p-8 ${
            notFound ? "border-sirah-300 bg-sirah-50" : "border-sawo-300 bg-sawo-50"
          }`}
        >
          <div className="mb-4 rounded-lg bg-white px-4 py-3 text-sm text-ink-800 border border-ink-200">
            <span className="font-medium">Nomor Referensi Verifikasi:</span> <span className="font-mono text-brass-700">#{result.id}</span>
          </div>
          <div className="flex items-start gap-3">
            {notFound ? (
              <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-sirah-600" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-sawo-600" />
            )}
            <div className="flex-1">
              <h3 className={`font-display text-lg font-semibold ${notFound ? "text-sirah-800" : "text-sawo-800"}`}>
                {notFound ? "Tidak Ditemukan dalam Regulasi" : "Regulasi Terkait Ditemukan"}
              </h3>
              <p className={`mt-2 text-sm leading-relaxed ${notFound ? "text-sirah-700" : "text-sawo-700"}`}>
                {result.answer}
              </p>

              {result.sources.length > 0 && (
                <div className="mt-4 space-y-2">
                  {result.sources.map((s, i) => (
                    <Link
                      key={i}
                      to={`/regulasi/${s.regulation_id}`}
                      className="flex items-center justify-between rounded-md border border-white/60 bg-white/60 px-3.5 py-2.5 text-sm hover:bg-white"
                    >
                      <span className="font-medium text-ink-700">
                        {s.jenis} No. {s.nomor}/{s.tahun} — {s.judul}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-ink-400" />
                    </Link>
                  ))}
                </div>
              )}

              {result.show_lapor_cta && (
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <a
                    href="https://www.lapor.go.id"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-md bg-sirah-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sirah-800"
                  >
                    Laporkan via SP4N-LAPOR! <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <span className="flex items-center text-xs text-sirah-600">
                    Anda berhak meminta dasar hukum tertulis sebelum membayar.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-ink-200 bg-ink-50/60 p-5 text-xs leading-relaxed text-ink-500">
        Data hasil pemeriksaan pada fitur ini dicatat dan diagregasi pada
        Dasbor Inspektorat sebagai indikator dini pengawasan layanan publik.
      </div>
    </div>
  );
}
