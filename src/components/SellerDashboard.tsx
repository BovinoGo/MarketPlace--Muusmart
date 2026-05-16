import { CheckCircle2, Eye, Loader2, PackageCheck, RefreshCw, ShieldCheck, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { muuSmartApi } from "../api/muuSmartApi";
import type { ApiRecord, Session } from "../types";
import { formatMoney } from "../utils/format";
import { getImageFor, getPublicationDescription, getPublicationId, getPublicationPurpose, getPublicationTitle } from "../utils/publication";
import { getErrorMessage, readNumber, readString } from "../utils/records";

type SellerDashboardProps = {
  onChanged: () => void;
  session: Session;
};

export function SellerDashboard({ onChanged, session }: SellerDashboardProps) {
  const [mine, setMine] = useState<ApiRecord[]>([]);
  const [requests, setRequests] = useState<Record<string, ApiRecord[]>>({});
  const [sellerId, setSellerId] = useState(session.userId ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session.role !== "rancher") return;

    setSellerId(session.userId ?? "");
  }, [session.role, session.userId]);

  const loadMine = useCallback(async () => {
    if (session.role !== "rancher") return;

    if (!session.token) {
      setError("Guarda un token Bearer para consultar tus publicaciones privadas.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      setMine(await muuSmartApi.getMyPublications(session));
    } catch (mineError) {
      setError(getErrorMessage(mineError));
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session.role === "rancher" && session.token) {
      loadMine();
    }
  }, [loadMine, session.role, session.token]);

  if (session.role !== "rancher") {
    return (
      <section className="mine-section">
        <div className="seller-locked-panel">
          <ShieldCheck size={34} aria-hidden="true" />
          <strong>Este panel es solo para ganaderos.</strong>
          <span>Los compradores no administran publicaciones ni ventas.</span>
        </div>
      </section>
    );
  }

  const loadRequests = async (publication: ApiRecord) => {
    const publicationId = getPublicationId(publication);
    if (!publicationId) return;

    setError("");
    try {
      const response = await muuSmartApi.getPurchaseRequests(publicationId, session);
      setRequests((current) => ({ ...current, [publicationId]: response }));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const cancelPublication = async (publication: ApiRecord) => {
    const publicationId = getPublicationId(publication);
    if (!publicationId) return;

    setError("");
    try {
      await muuSmartApi.cancelPublication(publicationId, session);
      onChanged();
      loadMine();
    } catch (cancelError) {
      setError(getErrorMessage(cancelError));
    }
  };

  const confirmSale = async (publication: ApiRecord) => {
    const publicationId = getPublicationId(publication);
    if (!publicationId || !sellerId) {
      setError("Necesitas publicationId y sellerId para confirmar la venta.");
      return;
    }

    setError("");
    try {
      await muuSmartApi.confirmSale(publicationId, sellerId, session);
      onChanged();
      loadMine();
    } catch (confirmError) {
      setError(getErrorMessage(confirmError));
    }
  };

  const rejectRequest = async (request: ApiRecord) => {
    const requestId = readString(request, ["id", "purchaseRequestId"]);
    if (!requestId) return;

    setError("");
    try {
      await muuSmartApi.rejectPurchaseRequest(requestId, session);
      onChanged();
    } catch (rejectError) {
      setError(getErrorMessage(rejectError));
    }
  };

  return (
    <section className="mine-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Panel vendedor</span>
          <h2>Mis publicaciones</h2>
        </div>
        <button className="secondary-button" type="button" onClick={loadMine}>
          <RefreshCw size={18} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      <div className="form-panel seller-id-panel">
        <label>
          Seller ID para confirmar ventas
          <input
            value={sellerId}
            onChange={(event) => setSellerId(event.target.value)}
            placeholder="UUID del vendedor"
          />
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}
      {isLoading && (
        <div className="loading-state">
          <Loader2 className="spin" size={30} aria-hidden="true" />
          Consultando tus publicaciones...
        </div>
      )}

      <div className="mine-list">
        {mine.map((publication, index) => {
          const publicationId = getPublicationId(publication);
          const publicationRequests = requests[publicationId] ?? [];
          return (
            <article className="mine-item" key={publicationId || index}>
              <img alt={getPublicationTitle(publication)} src={getImageFor(publication, index)} />
              <div>
                <span className="purpose-label">{getPublicationPurpose(publication)}</span>
                <h3>{getPublicationTitle(publication)}</h3>
                <p>{getPublicationDescription(publication)}</p>
                <strong>
                  {formatMoney(
                    readNumber(publication, ["price"]),
                    readString(publication, ["currency"], "PEN"),
                  )}
                </strong>
              </div>
              <div className="mine-actions">
                <button type="button" onClick={() => loadRequests(publication)}>
                  <Eye size={17} aria-hidden="true" />
                  Solicitudes
                </button>
                <button type="button" onClick={() => confirmSale(publication)}>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  Confirmar
                </button>
                <button type="button" onClick={() => cancelPublication(publication)}>
                  <X size={17} aria-hidden="true" />
                  Cancelar
                </button>
              </div>

              {publicationRequests.length > 0 && (
                <div className="request-list">
                  {publicationRequests.map((request, requestIndex) => (
                    <div className="request-row" key={readString(request, ["id"]) || requestIndex}>
                      <span>{readString(request, ["message"], "Solicitud sin mensaje")}</span>
                      <button type="button" onClick={() => rejectRequest(request)}>
                        Rechazar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {!isLoading && session.token && !mine.length && !error && (
        <div className="empty-state">
          <PackageCheck size={28} aria-hidden="true" />
          <strong>No hay publicaciones propias.</strong>
          <span>Cuando publiques bovinos apareceran en este panel.</span>
        </div>
      )}
    </section>
  );
}
