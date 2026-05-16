import { useMemo, useState } from "react";
import type { Session } from "../types";

const SESSION_KEY = "muusmart-market-session-v2";

function readStoredSession(): Session {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return {};

  try {
    const session = JSON.parse(stored) as Session;
    if ((session.email || session.token) && !session.role) {
      return { ...session, role: "buyer" };
    }
    return session;
  } catch {
    return {};
  }
}

export function useSession() {
  const [session, setSession] = useState<Session>(readStoredSession);

  const isAuthenticated = Boolean(session.email || session.token);

  const actions = useMemo(
    () => ({
      saveSession(next: Session) {
        setSession(next);
        localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      },
      updateSession(patch: Session) {
        setSession((current) => {
          const next = { ...current, ...patch };
          localStorage.setItem(SESSION_KEY, JSON.stringify(next));
          return next;
        });
      },
      logout() {
        setSession({});
        localStorage.removeItem(SESSION_KEY);
      },
    }),
    [],
  );

  return { session, isAuthenticated, ...actions };
}
