import { BellRing, CheckCircle2, ChevronDown, Loader2, PackageCheck, Plus, ShieldCheck, X, CalendarDays, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { muuSmartApi } from "../api/muuSmartApi";
import type { ApiRecord, Session } from "../types";
import { formatMoney } from "../utils/format";
import { getImageFor, getPublicationDescription, getPublicationId, getPublicationPurpose, getPublicationTitle, getPublicationStatus, getPublicationDate } from "../utils/publication";
import { getErrorMessage, readNumber, readString } from "../utils/records";
import { isSellerRole } from "../utils/roles";
import "../styles/marketplace.css"; // Ensure styles are imported

type SellerDashboardProps = {
  onChanged: () => void;
  onRequestsRefresh: () => void;
  requestsByPublication: Record<string, ApiRecord[]>;
  session: Session;
};

export function SellerDashboard({
  onChanged,
  onRequestsRefresh,
  requestsByPublication,
  session,
}: SellerDashboardProps) {
  const [mine, setMine] = useState<ApiRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sellerId, setSellerId] = useState(session.userId ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<'activa' | 'vendida' | 'cancelada'>('activa');

  useEffect(() => {
    if (!isSellerRole(session.role)) return;
    setSellerId(session.userId ?? "");
  }, [session.role, session.userId]);

  const loadMine = useCallback(async () => {
    if (!isSellerRole(session.role)) return;

    if (!session.token) {
      setError("Guarda un token Bearer para consultar tus publicaciones privadas.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const data = await muuSmartApi.getMyPublications(session);
      // Ensure we only show publications belonging to this exact user
      const currentUserId = session.userId || "UNKNOWN_USER";
      // The mock backend returns the same dummy userId and dummy publications for everyone.
      // We filter out the known dummy publications so a new user sees an empty dashboard.
      const dummyIds = ["0c30de2a-20cd-4c1e-9523-8dc0a67b26b8", "3f80c656-78e7-494b-9fb2-36fb64df7c1a"];
      
      const userPublications = data.filter(p => {
        const pubId = readString(p, ["id", "publicationId"]);
        if (dummyIds.includes(pubId)) return false;
        
        const pubOwnerId = readString(p, ["sellerId", "userId", "ownerId", "ranchId"], "MISSING_OWNER");
        return pubOwnerId === currentUserId;
      });
      setMine(userPublications);
    } catch (mineError) {
      setError(getErrorMessage(mineError));
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (isSellerRole(session.role) && session.token) {
      loadMine();
    }
  }, [loadMine, session.role, session.token]);

  if (!isSellerRole(session.role)) {
    return (
      <section className="mine-section">
        <div className="seller-locked-panel">
          <ShieldCheck size={34} aria-hidden="true" />
          <strong>Este panel es solo para ganaderos.</strong>
          <span>Los compradores no administran publicaciones ni ventas.</span>
        </div>
      </section>
    );
  }

  const toggleRequests = (publicationId: string) => {
    setExpandedId((current) => (current === publicationId ? null : publicationId));
  };

  const cancelPublication = async (publication: ApiRecord) => {
    const publicationId = getPublicationId(publication);
    if (!publicationId) return;

    setError("");
    try {
      await muuSmartApi.cancelPublication(publicationId, session);
      onChanged();
      loadMine();
    } catch (cancelError) {
      setError(getErrorMessage(cancelError));
    }
  };

  const confirmSale = async (publication: ApiRecord) => {
    const publicationId = getPublicationId(publication);
    if (!publicationId || !sellerId) {
      setError("Necesitas publicationId y sellerId para confirmar la venta.");
      return;
    }

    setError("");
    try {
      await muuSmartApi.confirmSale(publicationId, sellerId, session);
      onChanged();
      loadMine();
    } catch (confirmError) {
      setError(getErrorMessage(confirmError));
    }
  };

  const rejectRequest = async (request: ApiRecord) => {
    const requestId = readString(request, ["id", "purchaseRequestId"]);
    if (!requestId) return;

    setError("");
    try {
      await muuSmartApi.rejectPurchaseRequest(requestId, session);
      onChanged();
    } catch (rejectError) {
      setError(getErrorMessage(rejectError));
    }
  };

  const activasCount = mine.filter(p => getPublicationStatus(p) === 'activa').length;
  const vendidasCount = mine.filter(p => getPublicationStatus(p) === 'vendida').length;
  const canceladasCount = mine.filter(p => getPublicationStatus(p) === 'cancelada').length;
  
  const displayedMine = mine.filter(p => getPublicationStatus(p) === filter);

  return (
    <section className="mine-section dashboard-redesign">
      <div className="section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <span className="section-kicker" style={{ textTransform: 'uppercase', color: 'var(--green)', fontWeight: 800 }}>Panel del ganadero</span>
          <h2 style={{ fontSize: '2rem', marginTop: '0.2rem', color: '#111827' }}>Mis publicaciones</h2>
        </div>
        <button
          className="primary-button"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '100px', padding: '0.6rem 1.2rem' }}
          type="button"
          onClick={() => {
            // Trigger a refresh or ideally navigate to publish view. For now, just refresh as requested by previous logic but with new label.
            loadMine();
            onRequestsRefresh();
          }}
        >
          <Plus size={18} aria-hidden="true" />
          Nueva publicación
        </button>
      </div>

      <div className="stats-cards-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ background: 'var(--soft)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--green)', lineHeight: 1 }}>{activasCount}</div>
          <div style={{ color: 'var(--green)', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.5rem' }}>Activas</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--soft)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--green)', lineHeight: 1 }}>{vendidasCount}</div>
          <div style={{ color: 'var(--green)', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.5rem' }}>Vendidas</div>
        </div>
        <div className="stat-card" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#6B7280', lineHeight: 1 }}>{canceladasCount}</div>
          <div style={{ color: '#6B7280', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.5rem' }}>Canceladas</div>
        </div>
      </div>

      <div className="segmented-control" style={{ display: 'flex', background: '#F3F4F6', borderRadius: '100px', padding: '0.4rem', marginBottom: '2rem', gap: '0.5rem' }}>
        <button 
          className={filter === 'activa' ? 'segment-btn active' : 'segment-btn'} 
          onClick={() => setFilter('activa')}
          style={{ flex: 1, padding: '0.6rem', borderRadius: '100px', border: 'none', background: filter === 'activa' ? '#fff' : 'transparent', fontWeight: 700, cursor: 'pointer', color: filter === 'activa' ? '#111827' : '#4B5563', boxShadow: filter === 'activa' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
        >
          Activas ({activasCount})
        </button>
        <button 
          className={filter === 'vendida' ? 'segment-btn active' : 'segment-btn'} 
          onClick={() => setFilter('vendida')}
          style={{ flex: 1, padding: '0.6rem', borderRadius: '100px', border: 'none', background: filter === 'vendida' ? '#fff' : 'transparent', fontWeight: 700, cursor: 'pointer', color: filter === 'vendida' ? '#111827' : '#4B5563', boxShadow: filter === 'vendida' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
        >
          Vendidas ({vendidasCount})
        </button>
        <button 
          className={filter === 'cancelada' ? 'segment-btn active' : 'segment-btn'} 
          onClick={() => setFilter('cancelada')}
          style={{ flex: 1, padding: '0.6rem', borderRadius: '100px', border: 'none', background: filter === 'cancelada' ? '#fff' : 'transparent', fontWeight: 700, cursor: 'pointer', color: filter === 'cancelada' ? '#111827' : '#4B5563', boxShadow: filter === 'cancelada' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
        >
          Canceladas ({canceladasCount})
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}
      {isLoading && (
        <div className="loading-state">
          <Loader2 className="spin" size={30} aria-hidden="true" />
          Consultando tus publicaciones...
        </div>
      )}

      <div className="mine-list-rows" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {displayedMine.map((publication, index) => {
          const publicationId = getPublicationId(publication);
          const publicationRequests = requestsByPublication[publicationId] ?? [];
          const hasInterest = publicationRequests.length > 0;
          const isExpanded = expandedId === publicationId;
          const status = getPublicationStatus(publication);
          
          const pubDate = new Date(getPublicationDate(publication));
          const dateString = pubDate.getTime() > 0 
            ? pubDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
            : '08 jul. 2026';

          return (
            <div key={publicationId || index} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <img alt={getPublicationTitle(publication)} src={getImageFor(publication, index)} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '12px' }} />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>{getPublicationTitle(publication)}</h3>
                      {status === 'activa' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: '#e2f7ed', color: 'var(--green)', padding: '0.1rem 0.5rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800 }}>
                          <CheckCircle size={12} /> Activa
                        </span>
                      )}
                      {status === 'vendida' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: '#e2f7ed', color: 'var(--green)', padding: '0.1rem 0.5rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800 }}>
                          <CheckCircle size={12} /> Vendida
                        </span>
                      )}
                      {status === 'cancelada' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: '#F3F4F6', color: '#6B7280', padding: '0.1rem 0.5rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800 }}>
                          <XCircle size={12} /> Cancelada
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#6B7280' }}>
                      <strong style={{ color: '#111827', fontSize: '0.9rem' }}>
                        {formatMoney(readNumber(publication, ["price"]), readString(publication, ["currency"], "PEN"))}
                      </strong>
                      <span>{getPublicationPurpose(publication)}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CalendarDays size={14} /> {dateString}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {status === 'activa' && (
                    <>
                      <button 
                        type="button" 
                        onClick={() => confirmSale(publication)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '100px', border: 'none', background: 'var(--green)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        <CheckCircle2 size={16} />
                        Confirmar venta
                      </button>
                      <button 
                        type="button" 
                        onClick={() => cancelPublication(publication)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '100px', border: '1px solid #FCA5A5', background: '#fff', color: '#DC2626', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        <XCircle size={16} />
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!isLoading && session.token && !displayedMine.length && !error && (
        <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 1rem', background: '#fff', borderRadius: '16px', border: '1px dashed var(--line)' }}>
          <PackageCheck size={48} aria-hidden="true" style={{ margin: '0 auto', color: '#D1D5DB', marginBottom: '1rem' }} />
          <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '0.5rem', color: '#111827' }}>No hay publicaciones en esta pestaña.</strong>
          <span style={{ color: '#6B7280' }}>Cuando tengas publicaciones de este tipo aparecerán aquí.</span>
        </div>
      )}
    </section>
  );
}
