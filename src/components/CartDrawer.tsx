import { CreditCard, Minus, ShoppingCart, Trash2, X } from "lucide-react";
import type { CartItem } from "../types";
import { formatMoney } from "../utils/format";
import { getImageFor, getPublicationId, getPublicationTitle } from "../utils/publication";
import { readNumber, readString } from "../utils/records";

type CartDrawerProps = {
  items: CartItem[];
  onCheckout: () => void;
  onClose: () => void;
  onRemove: (publicationId: string) => void;
  open: boolean;
  total: number;
};

export function CartDrawer({
  items,
  onCheckout,
  onClose,
  onRemove,
  open,
  total,
}: CartDrawerProps) {
  if (!open) return null;

  return (
    <div className="drawer-backdrop" role="dialog" aria-modal="true">
      <aside className="cart-drawer" aria-label="Carrito de compra">
        <div className="cart-head">
          <div>
            <span className="section-kicker">Carrito</span>
            <h2>Tu compra ganadera</h2>
          </div>
          <button className="close-button inline" type="button" onClick={onClose} aria-label="Cerrar">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {items.length ? (
          <div className="cart-list">
            {items.map((item, index) => {
              const publicationId = getPublicationId(item.publication);
              const price = readNumber(item.publication, ["price"]);
              const currency = readString(item.publication, ["currency"], "PEN");

              return (
                <article className="cart-item" key={publicationId}>
                  <img
                    alt={getPublicationTitle(item.publication)}
                    src={getImageFor(item.publication, index)}
                  />
                  <div>
                    <h3>{getPublicationTitle(item.publication)}</h3>
                    <span>{formatMoney(price, currency)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(publicationId)}
                    aria-label="Quitar del carrito"
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="cart-empty">
            <ShoppingCart size={34} aria-hidden="true" />
            <strong>Tu carrito esta vacio.</strong>
            <span>Agrega bovinos desde el catalogo para iniciar el checkout.</span>
          </div>
        )}

        <div className="cart-summary">
          <div>
            <span>Total referencial</span>
            <strong>{formatMoney(total, "PEN")}</strong>
          </div>
          <p>
            La pasarela confirma la intencion de compra y envia la solicitud al vendedor para
            coordinar inspeccion, documentos y pago final.
          </p>
          <button className="primary-button wide" disabled={!items.length} type="button" onClick={onCheckout}>
            <CreditCard size={18} aria-hidden="true" />
            Ir a pasarela
          </button>
          <button className="icon-text-button wide" type="button" onClick={onClose}>
            <Minus size={18} aria-hidden="true" />
            Seguir comprando
          </button>
        </div>
      </aside>
    </div>
  );
}
