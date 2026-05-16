import { ClipboardCheck, FileText, Loader2, Upload, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { muuSmartApi } from "../api/muuSmartApi";
import { defaultDocumentDraft } from "../data/marketplaceOptions";
import type { ApiRecord, DocumentDraft, Session } from "../types";
import { getPublicationId, getPublicationTitle } from "../utils/publication";
import { getErrorMessage, readString } from "../utils/records";

type DocumentsModalProps = {
  onClose: () => void;
  publication: ApiRecord;
  session: Session;
  setNotice: (message: string) => void;
};

export function DocumentsModal({
  onClose,
  publication,
  session,
  setNotice,
}: DocumentsModalProps) {
  const [documents, setDocuments] = useState<ApiRecord[]>([]);
  const [draft, setDraft] = useState<DocumentDraft>(defaultDocumentDraft);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const publicationId = getPublicationId(publication);

  const loadDocuments = useCallback(async () => {
    if (!publicationId) return;

    setIsLoading(true);
    setError("");
    try {
      setDocuments(await muuSmartApi.getSanitaryDocuments(publicationId, session));
    } catch (documentError) {
      setError(getErrorMessage(documentError));
    } finally {
      setIsLoading(false);
    }
  }, [publicationId, session]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const update = <K extends keyof DocumentDraft>(key: K, value: DocumentDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const submitDocument = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await muuSmartApi.createSanitaryDocument(
        publicationId,
        {
          publicationId,
          documentType: draft.documentType,
          documentNumber: draft.documentNumber,
          issuedBy: draft.issuedBy,
          issuedAt: new Date(draft.issuedAt).toISOString(),
          expiresAt: draft.expiresAt ? new Date(draft.expiresAt).toISOString() : null,
          notes: draft.notes,
        },
        session,
      );
      setNotice("Documento sanitario registrado.");
      setDraft(defaultDocumentDraft);
      loadDocuments();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-panel wide-modal">
        <button className="close-button" type="button" onClick={onClose} aria-label="Cerrar">
          <X size={20} aria-hidden="true" />
        </button>
        <span className="section-kicker">Expediente sanitario</span>
        <h2>{getPublicationTitle(publication)}</h2>

        <div className="documents-grid">
          <div>
            <div className="documents-head">
              <FileText size={20} aria-hidden="true" />
              <h3>Documentos</h3>
            </div>
            {isLoading ? (
              <div className="loading-state compact">
                <Loader2 className="spin" size={24} aria-hidden="true" />
                Cargando...
              </div>
            ) : (
              <div className="documents-list">
                {documents.map((document, index) => (
                  <div className="document-row" key={readString(document, ["id"]) || index}>
                    <ClipboardCheck size={18} aria-hidden="true" />
                    <div>
                      <strong>
                        {readString(document, ["documentType"], "Documento sanitario")}
                      </strong>
                      <span>
                        {readString(document, ["documentNumber"], "Sin numero")} -{" "}
                        {readString(document, ["issuedBy"], "Emisor no indicado")}
                      </span>
                    </div>
                  </div>
                ))}
                {!documents.length && <p className="muted-copy">Sin documentos publicados.</p>}
              </div>
            )}
          </div>

          <form className="document-form" onSubmit={submitDocument}>
            <h3>Cargar documento</h3>
            <label>
              Tipo
              <input
                required
                value={draft.documentType}
                onChange={(event) => update("documentType", event.target.value)}
              />
            </label>
            <label>
              Numero
              <input
                required
                value={draft.documentNumber}
                onChange={(event) => update("documentNumber", event.target.value)}
              />
            </label>
            <label>
              Emitido por
              <input
                required
                value={draft.issuedBy}
                onChange={(event) => update("issuedBy", event.target.value)}
              />
            </label>
            <div className="two-column">
              <label>
                Emision
                <input
                  required
                  type="date"
                  value={draft.issuedAt}
                  onChange={(event) => update("issuedAt", event.target.value)}
                />
              </label>
              <label>
                Vence
                <input
                  type="date"
                  value={draft.expiresAt}
                  onChange={(event) => update("expiresAt", event.target.value)}
                />
              </label>
            </div>
            <label>
              Notas
              <textarea
                rows={3}
                value={draft.notes}
                onChange={(event) => update("notes", event.target.value)}
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button className="secondary-button wide" disabled={isSubmitting} type="submit">
              {isSubmitting ? <Loader2 className="spin" size={18} /> : <Upload size={18} />}
              Guardar documento
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
