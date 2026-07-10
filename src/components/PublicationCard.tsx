import {
  CalendarDays,
  DollarSign,
  FileText,
  HeartPulse,
  MessageSquare,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Leaf,
  Phone,
  Eye,
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
  onView: (publication: ApiRecord) => void;
  publication: ApiRecord;
};

export function PublicationCard({
  index,
  isInCart,
  onDocuments,
  onAddToCart,
  onView,
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
    <article className="publication-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="media-frame" style={{ position: 'relative' }}>
        <img alt={title} src={getImageFor(publication, index)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#2E5041', color: 'white', borderRadius: '100px', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.75rem', zIndex: 10 }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6EE7B7' }}></div>
          Published
        </div>
      </div>

      <div className="publication-body" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <span className="purpose-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10B981', fontWeight: 850, fontSize: '0.75rem', textTransform: 'uppercase', background: 'transparent', padding: 0, border: 'none' }}>
            <Leaf size={14} strokeWidth={2.5} />
            {purpose}
          </span>
          <strong className="price" style={{ fontSize: '1.3rem', fontWeight: 950, color: '#111827' }}>{formatMoney(price, currency)}</strong>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 850, color: '#111827', margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>{title}</h3>
        
        <p style={{ color: '#6B7280', fontSize: '0.85rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '0 0 1rem 0', flex: 1 }}>{getPublicationDescription(publication)}</p>

        <div className="feature-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {readBoolean(publication, ["requiresSanitaryDocumentation"]) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', borderRadius: '100px', background: '#EFF6FF', color: '#3B82F6', fontSize: '0.75rem', fontWeight: 750 }}>
              <ShieldCheck size={12} /> Sanitario
            </span>
          )}
          {health && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', borderRadius: '100px', background: '#F5F3FF', color: '#8B5CF6', fontSize: '0.75rem', fontWeight: 750 }}>
              <HeartPulse size={12} /> Salud visible
            </span>
          )}
          {readBoolean(publication, ["negotiablePrice"]) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', borderRadius: '100px', background: '#ECFDF5', color: '#10B981', fontSize: '0.75rem', fontWeight: 750 }}>
              <DollarSign size={12} /> Negociable
            </span>
          )}
          {readBoolean(publication, ["includesTransport"]) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', borderRadius: '100px', background: '#FFF7ED', color: '#F97316', fontSize: '0.75rem', fontWeight: 750 }}>
              <Truck size={12} /> Transporte
            </span>
          )}
        </div>

        <div className="meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E7EB', paddingTop: '1rem', color: '#9CA3AF', fontSize: '0.8rem', marginBottom: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {contact.toLowerCase().includes('llamad') || contact.toLowerCase().includes('tel') ? <Phone size={14} /> : <MessageSquare size={14} />}
            {contact}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CalendarDays size={14} />
            {publishedAt ? formatDate(publishedAt) : "Reciente"}
          </span>
        </div>

        <div className="card-actions" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '0.5rem' }}>
          <button type="button" onClick={() => onView(publication)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#2E5041', padding: '0.7rem', borderRadius: '8px', color: 'white', fontWeight: 750, border: 'none', cursor: 'pointer' }}>
            <Eye size={16} /> Ver publicación
          </button>
          <button type="button" onClick={() => onAddToCart(publication)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.7rem 0.8rem', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
            <ShoppingCart size={16} color={isInCart ? '#10B981' : '#4B5563'} />
          </button>
        </div>
      </div>
    </article>
  );
}
