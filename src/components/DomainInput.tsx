import { useState } from "react";
import { Search, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DomainInputProps {
  onScan: (domain: string) => void;
  isScanning: boolean;
}

export function DomainInput({ onScan, isScanning }: DomainInputProps) {
  const [domain, setDomain] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      onScan(domain.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4">
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
            className="px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold animate-pulse-glow"
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
  );
}
