import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { AuthGate } from "./components/AuthGate";
import { DocumentsModal } from "./components/DocumentsModal";
import { MarketplaceHero } from "./components/MarketplaceHero";
import { MarketplaceView } from "./components/MarketplaceView";
import { PublishForm } from "./components/PublishForm";
import { PurchaseModal } from "./components/PurchaseModal";
import { SellerDashboard } from "./components/SellerDashboard";
import { Toast } from "./components/Toast";
import { usePublications } from "./hooks/usePublications";
import { useSession } from "./hooks/useSession";
import type { ApiRecord, ViewMode } from "./types";
import { readBoolean } from "./utils/records";

function AuthenticatedApp() {
  const [activeView, setActiveView] = useState<ViewMode>("market");
  const [notice, setNotice] = useState("");
  const [purchaseTarget, setPurchaseTarget] = useState<ApiRecord | null>(null);
  const [documentTarget, setDocumentTarget] = useState<ApiRecord | null>(null);
  const { session, logout } = useSession();
  const publications = usePublications();
  const canSell = session.role === "rancher";

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!canSell && activeView !== "market") {
      setActiveView("market");
      setNotice("Los compradores solo pueden navegar y solicitar compras.");
    }
  }, [activeView, canSell]);

  const closeSession = () => {
    logout();
    window.location.reload();
  };

  const published = () => {
    setNotice("Publicacion enviada al marketplace.");
    publications.loadPublications();
    setActiveView("market");
  };

  const changed = () => {
    setNotice("Operacion aplicada.");
    publications.loadPublications();
  };

  return (
    <AppShell
      activeView={activeView}
      logout={closeSession}
      session={session}
      setActiveView={setActiveView}
    >
      <Toast message={notice} />

      <main>
        <MarketplaceHero
          averagePrice={publications.averagePrice}
          negotiableCount={
            publications.publications.filter((item) => readBoolean(item, ["negotiablePrice"])).length
          }
          publicationCount={publications.publications.length}
          query={publications.query}
          setQuery={publications.setQuery}
        />

        {activeView === "market" && (
          <MarketplaceView
            apiError={publications.apiError}
            filteredPublications={publications.filteredPublications}
            isLoading={publications.isLoading}
            loadPublications={publications.loadPublications}
            onlySanitary={publications.onlySanitary}
            onlyTransport={publications.onlyTransport}
            purposes={publications.purposes}
            query={publications.query}
            selectedPurpose={publications.selectedPurpose}
            setDocumentTarget={setDocumentTarget}
            setOnlySanitary={publications.setOnlySanitary}
            setOnlyTransport={publications.setOnlyTransport}
            setPurchaseTarget={setPurchaseTarget}
            setQuery={publications.setQuery}
            setSelectedPurpose={publications.setSelectedPurpose}
            setSortMode={publications.setSortMode}
            sortMode={publications.sortMode}
          />
        )}

        {activeView === "sell" && canSell && (
          <PublishForm onPublished={published} session={session} />
        )}

        {activeView === "mine" && canSell && (
          <SellerDashboard onChanged={changed} session={session} />
        )}
      </main>

      {purchaseTarget && (
        <PurchaseModal
          onClose={() => setPurchaseTarget(null)}
          publication={purchaseTarget}
          session={session}
          setNotice={setNotice}
        />
      )}

      {documentTarget && (
        <DocumentsModal
          onClose={() => setDocumentTarget(null)}
          publication={documentTarget}
          session={session}
          setNotice={setNotice}
        />
      )}
    </AppShell>
  );
}

function App() {
  const { isAuthenticated, saveSession } = useSession();
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  if (!isAuthenticated) {
    return (
      <>
        <Toast message={notice} />
        <AuthGate
          onAuthenticated={(session) => {
            saveSession(session);
            setNotice("Sesion iniciada. Bienvenido a MuuSmart Market.");
          }}
        />
      </>
    );
  }

  return <AuthenticatedApp />;
}

export default App;
