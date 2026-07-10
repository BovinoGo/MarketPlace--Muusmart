import {
  BadgeCheck,
  Bell,
  ChevronDown,
  Heart,
  LogOut,
  PackageCheck,
  Plus,
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
  onAlertsOpen: () => void;
  onCartOpen: () => void;
  salesAlertCount: number;
  session: Session;
  setActiveView: (view: ViewMode) => void;
};

const navItems: Array<{ view: ViewMode; label: string; icon: typeof Store }> = [
  { view: "market", label: "Mercado", icon: Store },
  { view: "sell", label: "Publicar", icon: Plus },
  { view: "mine", label: "Mis ventas", icon: PackageCheck },
];

export function AppShell({
  activeView,
  cartCount,
  children,
  logout,
  onAlertsOpen,
  onCartOpen,
  salesAlertCount,
  session,
  setActiveView,
}: AppShellProps) {
  const rawRole = (session.role || "comprador").toLowerCase();
  const canSell = rawRole !== "buyer" && rawRole !== "comprador";
  const roleName = rawRole === "rancher" ? "Ganadero" : rawRole === "buyer" ? "Comprador" : rawRole.charAt(0).toUpperCase() + rawRole.slice(1);

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
          <button className="nav-item cart-btn" type="button" aria-label="Carrito" onClick={onCartOpen} style={{ position: 'relative' }}>
            <ShoppingCart size={18} aria-hidden="true" />
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: '-5px', right: '-8px', background: '#EF4444', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '2px 5px', borderRadius: '100px' }}>
                {cartCount}
              </span>
            )}
          </button>
          
          <span className={`role-badge ${canSell ? 'role-badge-ganadero' : ''}`}>
            <span className="role-dot" />
            {roleName}
          </span>

          <div className="user-profile">
            <span className="avatar">
              {session.fullName ? session.fullName.charAt(0).toUpperCase() : session.email?.charAt(0).toUpperCase() || '?'}
            </span>
            <span className="session-name">{session.fullName || session.email?.split('@')[0] || 'Usuario'}</span>
          </div>

          <button type="button" className="nav-item logout-btn" onClick={logout}>
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      {children}
    </div>
  );
}
