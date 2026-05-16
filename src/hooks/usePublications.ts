import { useCallback, useEffect, useMemo, useState } from "react";
import { muuSmartApi } from "../api/muuSmartApi";
import type { ApiRecord, SortMode } from "../types";
import { getPublicationDate, getPublicationDescription, getPublicationPurpose, getPublicationTitle } from "../utils/publication";
import { getErrorMessage, readBoolean, readNumber } from "../utils/records";

export function usePublications() {
  const [publications, setPublications] = useState<ApiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("Todos");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [onlyTransport, setOnlyTransport] = useState(false);
  const [onlySanitary, setOnlySanitary] = useState(false);

  const loadPublications = useCallback(async () => {
    setIsLoading(true);
    setApiError("");

    try {
      setPublications(await muuSmartApi.getPublications());
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPublications();
  }, [loadPublications]);

  const purposes = useMemo(() => {
    const unique = new Set(publications.map(getPublicationPurpose).filter(Boolean));
    return ["Todos", ...Array.from(unique)];
  }, [publications]);

  const filteredPublications = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    const filtered = publications.filter((publication) => {
      const searchable = [
        getPublicationTitle(publication),
        getPublicationDescription(publication),
        getPublicationPurpose(publication),
      ]
        .join(" ")
        .toLowerCase();
      const purpose = getPublicationPurpose(publication);

      return (
        (!cleanQuery || searchable.includes(cleanQuery)) &&
        (selectedPurpose === "Todos" ||
          purpose.toLowerCase() === selectedPurpose.toLowerCase()) &&
        (!onlyTransport || readBoolean(publication, ["includesTransport"])) &&
        (!onlySanitary || readBoolean(publication, ["requiresSanitaryDocumentation"]))
      );
    });

    return filtered.sort((left, right) => {
      if (sortMode === "priceAsc") {
        return readNumber(left, ["price"]) - readNumber(right, ["price"]);
      }
      if (sortMode === "priceDesc") {
        return readNumber(right, ["price"]) - readNumber(left, ["price"]);
      }
      return getPublicationDate(right) - getPublicationDate(left);
    });
  }, [onlySanitary, onlyTransport, publications, query, selectedPurpose, sortMode]);

  const averagePrice = useMemo(() => {
    if (!publications.length) return 0;
    const total = publications.reduce(
      (sum, publication) => sum + readNumber(publication, ["price"]),
      0,
    );
    return Math.round(total / publications.length);
  }, [publications]);

  return {
    apiError,
    averagePrice,
    filteredPublications,
    isLoading,
    loadPublications,
    onlySanitary,
    onlyTransport,
    publications,
    purposes,
    query,
    selectedPurpose,
    setOnlySanitary,
    setOnlyTransport,
    setQuery,
    setSelectedPurpose,
    setSortMode,
    sortMode,
  };
}
