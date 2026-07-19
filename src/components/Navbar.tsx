import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Search, LogOut, User } from "lucide-react";
import { useAsnAuth } from "../context/AsnAuthContext";
import { useCitizenAuth } from "../context/CitizenAuthContext";

const navLinks = [
  { to: "/", label: "Beranda" },
  { to: "/cari", label: "Cari Regulasi" },
  { to: "/tanya", label: "Tanya REGS" },
  { to: "/verifikasi", label: "Verifikasi Klaim" },
];

const adminLinks = [
  { to: "/admin", label: "Dasbor Hukum" },
  { to: "/admin/graf", label: "Graf Regulasi" },
  { to: "/admin/decay", label: "Decay Tracker" },
  { to: "/admin/inspektorat", label: "Inspektorat" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user: asnUser, logout: asnLogout } = useAsnAuth();
  const { citizen, logout: citizenLogout } = useCitizenAuth();
  const isAdminArea = location.pathname.startsWith("/admin");

  async function handleAsnLogout() {
    await asnLogout();
    navigate("/");
  }

  async function handleCitizenLogout() {
    await citizenLogout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100/80 bg-white/70 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="/logoregsida.png" 
            alt="Logo REGSIDA Kabupaten Sidoarjo" 
            className="h-12 sm:h-14 w-auto object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {(isAdminArea ? adminLinks : navLinks).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                location.pathname === l.to
                  ? "bg-gradient-to-r from-brass-700 to-brass-600 text-white shadow-md shadow-brass-200"
                  : "text-ink-600 hover:bg-ink-100 hover:text-ink-900 hover:shadow-sm"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {!isAdminArea ? (
            <>
              {citizen ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-100">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brass-600 to-brass-500 flex items-center justify-center text-white text-xs font-semibold">
                      {citizen.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-ink-700 font-medium">
                      {citizen.name}
                    </span>
                  </div>
                  <button
                    onClick={handleCitizenLogout}
                    className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition-all hover:border-sirah-300 hover:bg-sirah-50 hover:shadow-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </>
              ) : (
                <Link
                  to="/masuk"
                  className="flex items-center gap-1.5 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-ink-800 hover:shadow-lg"
                >
                  <User className="h-4 w-4" />
                  Masuk / Daftar
                </Link>
              )}
            </>
          ) : (
            <>
              {asnUser && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-100">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brass-600 to-brass-500 flex items-center justify-center text-white text-xs font-semibold">
                    {asnUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-ink-700">
                    {asnUser.name} · <span className="font-medium text-ink-900">{asnUser.role}</span>
                  </span>
                </div>
              )}
              <Link
                to="/"
                className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition-all hover:border-ink-300 hover:bg-ink-50 hover:shadow-sm"
              >
                <Search className="h-4 w-4" />
                Portal Warga
              </Link>
              {asnUser && (
                <button
                  onClick={handleAsnLogout}
                  className="flex items-center gap-1.5 rounded-xl border border-sirah-200 bg-white px-4 py-2.5 text-sm font-medium text-sirah-700 transition-all hover:border-sirah-300 hover:bg-sirah-50 hover:shadow-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              )}
            </>
          )}
        </div>

        <button
          className="rounded-xl p-2 text-ink-700 hover:bg-ink-100 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Buka menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-100 bg-white/95 backdrop-blur-xl px-4 py-4 shadow-xl lg:hidden">
          <nav className="flex flex-col gap-2">
            {(isAdminArea ? adminLinks : navLinks).map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  location.pathname === l.to
                    ? "bg-gradient-to-r from-brass-700 to-brass-600 text-white"
                    : "text-ink-700 hover:bg-ink-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {!isAdminArea ? (
              citizen ? (
                <button
                  onClick={() => {
                    setOpen(false);
                    handleCitizenLogout();
                  }}
                  className="mt-2 rounded-xl border border-sirah-200 px-4 py-3 text-left text-sm font-medium text-sirah-700 hover:bg-sirah-50"
                >
                  Keluar
                </button>
              ) : (
                <Link
                  to="/masuk"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-xl bg-ink-900 px-4 py-3 text-sm font-medium text-white"
                >
                  Masuk / Daftar
                </Link>
              )
            ) : (
              <>
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-xl border border-ink-200 px-4 py-3 text-sm font-medium text-ink-700"
                >
                  Portal Warga
                </Link>
                {asnUser && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleAsnLogout();
                    }}
                    className="mt-2 rounded-xl border border-sirah-200 px-4 py-3 text-left text-sm font-medium text-sirah-700"
                  >
                    Keluar
                  </button>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
