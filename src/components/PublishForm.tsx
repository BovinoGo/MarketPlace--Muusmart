import { Info, Loader2, ShieldCheck, Upload, CloudUpload } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { muuSmartApi } from "../api/muuSmartApi";
import { contactOptions, defaultPublishForm, salePurposeOptions } from "../data/marketplaceOptions";
import { RanchBovineFields } from "./RanchBovineFields";
import type { PublishFormState, Session } from "../types";
import { getErrorMessage } from "../utils/records";
import { isSellerRole } from "../utils/roles";

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
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileUrl = URL.createObjectURL(e.target.files[0]);
      setSelectedPhoto(fileUrl);
    }
  };

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
          <span>
            Tu cuenta esta configurada como comprador, por eso puedes navegar el mercado y
            solicitar compras, pero no agregar animales.
          </span>
        </div>
      </section>
    );
  }

  const update = <K extends keyof PublishFormState>(
    key: K,
    value: PublishFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitPublication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await muuSmartApi.publishBovine(
        {
          bovineId: form.bovineId,
          ranchId: form.ranchId,
          sellerId: form.sellerId,
          title: form.title,
          description: form.description,
          price: Number(form.price),
          currency: form.currency,
          salePurpose: Number(form.salePurpose),
          contactPreference: Number(form.contactPreference),
          negotiablePrice: form.negotiablePrice,
          includesTransport: form.includesTransport,
          requiresSanitaryDocumentation: form.requiresSanitaryDocumentation,
          healthSummaryVisible: form.healthSummaryVisible,
          vaccinationHistoryVisible: form.vaccinationHistoryVisible,
        },
        session,
      );
      setForm(defaultPublishForm(session.userId));
      onPublished();
    } catch (publicationError) {
      setError(getErrorMessage(publicationError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="publish-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker" style={{ textTransform: 'uppercase' }}>Venta ganadera</span>
          <h2>Publicar bovino</h2>
          <p className="section-subtitle" style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
            Completa los datos para que los compradores puedan encontrar tu oferta.
          </p>
        </div>
      </div>

      <form className="seller-form" onSubmit={submitPublication}>
        <div className="form-panel">
          <div className="panel-header">
            <h3>Identificación</h3>
            <p className="field-hint">Elige rancho y bovino a vender</p>
          </div>
          <RanchBovineFields
            session={session}
            ranchId={form.ranchId}
            bovineId={form.bovineId}
            onRanchChange={(ranchId) => update("ranchId", ranchId)}
            onBovineChange={(bovineId) => update("bovineId", bovineId)}
          />
          <input type="hidden" value={form.sellerId} readOnly />
        </div>

        <div className="form-panel">
          <div className="panel-header">
            <h3>Oferta</h3>
            <p className="field-hint">Información para el comprador</p>
          </div>

          <label>
            Título del anuncio *
            <input
              required
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="Ej: Novillo Angus listo para engorde"
            />
          </label>
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '-0.6rem', marginBottom: '0.5rem' }}>0/100</div>

          <label>
            Descripción *
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Peso, raza, salud, condiciones y entrega."
            />
          </label>
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '-0.6rem', marginBottom: '0.5rem' }}>0/600</div>

          <div className="two-column">
            <label>
              Precio *
              <input
                min="0"
                required
                type="number"
                value={form.price}
                onChange={(event) => update("price", event.target.value)}
                placeholder="3500"
              />
            </label>
            <label>
              Moneda *
              <select
                required
                value={form.currency}
                onChange={(event) => update("currency", event.target.value)}
              >
                <option value="PEN">PEN</option>
                <option value="USD">USD</option>
              </select>
            </label>
          </div>
        </div>

        <div className="form-panel">
          <div className="panel-header">
            <h3>Condiciones</h3>
            <p className="field-hint">Propósito y opciones</p>
          </div>
          <div className="two-column">
            <label>
              Propósito *
              <select
                value={form.salePurpose}
                onChange={(event) => update("salePurpose", event.target.value)}
                style={{ paddingRight: '2rem' }}
              >
                {salePurposeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Contacto *
              <select
                value={form.contactPreference}
                onChange={(event) => update("contactPreference", event.target.value)}
                style={{ paddingRight: '2rem' }}
              >
                {contactOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.6rem', fontWeight: 'bold', color: '#4B5563', cursor: 'pointer' }}>
              <input
                checked={form.negotiablePrice}
                onChange={(event) => update("negotiablePrice", event.target.checked)}
                type="checkbox"
                style={{ margin: 0, width: '1.1rem', height: '1.1rem', accentColor: 'var(--green)' }}
              />
              Precio negociable
            </label>
            <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.6rem', fontWeight: 'bold', color: '#4B5563', cursor: 'pointer' }}>
              <input
                checked={form.includesTransport}
                onChange={(event) => update("includesTransport", event.target.checked)}
                type="checkbox"
                style={{ margin: 0, width: '1.1rem', height: '1.1rem', accentColor: 'var(--green)' }}
              />
              Incluye transporte
            </label>
            <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.6rem', fontWeight: 'bold', color: '#4B5563', cursor: 'pointer' }}>
              <input
                checked={form.requiresSanitaryDocumentation}
                onChange={(event) =>
                  update("requiresSanitaryDocumentation", event.target.checked)
                }
                type="checkbox"
                style={{ margin: 0, width: '1.1rem', height: '1.1rem', accentColor: 'var(--green)' }}
              />
              Requiere documentación sanitaria
            </label>
            <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.6rem', fontWeight: 'bold', color: '#4B5563', cursor: 'pointer' }}>
              <input
                checked={form.healthSummaryVisible}
                onChange={(event) => update("healthSummaryVisible", event.target.checked)}
                type="checkbox"
                style={{ margin: 0, width: '1.1rem', height: '1.1rem', accentColor: 'var(--green)' }}
              />
              Mostrar resumen de salud
            </label>
            <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.6rem', fontWeight: 'bold', color: '#4B5563', cursor: 'pointer' }}>
              <input
                checked={form.vaccinationHistoryVisible}
                onChange={(event) => update("vaccinationHistoryVisible", event.target.checked)}
                type="checkbox"
                style={{ margin: 0, width: '1.1rem', height: '1.1rem', accentColor: 'var(--green)' }}
              />
              Mostrar historial de vacunación
            </label>
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
            disabled={isSubmitting || !form.ranchId || !form.bovineId || !form.sellerId}
            type="submit"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {isSubmitting ? <Loader2 className="spin" size={18} /> : <CloudUpload size={18} />}
            Publicar en MuuSmart
          </button>

          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <button type="button" className="cancel-text-button">
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}