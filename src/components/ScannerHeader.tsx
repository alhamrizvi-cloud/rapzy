import { Shield, Radar } from "lucide-react";

export function ScannerHeader() {
  return (
    <header className="relative py-8 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <Shield className="w-12 h-12 text-primary" />
            <Radar className="w-6 h-6 text-accent absolute -bottom-1 -right-1 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-glow text-primary">Sub</span>
            <span className="text-foreground">Finder</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto font-mono">
          <span className="text-primary">&gt;</span> Discover hidden subdomains using 
          <span className="text-primary"> crt.sh</span>, 
          <span className="text-accent"> AlienVault</span> & more
        </p>
        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Certificate Transparency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Passive DNS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>Live Host Check</span>
          </div>
        </div>
      </div>
    </header>
  );
}
