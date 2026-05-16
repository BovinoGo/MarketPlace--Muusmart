import { Search, Sparkles } from "lucide-react";
import { formatMoney } from "../utils/format";

type MarketplaceHeroProps = {
  averagePrice: number;
  negotiableCount: number;
  publicationCount: number;
  query: string;
  setQuery: (value: string) => void;
};

export function MarketplaceHero({
  averagePrice,
  negotiableCount,
  publicationCount,
  query,
  setQuery,
}: MarketplaceHeroProps) {
  return (
    <section className="hero-market">
      <div className="hero-content">
        <span className="eyebrow">
          <Sparkles size={18} aria-hidden="true" />
          Feria ganadera digital
        </span>
        <h1>Compra bovinos con datos claros y respaldo sanitario.</h1>
        <p>
          MuuSmart Market concentra publicaciones reales de ganaderos, precios, proposito de
          venta, contacto y documentos sanitarios en una experiencia moderna.
        </p>

        <label className="hero-search">
          <Search size={20} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar Angus, Brown Swiss, leche, carne..."
            type="search"
          />
        </label>
      </div>

      <div className="hero-metrics" aria-label="Resumen del marketplace">
        <div>
          <span>{publicationCount}</span>
          <small>Bovinos publicados</small>
        </div>
        <div>
          <span>{formatMoney(averagePrice, "PEN")}</span>
          <small>Precio promedio</small>
        </div>
        <div>
          <span>{negotiableCount}</span>
          <small>Precios negociables</small>
        </div>
      </div>
    </section>
  );
}
