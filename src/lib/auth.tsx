import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AUTH_EVENT, getCurrentUser, type LocalUser } from "./local-db";

type AuthValue = {
  session: { user: LocalUser } | null;
  user: LocalUser | null;
  loading: boolean;
};

const AuthContext = createContext<AuthValue>({ session: null, user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => {
      getCurrentUser()
        .then(setUser)
        .finally(() => setLoading(false));
    };
    sync();
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session: user ? { user } : null, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
