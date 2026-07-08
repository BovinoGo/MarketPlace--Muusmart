import { Check, Loader2, Plus, X } from "lucide-react";
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
    if (!ranchId) {
      setBovines([]);
      return;
    }
    let cancelled = false;
    setLoadingBovines(true);
    muuSmartApi
      .getBovinesByRanch(ranchId, session)
      .then((result) => {
        if (!cancelled) setBovines(result);
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
  }, [ranchId]);

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

  return (
    <div className="picker-group">
      <div className="picker-field">
        <label htmlFor="ranch-select">Rancho</label>
        <div className="picker-row">
          <select
            id="ranch-select"
            value={ranchId}
            onChange={(event) => {
              onRanchChange(event.target.value);
              onBovineChange("");
            }}
            disabled={loadingRanches}
          >
            <option value="">
              {loadingRanches ? "Cargando ranchos..." : "Selecciona un rancho"}
            </option>
            {ranches.map((ranch) => {
              const id = recordId(ranch);
              const label = readString(ranch, ["name"], id);
              return (
                <option key={id} value={id}>
                  {label}
                </option>
              );
            })}
          </select>
          <button
            type="button"
            className="ghost-button"
            onClick={() => setShowRanchForm((current) => !current)}
          >
            {showRanchForm ? <X size={16} /> : <Plus size={16} />}
            {showRanchForm ? "Cancelar" : "Nuevo rancho"}
          </button>
        </div>

        {showRanchForm && (
          <div className="inline-create-panel">
            <div className="two-column">
              <label>
                Nombre del rancho
                <input
                  required
                  value={ranchForm.name}
                  onChange={(event) => updateRanchForm("name", event.target.value)}
                  placeholder="Rancho Santa Rosa"
                />
              </label>
              <label>
                Tipo de produccion
                <select
                  value={ranchForm.productionType}
                  onChange={(event) => updateRanchForm("productionType", event.target.value)}
                >
                  {productionTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="two-column">
              <label>
                Region
                <input
                  value={ranchForm.region}
                  onChange={(event) => updateRanchForm("region", event.target.value)}
                  placeholder="Cajamarca"
                />
              </label>
              <label>
                Provincia
                <input
                  value={ranchForm.province}
                  onChange={(event) => updateRanchForm("province", event.target.value)}
                  placeholder="Cajamarca"
                />
              </label>
            </div>
            <div className="two-column">
              <label>
                Distrito
                <input
                  value={ranchForm.district}
                  onChange={(event) => updateRanchForm("district", event.target.value)}
                  placeholder="Distrito"
                />
              </label>
              <label>
                Capacidad (bovinos)
                <input
                  type="number"
                  min="0"
                  value={ranchForm.capacityBovines}
                  onChange={(event) => updateRanchForm("capacityBovines", event.target.value)}
                  placeholder="50"
                />
              </label>
            </div>
            <label>
              Direccion
              <input
                value={ranchForm.address}
                onChange={(event) => updateRanchForm("address", event.target.value)}
                placeholder="Direccion del rancho"
              />
            </label>
            {ranchError && <p className="form-error">{ranchError}</p>}
            <button
              type="button"
              className="primary-button wide"
              disabled={savingRanch || !ranchForm.name}
              onClick={submitRanch}
            >
              {savingRanch ? <Loader2 className="spin" size={16} /> : <Check size={16} />}
              Guardar rancho
            </button>
          </div>
        )}
      </div>

      <div className="picker-field">
        <label htmlFor="bovine-select">Bovino</label>
        <div className="picker-row">
          <select
            id="bovine-select"
            value={bovineId}
            onChange={(event) => onBovineChange(event.target.value)}
            disabled={!ranchId || loadingBovines}
          >
            <option value="">
              {!ranchId
                ? "Primero selecciona un rancho"
                : loadingBovines
                  ? "Cargando bovinos..."
                  : "Selecciona un bovino"}
            </option>
            {bovines.map((bovine) => {
              const id = recordId(bovine);
              const label =
                readString(bovine, ["name"]) ||
                readString(bovine, ["earTagCode"], id);
              return (
                <option key={id} value={id}>
                  {label}
                </option>
              );
            })}
          </select>
          <button
            type="button"
            className="ghost-button"
            disabled={!ranchId}
            onClick={() => setShowBovineForm((current) => !current)}
          >
            {showBovineForm ? <X size={16} /> : <Plus size={16} />}
            {showBovineForm ? "Cancelar" : "Nuevo bovino"}
          </button>
        </div>

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