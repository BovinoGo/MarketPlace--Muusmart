import { Loader2, RefreshCw, Search, ShieldCheck, SlidersHorizontal, Truck } from "lucide-react";
import type { ApiRecord, SortMode } from "../types";
import { getPublicationId } from "../utils/publication";
import { PublicationCard } from "./PublicationCard";

type MarketplaceViewProps = {
  apiError: string;
  cartIds: Set<string>;
  filteredPublications: ApiRecord[];
  isLoading: boolean;
  loadPublications: () => Promise<void>;
  onlySanitary: boolean;
  onlyTransport: boolean;
  purposes: string[];
  query: string;
  selectedPurpose: string;
  setDocumentTarget: (publication: ApiRecord) => void;
  setOnlySanitary: (value: boolean) => void;
  setOnlyTransport: (value: boolean) => void;
  onAddToCart: (publication: ApiRecord) => void;
  onView: (publication: ApiRecord) => void;
  setQuery: (value: string) => void;
  setSelectedPurpose: (value: string) => void;
  setSortMode: (value: SortMode) => void;
  sortMode: SortMode;
};

export function MarketplaceView({
  apiError,
  cartIds,
  filteredPublications,
  isLoading,
  loadPublications,
  onlySanitary,
  onlyTransport,
  purposes,
  query,
  selectedPurpose,
  setDocumentTarget,
  setOnlySanitary,
  setOnlyTransport,
  onAddToCart,
  onView,
  setQuery,
  setSelectedPurpose,
  setSortMode,
  sortMode,
}: MarketplaceViewProps) {
  return (
    <section className="market-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Catalogo en vivo</span>
          <h2>Bovinos disponibles</h2>
        </div>
        <button className="secondary-button" type="button" onClick={loadPublications}>
          <RefreshCw size={18} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      <div className="market-toolbar">
        <label className="search-field">
          <Search size={19} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por raza, proposito o descripcion"
            type="search"
          />
        </label>

        <label className="select-field">
          <span>Orden</span>
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
            <option value="recent">Mas recientes</option>
            <option value="priceAsc">Precio menor</option>
            <option value="priceDesc">Precio mayor</option>
          </select>
        </label>
      </div>

      <div className="market-layout">
        <aside className="filters-panel">
          <div className="filters-title">
            <SlidersHorizontal size={19} aria-hidden="true" />
            <h3>Filtros</h3>
          </div>

          <div className="filter-group">
            <span>Proposito</span>
            <div className="purpose-grid">
              {purposes.map((purpose) => (
                <button
                  className={selectedPurpose === purpose ? "purpose-chip active" : "purpose-chip"}
                  key={purpose}
                  type="button"
                  onClick={() => setSelectedPurpose(purpose)}
                >
                  {purpose}
                </button>
              ))}
            </div>
          </div>

          <label className="check-row">
            <input
              checked={onlyTransport}
              onChange={(event) => setOnlyTransport(event.target.checked)}
              type="checkbox"
            />
            <Truck size={18} aria-hidden="true" />
            Incluye transporte
          </label>

          <label className="check-row">
            <input
              checked={onlySanitary}
              onChange={(event) => setOnlySanitary(event.target.checked)}
              type="checkbox"
            />
            <ShieldCheck size={18} aria-hidden="true" />
            Documentacion sanitaria
          </label>
        </aside>

        <div className="catalog-area">
          {apiError && (
            <div className="empty-state">
              <ShieldCheck size={28} aria-hidden="true" />
              <strong>No se pudo conectar con la API.</strong>
              <span>{apiError}</span>
            </div>
          )}

          {isLoading ? (
            <div className="loading-state">
              <Loader2 className="spin" size={30} aria-hidden="true" />
              Cargando feria ganadera...
            </div>
          ) : (
            <div className="publication-grid">
              {filteredPublications.map((publication, index) => (
                <PublicationCard
                  index={index}
                  isInCart={cartIds.has(getPublicationId(publication))}
                  key={getPublicationId(publication) || index}
                  onDocuments={setDocumentTarget}
                  onAddToCart={onAddToCart}
                  onView={onView}
                  publication={publication}
                />
              ))}
            </div>
          )}

          {!isLoading && !filteredPublications.length && !apiError && (
            <div className="empty-state">
              <Search size={28} aria-hidden="true" />
              <strong>No hay resultados con esos filtros.</strong>
              <span>Prueba con otro proposito o limpia la busqueda.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
