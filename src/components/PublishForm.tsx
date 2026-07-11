import { Info, Loader2, ShieldCheck, CloudUpload } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { muuSmartApi } from "../api/muuSmartApi";
import { contactOptions, defaultPublishForm, salePurposeOptions } from "../data/marketplaceOptions";
import { RanchBovineFields } from "./RanchBovineFields";
import { DocumentsModal } from "./DocumentsModal"; 
import type { ApiRecord, PublishFormState, Session } from "../types";
import { getErrorMessage } from "../utils/records";
import { isSellerRole } from "../utils/roles";

type PublishFormProps = {
  onPublished: () => void;
  session: Session;
};

export function PublishForm({ onPublished, session }: PublishFormProps) {
  const [form, setForm] = useState<PublishFormState>(() => defaultPublishForm(session.userId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [error, setError] = useState("");
const [createdPublication, setCreatedPublication] = useState<ApiRecord | null>(null);

  useEffect(() => {
    if (!isSellerRole(session.role)) return;
    setForm((current) => ({
      ...current,
      sellerId: current.sellerId || session.userId || "",
    }));
  }, [session.role, session.userId]);

  if (!isSellerRole(session.role)) {
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
    setError("");
    try {
      // 1. Guardamos la publicación en la base de datos PRIMERO
      const response = await muuSmartApi.publishBovine(
        {
          ...form,
          price: Number(form.price),
          salePurpose: Number(form.salePurpose),
          contactPreference: Number(form.contactPreference),
        },
        session
      );

      // Asumiendo que la API te devuelve la publicación creada (con su ID real)
      const newPublication = response as ApiRecord; 

      // 2. Si requería documentos, abrimos el modal AHORA con el ID real
      if (form.requiresSanitaryDocumentation) {
        setCreatedPublication(newPublication); // Guardamos la data real
        setShowDocModal(true); // Abrimos el modal
      } else {
        // Si no requería documentos, terminamos el proceso
        setForm(defaultPublishForm(session.userId));
        onPublished();
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const initiateSubmission = (e: FormEvent) => {
    e.preventDefault();
    // Ya NO abrimos el modal aquí. Ejecutamos la publicación directamente.
    handlePublish();
  };
  return (
    <>
     {showDocModal && createdPublication && (
        <DocumentsModal
          // Ahora pasamos la publicación REAL que ya existe en la base de datos
          publication={createdPublication}
          session={session}
          onClose={() => {
            setShowDocModal(false);
            setForm(defaultPublishForm(session.userId));
            onPublished(); // Terminamos el flujo y actualizamos la lista
          }}
          setNotice={() => {
            // Se llama cuando el documento se sube con éxito
            setShowDocModal(false);
            setForm(defaultPublishForm(session.userId));
            onPublished();
          }}
        />
      )}

      <section className="publish-section">
        <div className="section-heading">
          <h2>Publicar bovino</h2>
          <p className="section-subtitle" style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
            Completa los datos para que los compradores puedan encontrar tu oferta.
          </p>
        </div>

        <form className="seller-form" onSubmit={initiateSubmission}>
          <div className="form-panel">
            <div className="panel-header">
              <h3>Identificación</h3>
            </div>
            <RanchBovineFields
              session={session}
              ranchId={form.ranchId}
              bovineId={form.bovineId}
              onRanchChange={(id) => update("ranchId", id)}
              onBovineChange={(id) => update("bovineId", id)}
            />
          </div>

          <div className="form-panel">
            <h3>Oferta</h3>
            <label>Título *
              <input required value={form.title} onChange={(e) => update("title", e.target.value)} />
            </label>
            <label>Descripción *
              <textarea required rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} />
            </label>
            <div className="two-column">
              <label>Precio *
                <input type="number" required value={form.price} onChange={(e) => update("price", e.target.value)} />
              </label>
              <label>Moneda *
                <select required value={form.currency} onChange={(e) => update("currency", e.target.value)}>
                  <option value="PEN">PEN</option>
                  <option value="USD">USD</option>
                </select>
              </label>
            </div>
          </div>

<div className="form-panel">
          <div className="panel-header">
            <h3>Condiciones</h3>
            <p className="field-hint">Propósito, opciones y visibilidad</p>
          </div>
          
          <div className="two-column">
            <label>
              Propósito *
              <select
                value={form.salePurpose}
                onChange={(e) => update("salePurpose", e.target.value)}
              >
                {salePurposeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            <label>
              Contacto *
              <select
                value={form.contactPreference}
                onChange={(e) => update("contactPreference", e.target.value)}
              >
                {contactOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.5rem' }}>
            {[
              { label: "Precio negociable", key: "negotiablePrice" },
              { label: "Incluye transporte", key: "includesTransport" },
              { label: "Requiere documentación sanitaria", key: "requiresSanitaryDocumentation" },
              { label: "Mostrar resumen de salud", key: "healthSummaryVisible" },
              { label: "Mostrar historial de vacunación", key: "vaccinationHistoryVisible" }
            ].map((item) => (
              <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 'bold', color: '#4B5563', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form[item.key as keyof PublishFormState] as boolean}
                  onChange={(e) => update(item.key as keyof PublishFormState, e.target.checked)}
                  style={{ width: '1.1rem', height: '1.1rem', accentColor: 'var(--green)', margin: 0 }}
                />
                {item.label}
              </label>
            ))}
          </div>

          {error && <p className="form-error">{error}</p>}
          
          {(!form.ranchId || !form.bovineId) && (
            <div className="warning-box">
              <Info size={18} />
              <p>Selecciona un bovino para poder publicar.</p>
            </div>
          )}

          <button
            className="primary-button wide"
            disabled={isSubmitting || !form.ranchId || !form.bovineId}
            type="submit"
            style={{ width: '100%', marginTop: '1.5rem' }}
          >
            {isSubmitting ? <Loader2 className="spin" size={18} /> : <CloudUpload size={18} />}
            Publicar en MuuSmart
          </button>
        </div>
       
        </form>
      </section>
    </>
  );
}