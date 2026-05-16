import { Loader2, Send, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { muuSmartApi } from "../api/muuSmartApi";
import type { ApiRecord, PurchaseDraft, Session } from "../types";
import { getPublicationDescription, getPublicationId, getPublicationTitle } from "../utils/publication";
import { getErrorMessage } from "../utils/records";

type PurchaseModalProps = {
  onClose: () => void;
  publication: ApiRecord;
  session: Session;
  setNotice: (message: string) => void;
};

export function PurchaseModal({
  onClose,
  publication,
  session,
  setNotice,
}: PurchaseModalProps) {
  const [draft, setDraft] = useState<PurchaseDraft>({
    buyerId: session.userId ?? "",
    message: `Hola, estoy interesado en ${getPublicationTitle(publication)}. Quisiera coordinar una visita y revisar la documentacion.`,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const publicationId = getPublicationId(publication);

  const submitPurchase = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await muuSmartApi.createPurchaseRequest(
        publicationId,
        {
          publicationId,
          buyerId: draft.buyerId,
          message: draft.message,
        },
        session,
      );
      setNotice("Solicitud de compra enviada.");
      onClose();
    } catch (purchaseError) {
      setError(getErrorMessage(purchaseError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="modal-panel" onSubmit={submitPurchase}>
        <button className="close-button" type="button" onClick={onClose} aria-label="Cerrar">
          <X size={20} aria-hidden="true" />
        </button>
        <span className="section-kicker">Solicitud de compra</span>
        <h2>{getPublicationTitle(publication)}</h2>
        <p>{getPublicationDescription(publication)}</p>

        <label>
          Buyer ID
          <input
            required
            value={draft.buyerId}
            onChange={(event) => setDraft((current) => ({ ...current, buyerId: event.target.value }))}
            placeholder="UUID del comprador"
          />
        </label>

        <label>
          Mensaje al vendedor
          <textarea
            required
            rows={5}
            value={draft.message}
            onChange={(event) => setDraft((current) => ({ ...current, message: event.target.value }))}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="primary-button wide" disabled={isSubmitting || !publicationId} type="submit">
          {isSubmitting ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
          Enviar solicitud
        </button>
      </form>
    </div>
  );
}
