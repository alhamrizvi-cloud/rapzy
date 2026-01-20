import { useState } from "react";
import { Search, Loader2, Globe, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExportDialog } from "@/components/common/ExportDialog";
import { ProgressIndicator } from "@/components/common/ProgressIndicator";
import { reconApi, exportUtils, type SubdomainResult } from "@/lib/api/recon";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Filter, Zap, ExternalLink } from "lucide-react";

const SOURCES = [
  'crt.sh (CT Logs)',
  'HackerTarget',
  'AlienVault OTX',
  'ThreatCrowd',
  'URLScan.io',
];

interface SubdomainScannerProps {
  onBack: () => void;
}

export function SubdomainScanner({ onBack }: SubdomainScannerProps) {
  const { toast } = useToast();
  const [domain, setDomain] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isCheckingLive, setIsCheckingLive] = useState(false);
  const [results, setResults] = useState<SubdomainResult[]>([]);
  const [scanTime, setScanTime] = useState<number>();
  const [hasScanned, setHasScanned] = useState(false);
  const [filter, setFilter] = useState("");
  const [showOnlyLive, setShowOnlyLive] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setIsScanning(true);
    setResults([]);
    setHasScanned(false);

    try {
      const response = await reconApi.enumerateSubdomains(domain.trim());

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

  const handleCheckLive = async () => {
    const subdomainsToCheck = results
      .filter(r => r.isLive === undefined)
      .map(r => r.subdomain)
      .slice(0, 50);

    if (subdomainsToCheck.length === 0) return;

    setIsCheckingLive(true);

    try {
      const response = await reconApi.checkLiveHosts(subdomainsToCheck);

      if (response.results.length > 0) {
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

  const handleExport = (filename: string) => {
    exportUtils.exportSubdomains(filename, filteredResults);
    toast({
      title: "Exported",
      description: `Saved ${filteredResults.length} results to ${filename}.txt`,
    });
  };

  const filteredResults = results.filter(r => {
    const matchesFilter = r.subdomain.toLowerCase().includes(filter.toLowerCase());
    const matchesLive = !showOnlyLive || r.isLive === true;
    return matchesFilter && matchesLive;
  });

  const liveCount = results.filter(r => r.isLive === true).length;
  const deadCount = results.filter(r => r.isLive === false).length;
  const uncheckedCount = results.filter(r => r.isLive === undefined).length;

  const getStatusBadge = (result: SubdomainResult) => {
    if (result.isLive === undefined) {
      return <Badge variant="outline" className="text-muted-foreground border-muted">Unknown</Badge>;
    }
    if (result.isLive) {
      return (
        <Badge className="bg-success/20 text-success border-success/30 border">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Live {result.statusCode && `(${result.statusCode})`}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-destructive border-destructive/30">
        <XCircle className="w-3 h-3 mr-1" />
        Dead
      </Badge>
    );
  };

  const scanSteps = SOURCES.map((source, i) => ({
    label: `Querying ${source}...`,
    status: i < 3 ? 'complete' as const : i === 3 ? 'active' as const : 'pending' as const,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Subdomain Enumeration
          </h2>
          <p className="text-sm text-muted-foreground font-mono">
            Find subdomains from CT logs, passive DNS, threat intel
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleScan} className="mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 rounded-lg blur-xl" />
          <div className="relative flex gap-2 p-2 bg-card border border-border rounded-lg terminal-border">
            <div className="flex items-center pl-3 text-muted-foreground">
              <Globe className="w-5 h-5" />
            </div>
            <Input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter target domain (e.g., example.com)"
              className="flex-1 bg-transparent border-0 text-lg font-mono focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
              disabled={isScanning}
            />
            <Button
              type="submit"
              disabled={isScanning || !domain.trim()}
              className="px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Scan
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Progress */}
      {isScanning && (
        <div className="mb-6">
          <ProgressIndicator
            title={`Scanning ${domain}...`}
            steps={scanSteps}
            currentStep="Aggregating and deduplicating results..."
          />
        </div>
      )}

      {/* Results */}
      {hasScanned && !isScanning && (
        <>
          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-card border border-border rounded-lg">
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-sm font-mono">
                <span className="text-muted-foreground">Found:</span>
                <span className="text-primary ml-2 font-bold">{results.length}</span>
                <span className="text-muted-foreground ml-1">subdomains</span>
              </div>
              {scanTime && (
                <div className="text-sm font-mono text-muted-foreground">
                  in {(scanTime / 1000).toFixed(2)}s
                </div>
              )}
              <div className="flex gap-3 text-sm font-mono">
                <span className="text-success">{liveCount} live</span>
                <span className="text-destructive">{deadCount} dead</span>
                <span className="text-muted-foreground">{uncheckedCount} unchecked</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckLive}
                disabled={isCheckingLive || uncheckedCount === 0}
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                {isCheckingLive ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Check Live ({Math.min(uncheckedCount, 50)})
                  </>
                )}
              </Button>
              <ExportDialog
                onExport={handleExport}
                defaultFilename={`subdomains-${domain}-${new Date().toISOString().split('T')[0]}`}
                resultCount={filteredResults.length}
                description="Export subdomains to a text file"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Filter subdomains..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 bg-card border-border font-mono"
              />
            </div>
            <Button
              variant={showOnlyLive ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlyLive(!showOnlyLive)}
              className={showOnlyLive ? "bg-success hover:bg-success/90" : ""}
            >
              Show only live
            </Button>
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-bold text-primary">Subdomain</TableHead>
                  <TableHead className="font-bold text-primary">Source</TableHead>
                  <TableHead className="font-bold text-primary">Status</TableHead>
                  <TableHead className="font-bold text-primary w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8 font-mono">
                      No subdomains match your filter
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result, index) => (
                    <TableRow
                      key={result.subdomain}
                      className="border-border hover:bg-muted/30 animate-fade-in"
                      style={{ animationDelay: `${Math.min(index * 20, 500)}ms` }}
                    >
                      <TableCell className="font-mono text-foreground">
                        {result.subdomain}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {result.source.split(', ').map(src => (
                            <Badge
                              key={src}
                              variant="outline"
                              className="text-xs border-muted text-muted-foreground"
                            >
                              {src}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(result)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://${result.subdomain}`, '_blank')}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4 font-mono">
            Tip: Live check is limited to 50 subdomains per request to avoid timeouts
          </p>
        </>
      )}

      {/* Empty State */}
      {!hasScanned && !isScanning && (
        <div className="text-center py-12">
          <Globe className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground font-mono">
            Enter a domain above to start subdomain enumeration
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {SOURCES.map(source => (
              <Badge key={source} variant="outline" className="text-xs">
                {source}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
