import {
  BadgeCheck,
  LogOut,
  PackageCheck,
  PlusCircle,
  ShoppingCart,
  Store,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Session, ViewMode } from "../types";

type AppShellProps = {
  activeView: ViewMode;
  cartCount: number;
  children: ReactNode;
  logout: () => void;
  onCartOpen: () => void;
  session: Session;
  setActiveView: (view: ViewMode) => void;
};

const navItems: Array<{ view: ViewMode; label: string; icon: typeof Store }> = [
  { view: "market", label: "Mercado", icon: Store },
  { view: "sell", label: "Publicar", icon: PlusCircle },
  { view: "mine", label: "Mis ventas", icon: PackageCheck },
];

export function AppShell({
  activeView,
  cartCount,
  children,
  logout,
  onCartOpen,
  session,
  setActiveView,
}: AppShellProps) {
  const canSell = session.role === "rancher";
  const visibleNavItems = canSell
    ? navItems
    : navItems.filter((item) => item.view === "market");

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-button" type="button" onClick={() => setActiveView("market")}>
          <span className="brand-mark">
            <Store size={22} aria-hidden="true" />
          </span>
          <span>
            <strong>MuuSmart</strong>
            <small>Market</small>
          </span>
        </button>

        <nav className="main-nav" aria-label="Navegacion principal">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={activeView === item.view ? "nav-item active" : "nav-item"}
                key={item.view}
                type="button"
                onClick={() => setActiveView(item.view)}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="session-pill">
          <button className="cart-button" type="button" onClick={onCartOpen}>
            <ShoppingCart size={17} aria-hidden="true" />
            Carrito
            {cartCount > 0 && <strong>{cartCount}</strong>}
          </button>
          <span className="role-badge">
            <BadgeCheck size={15} aria-hidden="true" />
            {canSell ? "Ganadero" : "Comprador"}
          </span>
          <UserRound size={17} aria-hidden="true" />
          <span className="session-name">{session.fullName || session.email}</span>
          <button type="button" onClick={logout}>
            <LogOut size={17} aria-hidden="true" />
            Salir
          </button>
        </div>
      </header>

      {children}
    </div>
  );
}
