import { useState } from "react";
import { Activity, ArrowLeft, Loader2, CheckCircle2, XCircle, ExternalLink, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileInput } from "@/components/common/FileInput";
import { ExportDialog } from "@/components/common/ExportDialog";
import { ProgressIndicator } from "@/components/common/ProgressIndicator";
import { reconApi, exportUtils, type SubdomainResult } from "@/lib/api/recon";
import { useToast } from "@/hooks/use-toast";

interface LiveHostCheckerProps {
  onBack: () => void;
}

export function LiveHostChecker({ onBack }: LiveHostCheckerProps) {
  const { toast } = useToast();
  const [inputHosts, setInputHosts] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<SubdomainResult[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [progress, setProgress] = useState({ checked: 0, total: 0 });

  const handleCheck = async () => {
    if (inputHosts.length === 0) {
      toast({
        title: "No Hosts",
        description: "Please enter or upload hosts to check",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    setResults([]);
    setHasChecked(false);
    setProgress({ checked: 0, total: inputHosts.length });

    try {
      // Process in batches of 50
      const batchSize = 50;
      const allResults: SubdomainResult[] = [];

      for (let i = 0; i < inputHosts.length; i += batchSize) {
        const batch = inputHosts.slice(i, i + batchSize);
        const response = await reconApi.checkLiveHosts(batch);

        if (response.results) {
          allResults.push(...response.results);
          setProgress({ checked: Math.min(i + batchSize, inputHosts.length), total: inputHosts.length });
        }
      }

      setResults(allResults);
      setHasChecked(true);

      const liveCount = allResults.filter(r => r.isLive).length;
      toast({
        title: "Check Complete",
        description: `${liveCount}/${allResults.length} hosts are live`,
      });
    } catch (error) {
      console.error("Live check error:", error);
      toast({
        title: "Error",
        description: "Failed to check hosts",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleExportAll = (filename: string) => {
    exportUtils.exportLiveHosts(filename, results, false);
    toast({
      title: "Exported",
      description: `Saved ${results.length} hosts to ${filename}.txt`,
    });
  };

  const handleExportLive = (filename: string) => {
    const liveHosts = results.filter(r => r.isLive);
    exportUtils.exportLiveHosts(filename, liveHosts, true);
    toast({
      title: "Exported",
      description: `Saved ${liveHosts.length} live hosts to ${filename}.txt`,
    });
  };

  const liveCount = results.filter(r => r.isLive === true).length;
  const deadCount = results.filter(r => r.isLive === false).length;

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
            <Activity className="w-5 h-5 text-success" />
            Live Host Discovery
          </h2>
          <p className="text-sm text-muted-foreground font-mono">
            Probe hosts to find live & dead targets
          </p>
        </div>
      </div>

      {/* Input */}
      {!hasChecked && !isChecking && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <FileInput
            onDataLoad={setInputHosts}
            placeholder="Enter hosts (one per line) e.g.&#10;example.com&#10;sub.example.com&#10;api.example.com"
            label="Target Hosts"
          />
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleCheck}
              disabled={inputHosts.length === 0}
              className="bg-success hover:bg-success/90 font-bold"
            >
              <Zap className="w-4 h-4 mr-2" />
              Check {inputHosts.length} Hosts
            </Button>
          </div>
        </div>
      )}

      {/* Progress */}
      {isChecking && (
        <div className="mb-6">
          <ProgressIndicator
            title="Checking hosts..."
            steps={[
              { label: `Probing HTTPS endpoints...`, status: 'active' },
              { label: `Fallback to HTTP...`, status: 'pending' },
              { label: `Recording status codes...`, status: 'pending' },
            ]}
            currentStep={`Checked ${progress.checked}/${progress.total} hosts`}
          />
        </div>
      )}

      {/* Results */}
      {hasChecked && !isChecking && (
        <>
          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-card border border-border rounded-lg">
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-sm font-mono">
                <span className="text-muted-foreground">Checked:</span>
                <span className="text-foreground ml-2 font-bold">{results.length}</span>
                <span className="text-muted-foreground ml-1">hosts</span>
              </div>
              <div className="flex gap-3 text-sm font-mono">
                <span className="text-success font-bold">{liveCount} live</span>
                <span className="text-destructive font-bold">{deadCount} dead</span>
              </div>
            </div>
            <div className="flex gap-2">
              <ExportDialog
                onExport={handleExportLive}
                defaultFilename={`live-hosts-${new Date().toISOString().split('T')[0]}`}
                buttonText="Export Live"
                resultCount={liveCount}
                description="Export only live hosts"
              />
              <ExportDialog
                onExport={handleExportAll}
                defaultFilename={`all-hosts-${new Date().toISOString().split('T')[0]}`}
                buttonText="Export All"
                resultCount={results.length}
                description="Export all checked hosts"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setResults([]);
                  setHasChecked(false);
                  setInputHosts([]);
                }}
                className="border-border"
              >
                New Check
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-bold text-success">Host</TableHead>
                  <TableHead className="font-bold text-success">Status</TableHead>
                  <TableHead className="font-bold text-success">HTTP Code</TableHead>
                  <TableHead className="font-bold text-success w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow
                    key={result.subdomain}
                    className="border-border hover:bg-muted/30 animate-fade-in"
                    style={{ animationDelay: `${Math.min(index * 10, 300)}ms` }}
                  >
                    <TableCell className="font-mono text-foreground">
                      {result.subdomain}
                    </TableCell>
                    <TableCell>
                      {result.isLive ? (
                        <Badge className="bg-success/20 text-success border-success/30 border">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Live
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-destructive border-destructive/30">
                          <XCircle className="w-3 h-3 mr-1" />
                          Dead
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {result.statusCode || '-'}
                    </TableCell>
                    <TableCell>
                      {result.isLive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://${result.subdomain}`, '_blank')}
                          className="text-muted-foreground hover:text-success"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Empty State */}
      {!hasChecked && !isChecking && inputHosts.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground font-mono">
            Enter or upload a list of hosts to check their live status
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2 font-mono">
            Supports .txt files or paste directly
          </p>
        </div>
      )}
    </div>
  );
}
