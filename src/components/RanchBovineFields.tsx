import { Check, Loader2, Plus, X, Search, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { muuSmartApi } from "../api/muuSmartApi";
import {
  bovineCategoryOptions,
  defaultBovineForm,
  defaultRanchForm,
  productionTypeOptions,
  productivePurposeOptions,
  sexOptions,
} from "../data/marketplaceOptions";
import type { ApiRecord, Session } from "../types";
import { getErrorMessage, readString } from "../utils/records";
import { getPublicationStatus, getBovineId } from "../utils/publication";

type RanchBovineFieldsProps = {
  session: Session;
  ranchId: string;
  bovineId: string;
  onRanchChange: (ranchId: string) => void;
  onBovineChange: (bovineId: string) => void;
};

function recordId(record: ApiRecord): string {
  return readString(record, ["id", "ranchId", "bovineId"]);
}

export function RanchBovineFields({
  session,
  ranchId,
  bovineId,
  onRanchChange,
  onBovineChange,
}: RanchBovineFieldsProps) {
  const ownerId = session.userId ?? "";

  const [ranches, setRanches] = useState<ApiRecord[]>([]);
  const [loadingRanches, setLoadingRanches] = useState(false);
  const [showRanchForm, setShowRanchForm] = useState(false);
  const [ranchForm, setRanchForm] = useState(() => defaultRanchForm(ownerId));
  const [ranchError, setRanchError] = useState("");
  const [savingRanch, setSavingRanch] = useState(false);

  const [bovines, setBovines] = useState<ApiRecord[]>([]);
  const [loadingBovines, setLoadingBovines] = useState(false);
  const [showBovineForm, setShowBovineForm] = useState(false);
  const [bovineForm, setBovineForm] = useState(() => defaultBovineForm(ownerId, ranchId));
  const [bovineError, setBovineError] = useState("");
  const [savingBovine, setSavingBovine] = useState(false);
  const [bovineSearch, setBovineSearch] = useState("");
  const [publishedBovineIds, setPublishedBovineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    muuSmartApi.getPublications().then(pubs => {
      if (cancelled) return;
      const activeMine = pubs.filter(p => getPublicationStatus(p) === 'activa');
      const ids = activeMine.map(p => getBovineId(p)).filter(Boolean);
      setPublishedBovineIds(new Set(ids));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [session]);

  useEffect(() => {
    let cancelled = false;
    setLoadingRanches(true);
    muuSmartApi
      .getRanches(session)
      .then((result) => {
        if (!cancelled) setRanches(result);
      })
      .catch(() => {
        if (!cancelled) setRanches([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingRanches(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ranches.length === 0) {
      setBovines([]);
      return;
    }
    let cancelled = false;
    setLoadingBovines(true);
    
    Promise.all(
      ranches.map(ranch => {
        const rId = recordId(ranch);
        return muuSmartApi.getBovinesByRanch(rId, session).then(res => 
          res.map(b => ({ ...b, _ranchId: rId }))
        );
      })
    )
      .then((results) => {
        if (!cancelled) setBovines(results.flat());
      })
      .catch(() => {
        if (!cancelled) setBovines([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingBovines(false);
      });
      
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ranches, session]);

  const updateRanchForm = <K extends keyof typeof ranchForm>(key: K, value: (typeof ranchForm)[K]) => {
    setRanchForm((current) => ({ ...current, [key]: value }));
  };

  const updateBovineForm = <K extends keyof typeof bovineForm>(
    key: K,
    value: (typeof bovineForm)[K],
  ) => {
    setBovineForm((current) => ({ ...current, [key]: value }));
  };

  const submitRanch = async () => {
    setRanchError("");
    setSavingRanch(true);
    try {
      const created = await muuSmartApi.createRanch(
        {
          ownerId: ranchForm.ownerId || ownerId,
          name: ranchForm.name,
          country: ranchForm.country,
          region: ranchForm.region,
          productionType: Number(ranchForm.productionType),
          description: ranchForm.description,
          province: ranchForm.province,
          district: ranchForm.district,
          address: ranchForm.address,
          totalAreaHectares: Number(ranchForm.totalAreaHectares || 0),
          capacityBovines: Number(ranchForm.capacityBovines || 0),
          contactPhone: ranchForm.contactPhone,
          contactEmail: ranchForm.contactEmail,
          sanitaryRegistrationCode: ranchForm.sanitaryRegistrationCode,
        },
        session,
      );
      const newId = recordId(created);
      const withFallbackName = { ...created, name: created.name ?? ranchForm.name };
      setRanches((current) => [withFallbackName, ...current]);
      if (newId) onRanchChange(newId);
      setShowRanchForm(false);
      setRanchForm(defaultRanchForm(ownerId));
    } catch (error) {
      setRanchError(getErrorMessage(error));
    } finally {
      setSavingRanch(false);
    }
  };

  const submitBovine = async () => {
    setBovineError("");
    setSavingBovine(true);
    try {
      const created = await muuSmartApi.createBovine(
        {
          earTagCode: bovineForm.earTagCode,
          name: bovineForm.name,
          breed: bovineForm.breed,
          sex: Number(bovineForm.sex),
          birthDate: bovineForm.birthDate
            ? new Date(bovineForm.birthDate).toISOString()
            : new Date().toISOString(),
          category: Number(bovineForm.category),
          currentWeightKg: Number(bovineForm.currentWeightKg || 0),
          productivePurpose: Number(bovineForm.productivePurpose),
          ranchId,
          ownerId: bovineForm.ownerId || ownerId,
          stableId: bovineForm.stableId || undefined,
          photoUrl: bovineForm.photoUrl || undefined,
        },
        session,
      );
      const newId = recordId(created);
      const withFallbackName = { ...created, name: created.name ?? bovineForm.name };
      setBovines((current) => [withFallbackName, ...current]);
      if (newId) onBovineChange(newId);
      setShowBovineForm(false);
      setBovineForm(defaultBovineForm(ownerId, ranchId));
    } catch (error) {
      setBovineError(getErrorMessage(error));
    } finally {
      setSavingBovine(false);
    }
  };

  const filteredBovines = bovines.filter((bovine) => {
    const search = bovineSearch.toLowerCase();
    const eartag = readString(bovine, ["earTagCode"]).toLowerCase();
    const breed = readString(bovine, ["breed"]).toLowerCase();
    const name = readString(bovine, ["name"]).toLowerCase();
    return !search || eartag.includes(search) || breed.includes(search) || name.includes(search);
  });

  const selectedBovineDetails = bovines.find((b) => recordId(b) === bovineId);
  const selectedRanchDetails = ranches.find((r) => recordId(r) === ranchId);
  return (
    <div className="picker-group">

      <div className="picker-field">
        <label htmlFor="bovine-select">Bovino *</label>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Buscar por arete o raza"
              value={bovineSearch}
              onChange={(e) => setBovineSearch(e.target.value)}
              disabled={loadingBovines}
              style={{ width: '100%', paddingLeft: '36px', borderRadius: '100px', border: '1px solid var(--line)', background: '#F9FAFB', height: '42px' }}
            />
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '0.8rem', 
            maxHeight: '300px', 
            overflowY: 'auto', 
            paddingRight: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            {loadingBovines && <p style={{ color: '#6B7280', fontSize: '0.9rem', gridColumn: '1 / -1' }}>Cargando bovinos...</p>}
            {!loadingBovines && filteredBovines.length === 0 && <p style={{ color: '#6B7280', fontSize: '0.9rem', gridColumn: '1 / -1' }}>No se encontraron bovinos</p>}
            
            {filteredBovines.map((bovine) => {
              const id = recordId(bovine);
              const isSelected = bovineId === id;
              const earTag = readString(bovine, ["earTagCode"], `#${id.substring(0, 5)}`);
              const breed = readString(bovine, ["breed"], "Bovino");
              const category = readString(bovine, ["category"], "Animal");
              const weight = readString(bovine, ["currentWeightKg"], "0");
              
              // Map category number to text if needed, or use as is if it's already text.
              // Assuming category options are handled elsewhere, we'll try to show it gracefully.
              const categoryText = bovineCategoryOptions.find(o => o.value == category)?.label || category;
              const isPublished = publishedBovineIds.has(id);

              return (
                <div 
                  key={id} 
                  onClick={() => {
                    if (isPublished) return;
                    onBovineChange(id);
                    const b = bovines.find(bov => recordId(bov) === id);
                    if (b) {
                      const rId = readString(b, ["_ranchId"]);
                      if (rId) onRanchChange(rId);
                    }
                  }}
                  style={{ 
                    border: isSelected ? '2px solid var(--green)' : '1px solid var(--line)', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    cursor: isPublished ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    background: '#fff',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? '0 4px 12px rgba(15, 118, 86, 0.15)' : 'none',
                    opacity: isPublished ? 0.7 : 1
                  }}
                >
                  {isPublished && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(243, 244, 246, 0.7)', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ background: '#4B5563', color: '#fff', padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 'bold' }}>Ya publicado</span>
                    </div>
                  )}
                  {isSelected && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--green)', borderRadius: '50%', color: '#fff', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827', marginBottom: '0.2rem' }}>{earTag}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{breed}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>{categoryText} · {weight} kg</div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedBovineDetails && (
            <div style={{ background: '#F0FDF4', border: '1px solid #D1FAE5', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--green)', fontWeight: 800, fontSize: '0.8rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
                <CheckCircle2 size={16} /> DATOS DEL BOVINO SELECCIONADO
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', marginBottom: '0.2rem' }}>Raza</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>{readString(selectedBovineDetails, ["breed"], "-")}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', marginBottom: '0.2rem' }}>Categoría</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>{bovineCategoryOptions.find(o => o.value == readString(selectedBovineDetails, ["category"]))?.label || readString(selectedBovineDetails, ["category"], "-")}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', marginBottom: '0.2rem' }}>Peso</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>{readString(selectedBovineDetails, ["currentWeightKg"], "0")} kg</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', marginBottom: '0.2rem' }}>Arete</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>{readString(selectedBovineDetails, ["earTagCode"], "-")}</div>
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#059669', marginBottom: '0.2rem' }}>Rancho</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>{selectedRanchDetails ? readString(selectedRanchDetails, ["name"], "-") : "-"}</div>
              </div>
            </div>
          )}

        {showBovineForm && (
          <div className="inline-create-panel">
            <div className="two-column">
              <label>
                Codigo de arete
                <input
                  required
                  value={bovineForm.earTagCode}
                  onChange={(event) => updateBovineForm("earTagCode", event.target.value)}
                  placeholder="PE-00123"
                />
              </label>
              <label>
                Nombre
                <input
                  value={bovineForm.name}
                  onChange={(event) => updateBovineForm("name", event.target.value)}
                  placeholder="Lucero"
                />
              </label>
            </div>
            <div className="two-column">
              <label>
                Raza
                <input
                  value={bovineForm.breed}
                  onChange={(event) => updateBovineForm("breed", event.target.value)}
                  placeholder="Angus"
                />
              </label>
              <label>
                Sexo
                <select
                  value={bovineForm.sex}
                  onChange={(event) => updateBovineForm("sex", event.target.value)}
                >
                  {sexOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="two-column">
              <label>
                Categoria
                <select
                  value={bovineForm.category}
                  onChange={(event) => updateBovineForm("category", event.target.value)}
                >
                  {bovineCategoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Proposito productivo
                <select
                  value={bovineForm.productivePurpose}
                  onChange={(event) => updateBovineForm("productivePurpose", event.target.value)}
                >
                  {productivePurposeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="two-column">
              <label>
                Peso actual (kg)
                <input
                  type="number"
                  min="0"
                  value={bovineForm.currentWeightKg}
                  onChange={(event) => updateBovineForm("currentWeightKg", event.target.value)}
                  placeholder="380"
                />
              </label>
              <label>
                Fecha de nacimiento
                <input
                  type="date"
                  value={bovineForm.birthDate}
                  onChange={(event) => updateBovineForm("birthDate", event.target.value)}
                />
              </label>
            </div>
            {bovineError && <p className="form-error">{bovineError}</p>}
            <button
              type="button"
              className="primary-button wide"
              disabled={savingBovine || !bovineForm.earTagCode}
              onClick={submitBovine}
            >
              {savingBovine ? <Loader2 className="spin" size={16} /> : <Check size={16} />}
              Guardar bovino
            </button>
          </div>
        )}
      </div>
    </div>
  );
}