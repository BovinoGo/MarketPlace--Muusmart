import { ClipboardCheck, FileText, Loader2, Upload, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { muuSmartApi } from "../api/muuSmartApi";
import { defaultDocumentDraft } from "../data/marketplaceOptions";
import type { ApiRecord, DocumentDraft, Session } from "../types";
import { getPublicationId, getPublicationTitle } from "../utils/publication";
import { getErrorMessage, readString } from "../utils/records";
import "../styles/documentsModal.css";
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
    <div className="modern-modal-backdrop" role="dialog" aria-modal="true">
      <div className="modern-modal-panel">
        <div className="modern-modal-header">
          <div>
            <span className="modern-kicker">Expediente sanitario</span>
            <h2 className="modern-title">{getPublicationTitle(publication)}</h2>
          </div>
          <button className="modern-close-btn" type="button" onClick={onClose} aria-label="Cerrar">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Cuerpo del modal (2 columnas) */}
        <div className="modern-modal-body">
          {/* Columna Izquierda: Lista */}
          <div className="modern-list-section">
            <div className="modern-section-head">
              <div className="icon-wrapper blue">
                <FileText size={20} aria-hidden="true" />
              </div>
              <h3>Documentos Activos</h3>
            </div>

            {isLoading ? (
              <div className="modern-loading">
                <Loader2 className="spin-icon" size={32} aria-hidden="true" />
                <span>Cargando documentos...</span>
              </div>
            ) : (
              <div className="modern-documents-list">
                {documents.map((document, index) => (
                  <div className="modern-document-card" key={readString(document, ["id"]) || index}>
                    <div className="icon-wrapper green">
                      <ClipboardCheck size={18} aria-hidden="true" />
                    </div>
                    <div className="modern-document-info">
                      <strong>{readString(document, ["documentType"], "Documento sanitario")}</strong>
                      <span className="modern-document-meta">
                        <span className="mono-badge">
                          {readString(document, ["documentNumber"], "Sin numero")}
                        </span>
                        {" • "}
                        {readString(document, ["issuedBy"], "Emisor no indicado")}
                      </span>
                    </div>
                  </div>
                ))}
                {!documents.length && (
                  <div className="modern-empty-state">
                    <p>Aún no hay documentos sanitarios publicados.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Columna Derecha: Formulario */}
          <div className="modern-form-section">
            <form onSubmit={submitDocument}>
              <div className="modern-form-header">
                <h3>Cargar nuevo documento</h3>
                <p>Ingresa los datos del certificado o documento sanitario.</p>
              </div>

              <div className="modern-form-group">
                <label>Tipo de documento</label>
                <input
                  required
                  placeholder="Ej. Certificado de Vacunación"
                  value={draft.documentType}
                  onChange={(event) => update("documentType", event.target.value)}
                />
              </div>

              <div className="modern-form-group">
                <label>Número de documento</label>
                <input
                  required
                  placeholder="N° de folio o registro"
                  value={draft.documentNumber}
                  onChange={(event) => update("documentNumber", event.target.value)}
                />
              </div>

              <div className="modern-form-group">
                <label>Emitido por</label>
                <input
                  required
                  placeholder="Institución o veterinario"
                  value={draft.issuedBy}
                  onChange={(event) => update("issuedBy", event.target.value)}
                />
              </div>

              <div className="modern-form-row">
                <div className="modern-form-group">
                  <label>Fecha de emisión</label>
                  <input
                    required
                    type="date"
                    value={draft.issuedAt}
                    onChange={(event) => update("issuedAt", event.target.value)}
                  />
                </div>
                <div className="modern-form-group">
                  <label>Vencimiento (opcional)</label>
                  <input
                    type="date"
                    value={draft.expiresAt}
                    onChange={(event) => update("expiresAt", event.target.value)}
                  />
                </div>
              </div>

              <div className="modern-form-group">
                <label>Notas adicionales</label>
                <textarea
                  rows={3}
                  placeholder="Detalles relevantes del documento..."
                  value={draft.notes}
                  onChange={(event) => update("notes", event.target.value)}
                />
              </div>

              {error && <div className="modern-error-msg">{error}</div>}

              <button className="modern-submit-btn" disabled={isSubmitting} type="submit">
                {isSubmitting ? <Loader2 className="spin-icon" size={18} /> : <Upload size={18} />}
                {isSubmitting ? "Guardando..." : "Guardar documento"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}