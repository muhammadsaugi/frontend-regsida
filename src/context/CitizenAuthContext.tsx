import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, getErrorMessage } from "../lib/api";

export interface CitizenUser {
  id: number;
  name: string;
  email: string;
}

interface CitizenAuthContextValue {
  citizen: CitizenUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const CitizenAuthContext = createContext<CitizenAuthContextValue | undefined>(undefined);

const CITIZEN_TOKEN_KEY = "regsida_citizen_token";
const CITIZEN_USER_KEY = "regsida_citizen_user";

export function CitizenAuthProvider({ children }: { children: ReactNode }) {
  const [citizen, setCitizen] = useState<CitizenUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(CITIZEN_TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .get<CitizenUser>("/citizen/me")
      .then((res) => setCitizen(res.data))
      .catch(() => {
        localStorage.removeItem(CITIZEN_TOKEN_KEY);
        localStorage.removeItem(CITIZEN_USER_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    try {
      const res = await api.post<{ citizen: CitizenUser; token: string }>("/citizen/login", { email, password });
      localStorage.setItem(CITIZEN_TOKEN_KEY, res.data.token);
      localStorage.setItem(CITIZEN_USER_KEY, JSON.stringify(res.data.citizen));
      setCitizen(res.data.citizen);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      const res = await api.post<{ citizen: CitizenUser; token: string }>("/citizen/register", { name, email, password });
      localStorage.setItem(CITIZEN_TOKEN_KEY, res.data.token);
      localStorage.setItem(CITIZEN_USER_KEY, JSON.stringify(res.data.citizen));
      setCitizen(res.data.citizen);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }

  async function logout() {
    try {
      await api.post("/citizen/logout");
    } catch {
      // Tetap hapus sesi lokal walau request logout gagal
    }
    localStorage.removeItem(CITIZEN_TOKEN_KEY);
    localStorage.removeItem(CITIZEN_USER_KEY);
    setCitizen(null);
  }

  return <CitizenAuthContext.Provider value={{ citizen, isLoading, login, register, logout }}>{children}</CitizenAuthContext.Provider>;
}

export function useCitizenAuth(): CitizenAuthContextValue {
  const ctx = useContext(CitizenAuthContext);
  if (!ctx) throw new Error("useCitizenAuth harus dipakai di dalam <CitizenAuthProvider>");
  return ctx;
}
