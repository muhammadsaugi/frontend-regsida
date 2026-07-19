import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { User, AlertTriangle } from "lucide-react";
import { useCitizenAuth } from "../context/CitizenAuthContext";

export default function CitizenLogin() {
  const { login } = useCitizenAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-900">
          <User className="h-6 w-6 text-brass-400" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Masuk ke Akun Warga</h1>
        <p className="mt-1 text-sm text-ink-500">Masuk untuk menyimpan riwayat interaksi Anda dengan REGSIDA.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
        {error && (
          <div className="flex items-start gap-2 rounded-md border border-sirah-200 bg-sirah-50 p-3 text-sm text-sirah-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brass-400 focus:outline-none"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brass-400 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-ink-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-800 disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-ink-500">
        Belum punya akun? <Link to="/daftar" className="text-ink-900 font-medium hover:underline">Daftar sekarang</Link>
      </div>

      <Link to="/" className="mt-4 text-center text-sm text-ink-500 hover:text-ink-800">
        ← Kembali ke Beranda
      </Link>
    </div>
  );
}
