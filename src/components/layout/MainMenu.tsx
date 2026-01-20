import { Globe, Activity, Link2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ReconModule = 'subdomain' | 'livehost' | 'urldiscovery';

interface MainMenuProps {
  activeModule: ReconModule | null;
  onSelectModule: (module: ReconModule) => void;
}

const modules = [
  {
    id: 'subdomain' as ReconModule,
    title: 'Subdomain Enumeration',
    description: 'Find all subdomains using CT logs, passive DNS, threat intel & more',
    icon: Globe,
    color: 'primary',
  },
  {
    id: 'livehost' as ReconModule,
    title: 'Live Host Discovery',
    description: 'Probe hosts to find live & dead targets from your list',
    icon: Activity,
    color: 'success',
  },
  {
    id: 'urldiscovery' as ReconModule,
    title: 'URL Discovery',
    description: 'Find URLs using Wayback Machine, Common Crawl & more',
    icon: Link2,
    color: 'accent',
  },
];

export function MainMenu({ activeModule, onSelectModule }: MainMenuProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-foreground mb-2">
          <span className="text-primary font-mono">[</span>
          Select Module
          <span className="text-primary font-mono">]</span>
        </h2>
        <p className="text-muted-foreground text-sm font-mono">
          Choose what you want to do
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <Button
              key={module.id}
              variant="outline"
              onClick={() => onSelectModule(module.id)}
              className={`
                h-auto p-6 flex flex-col items-start gap-3 text-left
                border-2 transition-all duration-300
                hover:scale-[1.02] hover:shadow-lg
                ${isActive 
                  ? `border-${module.color} bg-${module.color}/10 shadow-${module.color}/20 shadow-lg` 
                  : 'border-border hover:border-muted-foreground/50'
                }
              `}
              style={{
                borderColor: isActive ? `hsl(var(--${module.color}))` : undefined,
                backgroundColor: isActive ? `hsl(var(--${module.color}) / 0.1)` : undefined,
              }}
            >
              <div className="flex items-center gap-3 w-full">
                <div 
                  className={`p-2 rounded-lg`}
                  style={{ backgroundColor: `hsl(var(--${module.color}) / 0.2)` }}
                >
                  <Icon 
                    className="w-5 h-5" 
                    style={{ color: `hsl(var(--${module.color}))` }}
                  />
                </div>
                <ChevronRight 
                  className={`w-4 h-4 ml-auto transition-transform ${isActive ? 'rotate-90' : ''}`}
                  style={{ color: isActive ? `hsl(var(--${module.color}))` : undefined }}
                />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">{module.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 font-mono leading-relaxed">
                  {module.description}
                </p>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
