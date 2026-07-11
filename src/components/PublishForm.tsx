import { Loader2, ShieldCheck, Upload } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { muuSmartApi } from "../api/muuSmartApi";
import { defaultPublishForm} from "../data/marketplaceOptions";
import type { PublishFormState, Session } from "../types";
import { getErrorMessage } from "../utils/records";
import { DocumentsModal } from "./DocumentsModal";

type PublishFormProps = {
  onPublished: () => void;
  session: Session;
};

export function PublishForm({ onPublished, session }: PublishFormProps) {
  const [form, setForm] = useState<PublishFormState>(() =>
    defaultPublishForm(session.userId),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showDocModal, setShowDocModal] = useState(false);

  useEffect(() => {
    if (session.role !== "rancher") return;
    setForm((current) => ({
      ...current,
      sellerId: current.sellerId || session.userId || "",
    }));
  }, [session.role, session.userId]);

  if (session.role !== "rancher") {
    return (
      <section className="publish-section">
        <div className="seller-locked-panel">
          <ShieldCheck size={34} aria-hidden="true" />
          <strong>Solo los ganaderos pueden publicar bovinos.</strong>
        </div>
      </section>
    );
  }

  const update = <K extends keyof PublishFormState>(key: K, value: PublishFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      // Convertimos explícitamente los campos necesarios
      await muuSmartApi.publishBovine(
        {
          ...form,
          price: Number(form.price),
          salePurpose: Number(form.salePurpose),
          contactPreference: Number(form.contactPreference),
        },
        session
      );
      
      setForm(defaultPublishForm(session.userId));
      onPublished();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const initiateSubmission = (e: FormEvent) => {
    e.preventDefault();
    if (form.requiresSanitaryDocumentation) {
      setShowDocModal(true);
    } else {
      handlePublish();
    }
  };

  return (
    <>
      {showDocModal && (
        <DocumentsModal
          publication={{ id: form.bovineId, title: form.title }}
          session={session}
          onClose={() => setShowDocModal(false)}
          setNotice={(msg) => {
            setShowDocModal(false);
            handlePublish();
          }}
        />
      )}

      <section className="publish-section">
        <div className="section-heading">
          <h2>Publicar bovino</h2>
        </div>

        <form className="seller-form" onSubmit={initiateSubmission}>
          <div className="form-panel">
            <h3>Identificacion</h3>
            <label>Bovine ID <input required value={form.bovineId} onChange={(e) => update("bovineId", e.target.value)} /></label>
            <label>Ranch ID <input required value={form.ranchId} onChange={(e) => update("ranchId", e.target.value)} /></label>
            <label>Seller ID <input required value={form.sellerId} onChange={(e) => update("sellerId", e.target.value)} /></label>
          </div>

          <div className="form-panel">
            <h3>Oferta</h3>
            <label>Titulo <input required value={form.title} onChange={(e) => update("title", e.target.value)} /></label>
            <label>Descripcion <textarea required rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} /></label>
            <div className="two-column">
              <label>Precio <input required type="number" value={form.price} onChange={(e) => update("price", e.target.value)} /></label>
              <label>Moneda <input required value={form.currency} onChange={(e) => update("currency", e.target.value.toUpperCase())} /></label>
            </div>
          </div>

          <div className="form-panel">
            <h3>Condiciones</h3>
            <label className="check-row">
              <input type="checkbox" checked={form.requiresSanitaryDocumentation} onChange={(e) => update("requiresSanitaryDocumentation", e.target.checked)} />
              Requiere documentacion sanitaria
            </label>

            {error && <p className="form-error">{error}</p>}
            <button className="primary-button wide" disabled={isSubmitting} type="submit">
              {isSubmitting ? <Loader2 className="spin" size={18} /> : <Upload size={18} />}
              Publicar en MuuSmart
            </button>
          </div>
        </form>
      </section>
    </>
  );
}