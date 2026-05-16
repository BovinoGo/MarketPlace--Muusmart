import {
  BadgeCheck,
  CalendarDays,
  DollarSign,
  FileText,
  HeartPulse,
  MessageSquare,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import type { ApiRecord } from "../types";
import { formatDate, formatMoney } from "../utils/format";
import {
  getImageFor,
  getPublicationDescription,
  getPublicationPurpose,
  getPublicationTitle,
} from "../utils/publication";
import { readBoolean, readNumber, readString } from "../utils/records";

type PublicationCardProps = {
  index: number;
  isInCart: boolean;
  onDocuments: (publication: ApiRecord) => void;
  onAddToCart: (publication: ApiRecord) => void;
  publication: ApiRecord;
};

export function PublicationCard({
  index,
  isInCart,
  onDocuments,
  onAddToCart,
  publication,
}: PublicationCardProps) {
  const title = getPublicationTitle(publication);
  const price = readNumber(publication, ["price"]);
  const currency = readString(publication, ["currency"], "PEN");
  const status = readString(publication, ["status"], "Publicado");
  const purpose = getPublicationPurpose(publication);
  const publishedAt = readString(publication, ["publishedAt", "createdAt"]);
  const contact = readString(publication, ["contactPreference"], "Contacto directo");
  const health = readString(publication, ["healthSummary", "healthStatus"]);

  return (
    <article className="publication-card">
      <div className="media-frame">
        <img alt={title} src={getImageFor(publication, index)} />
        <span className="status-badge">
          <BadgeCheck size={16} aria-hidden="true" />
          {status}
        </span>
      </div>

      <div className="publication-body">
        <div className="publication-main">
          <div>
            <span className="purpose-label">{purpose}</span>
            <h3>{title}</h3>
          </div>
          <strong className="price">{formatMoney(price, currency)}</strong>
        </div>

        <p>{getPublicationDescription(publication)}</p>

        <div className="feature-list">
          {readBoolean(publication, ["negotiablePrice"]) && (
            <span>
              <DollarSign size={15} aria-hidden="true" />
              Negociable
            </span>
          )}
          {readBoolean(publication, ["includesTransport"]) && (
            <span>
              <Truck size={15} aria-hidden="true" />
              Transporte
            </span>
          )}
          {readBoolean(publication, ["requiresSanitaryDocumentation"]) && (
            <span>
              <ShieldCheck size={15} aria-hidden="true" />
              Sanitario
            </span>
          )}
          {health && (
            <span>
              <HeartPulse size={15} aria-hidden="true" />
              Salud visible
            </span>
          )}
        </div>

        <div className="meta-row">
          <span>
            <MessageSquare size={16} aria-hidden="true" />
            {contact}
          </span>
          <span>
            <CalendarDays size={16} aria-hidden="true" />
            {publishedAt ? formatDate(publishedAt) : "Reciente"}
          </span>
        </div>

        <div className="card-actions">
          <button className="primary-button" type="button" onClick={() => onAddToCart(publication)}>
            <ShoppingCart size={18} aria-hidden="true" />
            {isInCart ? "En carrito" : "Agregar al carrito"}
          </button>
          <button className="icon-text-button" type="button" onClick={() => onDocuments(publication)}>
            <FileText size={18} aria-hidden="true" />
            Docs
          </button>
        </div>
      </div>
    </article>
  );
}
