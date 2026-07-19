import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAsnAuth, AsnRole } from "../context/AsnAuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AsnRole[]; // kosong/undefined = semua role ASN yang login boleh akses
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAsnAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-ink-500">
        Memeriksa sesi login...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/portal-asn/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-xl font-semibold text-ink-900">Akses Ditolak</h1>
        <p className="mt-2 text-sm text-ink-500">
          Akun kamu ({user.role}) tidak punya izin untuk mengakses halaman ini.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
