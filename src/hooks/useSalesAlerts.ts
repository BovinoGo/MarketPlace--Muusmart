import { useCallback, useEffect, useRef, useState } from "react";
import { muuSmartApi } from "../api/muuSmartApi";
import type { ApiRecord, Session } from "../types";
import { getPublicationId } from "../utils/publication";
import { isSellerRole } from "../utils/roles";

const POLL_INTERVAL_MS = 45_000;

export function useSalesAlerts(session: Session) {
  const [requestsByPublication, setRequestsByPublication] = useState<Record<string, ApiRecord[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!isSellerRole(session.role) || !session.token || isFetchingRef.current) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const mine = await muuSmartApi.getMyPublications(session);
      const entries = await Promise.all(
        mine.map(async (publication) => {
          const publicationId = getPublicationId(publication);
          if (!publicationId) return null;
          try {
            const requests = await muuSmartApi.getPurchaseRequests(publicationId, session);
            return [publicationId, requests] as const;
          } catch {
            return [publicationId, []] as const;
          }
        }),
      );
      setRequestsByPublication(
        Object.fromEntries(entries.filter((entry): entry is readonly [string, ApiRecord[]] => entry !== null)),
      );
    } catch {
      // Silencioso: los paneles principales ya muestran sus propios errores de red.
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!isSellerRole(session.role) || !session.token) {
      setRequestsByPublication({});
      return;
    }

    refresh();
    const timer = window.setInterval(refresh, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [refresh, session.role, session.token]);

  const totalInterested = Object.values(requestsByPublication).reduce(
    (sum, requests) => sum + requests.length,
    0,
  );

  return { requestsByPublication, totalInterested, isLoading, refresh };
}