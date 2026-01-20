import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { MainMenu, type ReconModule } from "@/components/layout/MainMenu";
import { SubdomainScanner } from "@/components/modules/SubdomainScanner";
import { LiveHostChecker } from "@/components/modules/LiveHostChecker";
import { UrlDiscovery } from "@/components/modules/UrlDiscovery";

const Index = () => {
  const [activeModule, setActiveModule] = useState<ReconModule | null>(null);

  const handleBack = () => setActiveModule(null);

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Header />
      
      <main className="pb-16">
        {!activeModule && (
          <MainMenu 
            activeModule={activeModule} 
            onSelectModule={setActiveModule} 
          />
        )}

        {activeModule === 'subdomain' && (
          <SubdomainScanner onBack={handleBack} />
        )}

        {activeModule === 'livehost' && (
          <LiveHostChecker onBack={handleBack} />
        )}

        {activeModule === 'urldiscovery' && (
          <UrlDiscovery onBack={handleBack} />
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-3 bg-background/80 backdrop-blur border-t border-border">
        <p className="text-center text-xs text-muted-foreground font-mono">
          <span className="text-primary">&gt;</span> RAPZY Recon Framework • Use responsibly
        </p>
      </footer>
    </div>
  );
};

export default Index;
