import { CreditCard, Loader2, LockKeyhole, Send, Smartphone, Landmark, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { muuSmartApi } from "../api/muuSmartApi";
import type { CartItem, CheckoutDraft, Session } from "../types";
import { formatMoney } from "../utils/format";
import { getPublicationId, getPublicationTitle } from "../utils/publication";
import { getErrorMessage, readNumber } from "../utils/records";

type CheckoutModalProps = {
  items: CartItem[];
  onClose: () => void;
  onSuccess: () => void;
  session: Session;
};

const paymentOptions = [
  { value: "card", label: "Tarjeta", icon: CreditCard },
  { value: "yape", label: "Yape/Plin", icon: Smartphone },
  { value: "transfer", label: "Transferencia", icon: Landmark },
] as const;

export function CheckoutModal({ items, onClose, onSuccess, session }: CheckoutModalProps) {
  const [draft, setDraft] = useState<CheckoutDraft>({
    fullName: session.fullName ?? "",
    email: session.email ?? "",
    phone: session.phone ?? "",
    paymentMethod: "card",
    cardNumber: "",
    cardName: session.fullName ?? "",
    cardExpiry: "",
    cardCvv: "",
    deliveryNotes: "Quiero coordinar inspeccion, documentos sanitarios y condiciones de entrega.",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(
    () => items.reduce((sum, item) => sum + readNumber(item.publication, ["price"]), 0),
    [items],
  );

  const update = <K extends keyof CheckoutDraft>(key: K, value: CheckoutDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const submitCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!session.userId) {
      setError(
        "La API no pudo reconocer tu cuenta de comprador. Vuelve a iniciar sesion con una cuenta registrada antes de pagar.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      for (const item of items) {
        const publicationId = getPublicationId(item.publication);
        await muuSmartApi.createPurchaseRequest(
          publicationId,
          {
            publicationId,
            buyerId: session.userId,
            message: [
              `Checkout MuuSmart por ${draft.fullName}.`,
              `Contacto: ${draft.email} / ${draft.phone}.`,
              `Metodo de pago elegido: ${draft.paymentMethod}.`,
              `Notas: ${draft.deliveryNotes}`,
            ].join(" "),
          },
          session,
        );
      }
      onSuccess();
    } catch (checkoutError) {
      setError(getErrorMessage(checkoutError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="modal-panel wide-modal checkout-modal" onSubmit={submitCheckout}>
        <button className="close-button" type="button" onClick={onClose} aria-label="Cerrar">
          <X size={20} aria-hidden="true" />
        </button>

        <span className="section-kicker">Pasarela MuuSmart</span>
        <h2>Confirmar compra</h2>

        <div className="checkout-grid">
          <div className="checkout-form">
            <label>
              Nombre de contacto
              <input
                required
                value={draft.fullName}
                onChange={(event) => update("fullName", event.target.value)}
                placeholder="Nombre y apellido"
              />
            </label>
            <div className="two-column">
              <label>
                Correo
                <input
                  required
                  type="email"
                  value={draft.email}
                  onChange={(event) => update("email", event.target.value)}
                  placeholder="comprador@correo.com"
                />
              </label>
              <label>
                Telefono
                <input
                  required
                  value={draft.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  placeholder="+51 999 999 999"
                />
              </label>
            </div>

            <div className="payment-options">
              {paymentOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    className={draft.paymentMethod === option.value ? "active" : ""}
                    key={option.value}
                    type="button"
                    onClick={() => update("paymentMethod", option.value)}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {option.label}
                  </button>
                );
              })}
            </div>

            {draft.paymentMethod === "card" && (
              <>
                <label>
                  Numero de tarjeta
                  <input
                    inputMode="numeric"
                    maxLength={19}
                    required
                    value={draft.cardNumber}
                    onChange={(event) => update("cardNumber", event.target.value)}
                    placeholder="4111 1111 1111 1111"
                  />
                </label>
                <div className="two-column">
                  <label>
                    Vence
                    <input
                      maxLength={5}
                      required
                      value={draft.cardExpiry}
                      onChange={(event) => update("cardExpiry", event.target.value)}
                      placeholder="MM/AA"
                    />
                  </label>
                  <label>
                    CVV
                    <input
                      inputMode="numeric"
                      maxLength={4}
                      required
                      type="password"
                      value={draft.cardCvv}
                      onChange={(event) => update("cardCvv", event.target.value)}
                      placeholder="123"
                    />
                  </label>
                </div>
              </>
            )}

            <label>
              Indicaciones
              <textarea
                rows={4}
                value={draft.deliveryNotes}
                onChange={(event) => update("deliveryNotes", event.target.value)}
              />
            </label>
          </div>

          <aside className="checkout-summary">
            <div className="secure-badge">
              <LockKeyhole size={18} aria-hidden="true" />
              Pasarela protegida
            </div>
            <h3>Resumen</h3>
            <div className="checkout-items">
              {items.map((item) => (
                <div key={getPublicationId(item.publication)}>
                  <span>{getPublicationTitle(item.publication)}</span>
                  <strong>{formatMoney(readNumber(item.publication, ["price"]), "PEN")}</strong>
                </div>
              ))}
            </div>
            <div className="checkout-total">
              <span>Total</span>
              <strong>{formatMoney(total, "PEN")}</strong>
            </div>
            <p>
              Esta pasarela registra la intencion de compra. El vendedor confirma documentos,
              traslado y cierre de pago.
            </p>
            {error && <p className="form-error">{error}</p>}
            <button className="primary-button wide" disabled={isSubmitting || !items.length} type="submit">
              {isSubmitting ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
              Pagar y enviar solicitud
            </button>
          </aside>
        </div>
      </form>
    </div>
  );
}
