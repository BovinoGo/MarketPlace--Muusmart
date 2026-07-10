import { BadgeCheck, Loader2, LockKeyhole, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { muuSmartApi } from "../api/muuSmartApi";
import type { Session } from "../types"; 
import { getErrorMessage } from "../utils/records";

type AuthMode = "login" | "register";

type AuthGateProps = {
  onAuthenticated: (session: Session) => void;
};

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      let session: Session;
      
      if (mode === "login") {
        // El login sigue sirviendo para ambos. 
        // Intentamos primero como comprador
        try {
          session = await muuSmartApi.login({ email, password }, "buyer");
        } catch (buyerError) {
          // Si falla, intentamos como ganadero
          session = await muuSmartApi.login({ email, password }, "rancher");
        }
      } else {
        // El flujo de registro ahora es EXCLUSIVO para compradores en la web
        session = await muuSmartApi.registerBuyer({ fullName, email, password, phone });
      }

      onAuthenticated(session);
    } catch (authError) {
      // Si ambos fallan (o el registro falla), mostramos el error
      setError(getErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div className="auth-copy">
          <span className="auth-badge">
            <ShieldCheck size={18} aria-hidden="true" />
            MuuSmart Market
          </span>
          <h1>Feria ganadera digital para comprar bovinos con respaldo sanitario.</h1>
          <p>
            Ingresa primero para acceder al mercado. Los compradores pueden solicitar compras;
            los ganaderos pueden publicar bovinos y gestionar sus ventas.
          </p>

          <div className="auth-proof">
            <span>
              <BadgeCheck size={18} aria-hidden="true" />
              Login API
            </span>
            <span>
              <BadgeCheck size={18} aria-hidden="true" />
              Registro de Compradores
            </span>
            <span>
              <BadgeCheck size={18} aria-hidden="true" />
              Marketplace real
            </span>
          </div>
        </div>

        <form className="auth-card" onSubmit={submit}>
          <div className="auth-card-head">
            <span>
              <LockKeyhole size={24} aria-hidden="true" />
            </span>
            <div>
              <strong>{mode === "login" ? "Ingresar" : "Crear cuenta"}</strong>
              <small>MuuSmart API</small>
            </div>
          </div>

          <div className="switcher" role="tablist" aria-label="Acceso">
            <button
              className={mode === "login" ? "active" : ""}
              type="button"
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              type="button"
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          {mode === "register" && (
            <div className="auth-role-block">
               <p className="role-hint">
                 El registro vía web es exclusivo para <strong>Compradores</strong>. 
                 Si eres Ganadero, por favor descarga nuestra aplicación móvil.
               </p>
            </div>
          )}

          {mode === "register" && (
            <label>
              Nombre completo
              <span className="input-shell">
                <UserRound size={18} aria-hidden="true" />
                <input
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Nombre del usuario"
                />
              </span>
            </label>
          )}

          <label>
            Correo
            <span className="input-shell">
              <Mail size={18} aria-hidden="true" />
              <input
                autoComplete="email"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </span>
          </label>

          <label>
            Contraseña
            <span className="input-shell">
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
              />
            </span>
          </label>

          {mode === "register" && (
            <label>
              Teléfono
              <span className="input-shell">
                <Phone size={18} aria-hidden="true" />
                <input
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+51 999 999 999"
                />
              </span>
            </label>
          )}

          {error && <p className="form-error">{error}</p>}

          <button className="primary-button wide" disabled={isSubmitting} type="submit">
            {isSubmitting ? <Loader2 className="spin" size={18} /> : <LockKeyhole size={18} />}
            {mode === "login" ? "Entrar al marketplace" : "Crear cuenta de comprador"}
          </button>
        </form>
      </section>
    </main>
  );
}