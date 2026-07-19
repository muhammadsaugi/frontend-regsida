import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, getErrorMessage } from "../lib/api";

export type AsnRole = "staf_opd" | "bagian_hukum" | "inspektorat";

export interface AsnUser {
  id: number;
  name: string;
  nip: string;
  role: AsnRole;
  opd: string | null;
}

interface AsnAuthContextValue {
  user: AsnUser | null;
  isLoading: boolean;
  login: (nip: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AsnAuthContext = createContext<AsnAuthContextValue | undefined>(undefined);

const ASN_TOKEN_KEY = "regsida_asn_token";
const ASN_USER_KEY = "regsida_asn_user";

export function AsnAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AsnUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Saat aplikasi dibuka, cek apakah ada sesi ASN tersimpan & masih valid
  useEffect(() => {
    const token = localStorage.getItem(ASN_TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .get<AsnUser>("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem(ASN_TOKEN_KEY);
        localStorage.removeItem(ASN_USER_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(nip: string, password: string) {
    try {
      const res = await api.post<{ user: AsnUser; token: string }>("/auth/login", { nip, password });
      localStorage.setItem(ASN_TOKEN_KEY, res.data.token);
      localStorage.setItem(ASN_USER_KEY, JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // Tetap hapus sesi lokal walau request logout gagal (mis. token sudah expired)
    }
    localStorage.removeItem(ASN_TOKEN_KEY);
    localStorage.removeItem(ASN_USER_KEY);
    setUser(null);
  }

  return <AsnAuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AsnAuthContext.Provider>;
}

export function useAsnAuth(): AsnAuthContextValue {
  const ctx = useContext(AsnAuthContext);
  if (!ctx) throw new Error("useAsnAuth harus dipakai di dalam <AsnAuthProvider>");
  return ctx;
}
