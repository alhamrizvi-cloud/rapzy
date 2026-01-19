import { useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Download, 
  ExternalLink,
  Filter,
  Zap
} from "lucide-react";
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
import type { SubdomainResult } from "@/lib/api/subdomain";

interface ResultsTableProps {
  results: SubdomainResult[];
  scanTime?: number;
  onCheckLive: (subdomains: string[]) => void;
  isCheckingLive: boolean;
}

export function ResultsTable({ 
  results, 
  scanTime, 
  onCheckLive,
  isCheckingLive 
}: ResultsTableProps) {
  const [filter, setFilter] = useState("");
  const [showOnlyLive, setShowOnlyLive] = useState(false);

  const filteredResults = results.filter(r => {
    const matchesFilter = r.subdomain.toLowerCase().includes(filter.toLowerCase());
    const matchesLive = !showOnlyLive || r.isLive === true;
    return matchesFilter && matchesLive;
  });

  const liveCount = results.filter(r => r.isLive === true).length;
  const deadCount = results.filter(r => r.isLive === false).length;
  const uncheckedCount = results.filter(r => r.isLive === undefined).length;

  const handleExportCSV = () => {
    const headers = ['Subdomain', 'Source', 'Status', 'HTTP Code'];
    const rows = filteredResults.map(r => [
      r.subdomain,
      r.source,
      r.isLive === true ? 'Live' : r.isLive === false ? 'Dead' : 'Unknown',
      r.statusCode || '',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subdomains-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCheckLive = () => {
    const subdomainsToCheck = results
      .filter(r => r.isLive === undefined)
      .map(r => r.subdomain);
    onCheckLive(subdomainsToCheck);
  };

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="border-accent/50 text-accent hover:bg-accent/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
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
              <TableHead className="font-mono text-primary">Subdomain</TableHead>
              <TableHead className="font-mono text-primary">Source</TableHead>
              <TableHead className="font-mono text-primary">Status</TableHead>
              <TableHead className="font-mono text-primary w-[100px]">Actions</TableHead>
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
    </div>
  );
}
