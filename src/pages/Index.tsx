import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScannerHeader } from "@/components/ScannerHeader";
import { DomainInput } from "@/components/DomainInput";
import { ScanProgress } from "@/components/ScanProgress";
import { ResultsTable } from "@/components/ResultsTable";
import { subdomainApi, type SubdomainResult } from "@/lib/api/subdomain";

const Index = () => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [isCheckingLive, setIsCheckingLive] = useState(false);
  const [currentDomain, setCurrentDomain] = useState("");
  const [results, setResults] = useState<SubdomainResult[]>([]);
  const [scanTime, setScanTime] = useState<number>();
  const [hasScanned, setHasScanned] = useState(false);

  const handleScan = async (domain: string) => {
    setIsScanning(true);
    setCurrentDomain(domain);
    setResults([]);
    setHasScanned(false);

    try {
      const response = await subdomainApi.enumerate(domain);

      if (response.success) {
        setResults(response.subdomains);
        setScanTime(response.scanTime);
        setHasScanned(true);
        toast({
          title: "Scan Complete",
          description: `Found ${response.subdomains.length} subdomains for ${domain}`,
        });
      } else {
        toast({
          title: "Scan Failed",
          description: response.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to the scanning service",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleCheckLive = async (subdomains: string[]) => {
    setIsCheckingLive(true);

    try {
      const response = await subdomainApi.checkLive(subdomains);

      if (response.results.length > 0) {
        // Update results with live status
        setResults(prev => 
          prev.map(r => {
            const liveResult = response.results.find(lr => lr.subdomain === r.subdomain);
            if (liveResult) {
              return { ...r, ...liveResult };
            }
            return r;
          })
        );

        const liveCount = response.results.filter(r => r.isLive).length;
        toast({
          title: "Live Check Complete",
          description: `${liveCount}/${response.results.length} hosts are live`,
        });
      }

      if (response.error) {
        toast({
          title: "Warning",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Live check error:", error);
      toast({
        title: "Error",
        description: "Failed to check live hosts",
        variant: "destructive",
      });
    } finally {
      setIsCheckingLive(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      <ScannerHeader />
      
      <main className="pb-12">
        <DomainInput onScan={handleScan} isScanning={isScanning} />

        {isScanning && <ScanProgress domain={currentDomain} />}

        {hasScanned && !isScanning && (
          <ResultsTable
            results={results}
            scanTime={scanTime}
            onCheckLive={handleCheckLive}
            isCheckingLive={isCheckingLive}
          />
        )}

        {!hasScanned && !isScanning && (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <div className="font-mono text-muted-foreground space-y-2">
              <p>Enter a domain above to start scanning.</p>
              <p className="text-sm">
                Data sources: <span className="text-primary">crt.sh</span>,{" "}
                <span className="text-accent">HackerTarget</span>,{" "}
                <span className="text-success">AlienVault OTX</span>
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-3 bg-background/80 backdrop-blur border-t border-border">
        <p className="text-center text-xs text-muted-foreground font-mono">
          <span className="text-primary">&gt;</span> Use responsibly. Only scan domains you own or have permission to test.
        </p>
      </footer>
    </div>
  );
};

export default Index;
