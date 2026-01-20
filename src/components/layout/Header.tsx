import { Shield, Radar } from "lucide-react";

export function Header() {
  return (
    <header className="relative py-6 px-4 border-b border-border/50">
      <div className="max-w-6xl mx-auto">
        {/* ASCII Art Logo - Desktop */}
        <pre className="text-primary text-[10px] md:text-xs font-mono leading-tight mb-3 text-glow hidden md:block text-center">
{`██████╗  █████╗ ██████╗ ███████╗██╗   ██╗
██╔══██╗██╔══██╗██╔══██╗╚══███╔╝╚██╗ ██╔╝
██████╔╝███████║██████╔╝  ███╔╝  ╚████╔╝ 
██╔══██╗██╔══██║██╔═══╝  ███╔╝    ╚██╔╝  
██║  ██║██║  ██║██║     ███████╗   ██║   
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚══════╝   ╚═╝`}
        </pre>
        
        {/* Mobile fallback */}
        <div className="flex items-center justify-center gap-3 md:hidden">
          <div className="relative">
            <Shield className="w-8 h-8 text-primary" />
            <Radar className="w-4 h-4 text-accent absolute -bottom-1 -right-1 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-glow text-primary">
            RAPZY
          </h1>
        </div>

        <p className="text-muted-foreground text-center font-bold text-lg mt-2">
          <span className="text-primary font-mono">&gt;</span> Recon Framework
        </p>
        <p className="text-muted-foreground/70 text-center text-sm font-mono mt-1">
          Subdomain Enumeration • Live Host Discovery • URL Reconnaissance
        </p>
      </div>
    </header>
  );
}
