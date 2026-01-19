import { Loader2 } from "lucide-react";

interface ScanProgressProps {
  domain: string;
}

export function ScanProgress({ domain }: ScanProgressProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-card border border-border rounded-lg p-6 terminal-border relative overflow-hidden">
        <div className="absolute inset-0 scan-line pointer-events-none" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="font-mono text-foreground">
              Scanning <span className="text-primary">{domain}</span>
            </span>
          </div>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center gap-2 text-muted-foreground animate-slide-in" style={{ animationDelay: '0ms' }}>
              <span className="text-success">✓</span>
              <span>Querying crt.sh certificate transparency logs...</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground animate-slide-in" style={{ animationDelay: '200ms' }}>
              <span className="text-success">✓</span>
              <span>Fetching from HackerTarget API...</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground animate-slide-in" style={{ animationDelay: '400ms' }}>
              <span className="text-success">✓</span>
              <span>Querying AlienVault OTX passive DNS...</span>
            </div>
            <div className="flex items-center gap-2 text-primary animate-slide-in" style={{ animationDelay: '600ms' }}>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Deduplicating and sorting results...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
