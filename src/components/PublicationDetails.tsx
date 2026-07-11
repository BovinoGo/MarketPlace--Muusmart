import {
  CalendarDays,
  Leaf,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingCart,
  Truck,
  ArrowLeft,
  FileText,
  CheckCircle2
} from "lucide-react";
import { useEffect, useState } from "react";
import { muuSmartApi } from "../api/muuSmartApi";
import { useSession } from "../hooks/useSession";
import type { ApiRecord } from "../types";
import { formatDate, formatMoney } from "../utils/format";
import {
  getImageFor,
  getPublicationDescription,
  getPublicationPurpose,
  getPublicationTitle,
} from "../utils/publication";
import { readBoolean, readNumber, readString } from "../utils/records";

type PublicationDetailsProps = {
  publication: ApiRecord;
  onBack: () => void;
  onAddToCart: () => void;
  isInCart: boolean;
};

export function PublicationDetails({
  publication,
  onBack,
  onAddToCart,
  isInCart,
}: PublicationDetailsProps) {
  const { session } = useSession();
  const [documents, setDocuments] = useState<ApiRecord[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const title = getPublicationTitle(publication);
  const price = readNumber(publication, ["price"]);
  const currency = readString(publication, ["currency"], "PEN");
  const purpose = getPublicationPurpose(publication);
  const publishedAt = readString(publication, ["publishedAt", "createdAt"]);
  const contact = readString(publication, ["contactPreference"], "Llamada");
  const health = readString(publication, ["healthSummary", "healthStatus"]);
  
  useEffect(() => {
    const fetchDocs = async () => {
      const pubId = readString(publication, ["id", "publicationId"]);
      if (!pubId || !session.token) return;
      
      setIsLoadingDocs(true);
      try {
        const docs = await muuSmartApi.getSanitaryDocuments(pubId, session);
        setDocuments(docs);
      } catch (err) {
        console.error("Failed to load sanitary docs", err);
      } finally {
        setIsLoadingDocs(false);
      }
    };
    fetchDocs();
  }, [publication, session]);
  
  // Extract vendor info if available, otherwise fallback
  const vendorName = readString(publication, ["sellerName", "ownerName"]) || readString(publication, ["seller", "fullName"], "Vendedor Anónimo");
  const vendorRole = readString(publication, ["sellerRole"]) || readString(publication, ["seller", "role"], "Ganadero");
  const vendorFarm = readString(publication, ["ranchName"]) || readString(publication, ["ranch", "name"], "Ganadería No Especificada");
  const vendorLocation = readString(publication, ["location", "ranchLocation"]) || readString(publication, ["ranch", "location"], "Ubicación no especificada");
  

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem' }} onClick={onBack}>
        <ArrowLeft size={16} />
        Mercado <span style={{ color: '#D1D5DB' }}>&gt;</span> <span style={{ color: '#374151' }}>{title}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Image */}
          <div style={{ width: '100%', height: '500px', borderRadius: '16px', overflow: 'hidden', background: '#E5E7EB' }}>
            <img src={getImageFor(publication, 0)} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Description & Attributes */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 850, color: '#111827', margin: '0 0 1rem 0' }}>Descripción completa</h2>
            <p style={{ color: '#4B5563', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              {getPublicationDescription(publication)}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', borderTop: '1px solid #F3F4F6', paddingTop: '1.5rem' }}>
              <div style={{ padding: '0.5rem 0' }}>
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Raza</div>
                <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.9rem' }}>Angus</div>
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Propósito</div>
                <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.9rem' }}>{purpose}</div>
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Ubicación</div>
                <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.9rem' }}>{vendorLocation}</div>
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Precio</div>
                <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.9rem' }}>{formatMoney(price, currency)}</div>
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Transporte</div>
                <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.9rem' }}>{readBoolean(publication, ["includesTransport"]) ? "Incluido" : "No incluido"}</div>
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Precio</div>
                <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.9rem' }}>{readBoolean(publication, ["negotiablePrice"]) ? "Negociable" : "Fijo"}</div>
              </div>
            </div>
          </div>

          {/* Sanitary Documentation */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 850, color: '#111827', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="#10B981" />
              Documentación sanitaria
            </h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <th style={{ padding: '0.75rem 1rem', color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo de documento</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>N° Certificado</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emisor</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emisión</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vencimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingDocs ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280', fontSize: '0.9rem' }}>Cargando documentos...</td>
                    </tr>
                  ) : documents.length > 0 ? (
                    documents.map((doc, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '1rem', color: '#111827', fontWeight: 600, fontSize: '0.9rem' }}>{readString(doc, ["documentType", "type"], "Certificado")}</td>
                        <td style={{ padding: '1rem', color: '#6B7280', fontSize: '0.9rem' }}>{readString(doc, ["certificateNumber", "number"], "-")}</td>
                        <td style={{ padding: '1rem', color: '#6B7280', fontSize: '0.9rem' }}>{readString(doc, ["issuer"], "SENASA")}</td>
                        <td style={{ padding: '1rem', color: '#6B7280', fontSize: '0.9rem' }}>{formatDate(readString(doc, ["issueDate", "date"]))}</td>
                        <td style={{ padding: '1rem', color: '#10B981', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={16} />
                          {formatDate(readString(doc, ["expiryDate", "validUntil"]))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.9rem' }}>No hay documentos sanitarios registrados</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '2rem' }}>
          
          {/* Summary Card */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10B981', fontWeight: 850, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
              <Leaf size={14} strokeWidth={2.5} />
              {purpose}
            </div>
            
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111827', margin: '0 0 1rem 0', lineHeight: 1.2 }}>{title}</h1>
            
            <div style={{ display: 'flex', alignItems: 'end', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 950, color: '#111827', lineHeight: 1 }}>{formatMoney(price, currency)}</span>
              {readBoolean(publication, ["negotiablePrice"]) && (
                <span style={{ background: '#ECFDF5', color: '#10B981', padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 750, marginBottom: '0.4rem' }}>
                  Negociable
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
              {readBoolean(publication, ["requiresSanitaryDocumentation"]) && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.8rem', borderRadius: '100px', background: '#EFF6FF', color: '#3B82F6', fontSize: '0.75rem', fontWeight: 750 }}>
                  <ShieldCheck size={14} /> Sanitario
                </span>
              )}
              {readBoolean(publication, ["includesTransport"]) && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.8rem', borderRadius: '100px', background: '#FFF7ED', color: '#F97316', fontSize: '0.75rem', fontWeight: 750 }}>
                  <Truck size={14} /> Transporte incluido
                </span>
              )}
              {health && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.8rem', borderRadius: '100px', background: '#F0FDF4', color: '#15803D', fontSize: '0.75rem', fontWeight: 750 }}>
                  <ShieldCheck size={14} /> Salud visible
                </span>
              )}
            </div>

            <button 
              onClick={onAddToCart}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#2E5041', color: 'white', padding: '1rem', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all 0.2s', opacity: isInCart ? 0.7 : 1 }}
            >
              <ShoppingCart size={18} />
              {isInCart ? 'En carrito' : 'Agregar al carrito'}
            </button>
          </div>

          {/* Vendor Card */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.2rem' }}>Vendedor</div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2E5041', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 850, fontSize: '1.1rem' }}>
                  {vendorName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#111827', fontSize: '0.95rem' }}>{vendorName}</div>
                  <div style={{ color: '#9CA3AF', fontSize: '0.8rem', fontWeight: 500 }}>{vendorFarm}</div>
                </div>
              </div>
              <div style={{ background: '#F0FDF4', color: '#15803D', padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 800 }}>
                {vendorRole}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: '#6B7280', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <MapPin size={16} color="#9CA3AF" />
                {vendorLocation}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Phone size={16} color="#9CA3AF" />
                Contacto preferido: <span style={{ fontWeight: 700, color: '#374151' }}>{contact}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CalendarDays size={16} color="#9CA3AF" />
                Publicado el {publishedAt ? formatDate(publishedAt) : "Reciente"}
              </div>
            </div>

          
          </div>
          
        </div>
      </div>
    </div>
  );
}
