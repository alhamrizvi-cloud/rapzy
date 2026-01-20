import { useState } from "react";
import { Link2, ArrowLeft, Loader2, Search, ExternalLink, Clock } from "lucide-react";
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
import { reconApi, exportUtils, type UrlResult } from "@/lib/api/recon";
import { useToast } from "@/hooks/use-toast";
import { Filter } from "lucide-react";

const SOURCES = [
  'Wayback Machine',
  'Common Crawl',
  'AlienVault OTX',
  'URLScan.io',
];

interface UrlDiscoveryProps {
  onBack: () => void;
}

export function UrlDiscovery({ onBack }: UrlDiscoveryProps) {
  const { toast } = useToast();
  const [target, setTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<UrlResult[]>([]);
  const [scanTime, setScanTime] = useState<number>();
  const [hasScanned, setHasScanned] = useState(false);
  const [filter, setFilter] = useState("");

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim()) return;

    setIsScanning(true);
    setResults([]);
    setHasScanned(false);

    try {
      const response = await reconApi.discoverUrls(target.trim());

      if (response.success) {
        setResults(response.urls);
        setScanTime(response.scanTime);
        setHasScanned(true);
        toast({
          title: "Discovery Complete",
          description: `Found ${response.urls.length} URLs for ${target}`,
        });
      } else {
        toast({
          title: "Discovery Failed",
          description: response.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("URL discovery error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to the discovery service",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleExport = (filename: string) => {
    exportUtils.exportUrls(filename, filteredResults);
    toast({
      title: "Exported",
      description: `Saved ${filteredResults.length} URLs to ${filename}.txt`,
    });
  };

  const filteredResults = results.filter(r =>
    r.url.toLowerCase().includes(filter.toLowerCase())
  );

  const scanSteps = SOURCES.map((source, i) => ({
    label: `Querying ${source}...`,
    status: i < 2 ? 'complete' as const : i === 2 ? 'active' as const : 'pending' as const,
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
            <Link2 className="w-5 h-5 text-accent" />
            URL Discovery
          </h2>
          <p className="text-sm text-muted-foreground font-mono">
            Find URLs from Wayback Machine, Common Crawl & more
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleScan} className="mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-accent/10 rounded-lg blur-xl" />
          <div className="relative flex gap-2 p-2 bg-card border border-border rounded-lg terminal-border">
            <div className="flex items-center pl-3 text-muted-foreground">
              <Link2 className="w-5 h-5" />
            </div>
            <Input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Enter domain or subdomain (e.g., example.com)"
              className="flex-1 bg-transparent border-0 text-lg font-mono focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
              disabled={isScanning}
            />
            <Button
              type="submit"
              disabled={isScanning || !target.trim()}
              className="px-6 bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Discovering
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Discover
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
            title={`Discovering URLs for ${target}...`}
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
                <span className="text-accent ml-2 font-bold">{results.length}</span>
                <span className="text-muted-foreground ml-1">URLs</span>
              </div>
              {scanTime && (
                <div className="text-sm font-mono text-muted-foreground">
                  in {(scanTime / 1000).toFixed(2)}s
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <ExportDialog
                onExport={handleExport}
                defaultFilename={`urls-${target}-${new Date().toISOString().split('T')[0]}`}
                resultCount={filteredResults.length}
                description="Export discovered URLs to a text file"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Filter URLs..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 bg-card border-border font-mono"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-bold text-accent">URL</TableHead>
                  <TableHead className="font-bold text-accent">Source</TableHead>
                  <TableHead className="font-bold text-accent">Timestamp</TableHead>
                  <TableHead className="font-bold text-accent w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8 font-mono">
                      No URLs match your filter
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.slice(0, 500).map((result, index) => (
                    <TableRow
                      key={`${result.url}-${index}`}
                      className="border-border hover:bg-muted/30 animate-fade-in"
                      style={{ animationDelay: `${Math.min(index * 10, 300)}ms` }}
                    >
                      <TableCell className="font-mono text-foreground text-xs max-w-md truncate">
                        {result.url}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs border-muted text-muted-foreground">
                          {result.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground text-xs">
                        {result.timestamp ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {result.timestamp}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(result.url, '_blank')}
                          className="text-muted-foreground hover:text-accent"
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

          {filteredResults.length > 500 && (
            <p className="text-xs text-muted-foreground text-center mt-4 font-mono">
              Showing first 500 of {filteredResults.length} URLs. Export to see all.
            </p>
          )}
        </>
      )}

      {/* Empty State */}
      {!hasScanned && !isScanning && (
        <div className="text-center py-12">
          <Link2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground font-mono">
            Enter a domain to discover historical and crawled URLs
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
