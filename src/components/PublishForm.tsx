import { Loader2, ShieldCheck, Upload } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { muuSmartApi } from "../api/muuSmartApi";
import { contactOptions, defaultPublishForm, salePurposeOptions } from "../data/marketplaceOptions";
import type { PublishFormState, Session } from "../types";
import { getErrorMessage } from "../utils/records";

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
          <span className="section-kicker">Venta ganadera</span>
          <h2>Publicar bovino</h2>
        </div>
      </div>

      <form className="seller-form" onSubmit={submitPublication}>
        <div className="form-panel">
          <h3>Identificacion</h3>
          <label>
            Bovine ID
            <input
              required
              value={form.bovineId}
              onChange={(event) => update("bovineId", event.target.value)}
              placeholder="UUID del bovino"
            />
          </label>
          <label>
            Ranch ID
            <input
              required
              value={form.ranchId}
              onChange={(event) => update("ranchId", event.target.value)}
              placeholder="UUID del rancho"
            />
          </label>
          <label>
            Seller ID
            <input
              required
              value={form.sellerId}
              onChange={(event) => update("sellerId", event.target.value)}
              placeholder="UUID del vendedor"
            />
          </label>
        </div>

        <div className="form-panel">
          <h3>Oferta</h3>
          <label>
            Titulo
            <input
              required
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="Novillo Angus listo para engorde"
            />
          </label>
          <label>
            Descripcion
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Peso, raza, salud, condiciones y entrega."
            />
          </label>
          <div className="two-column">
            <label>
              Precio
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
              Moneda
              <input
                required
                value={form.currency}
                onChange={(event) => update("currency", event.target.value.toUpperCase())}
                placeholder="PEN"
              />
            </label>
          </div>
        </div>

        <div className="form-panel">
          <h3>Condiciones</h3>
          <div className="two-column">
            <label>
              Proposito
              <select
                value={form.salePurpose}
                onChange={(event) => update("salePurpose", event.target.value)}
              >
                {salePurposeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Contacto
              <select
                value={form.contactPreference}
                onChange={(event) => update("contactPreference", event.target.value)}
              >
                {contactOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="check-row">
            <input
              checked={form.negotiablePrice}
              onChange={(event) => update("negotiablePrice", event.target.checked)}
              type="checkbox"
            />
            Precio negociable
          </label>
          <label className="check-row">
            <input
              checked={form.includesTransport}
              onChange={(event) => update("includesTransport", event.target.checked)}
              type="checkbox"
            />
            Incluye transporte
          </label>
          <label className="check-row">
            <input
              checked={form.requiresSanitaryDocumentation}
              onChange={(event) =>
                update("requiresSanitaryDocumentation", event.target.checked)
              }
              type="checkbox"
            />
            Requiere documentacion sanitaria
          </label>
          <label className="check-row">
            <input
              checked={form.healthSummaryVisible}
              onChange={(event) => update("healthSummaryVisible", event.target.checked)}
              type="checkbox"
            />
            Mostrar resumen de salud
          </label>
          <label className="check-row">
            <input
              checked={form.vaccinationHistoryVisible}
              onChange={(event) => update("vaccinationHistoryVisible", event.target.checked)}
              type="checkbox"
            />
            Mostrar historial de vacunacion
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="primary-button wide" disabled={isSubmitting} type="submit">
            {isSubmitting ? <Loader2 className="spin" size={18} /> : <Upload size={18} />}
            Publicar en MuuSmart
          </button>
        </div>
      </form>
    </section>
  );
}
