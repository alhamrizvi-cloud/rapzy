import { Loader2, CheckCircle2 } from "lucide-react";

interface ProgressStep {
  label: string;
  status: 'pending' | 'active' | 'complete';
}

interface ProgressIndicatorProps {
  title: string;
  steps: ProgressStep[];
  currentStep?: string;
}

export function ProgressIndicator({ title, steps, currentStep }: ProgressIndicatorProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 terminal-border relative overflow-hidden">
      <div className="absolute inset-0 scan-line pointer-events-none" />
      <div className="relative space-y-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="font-bold text-foreground">{title}</span>
        </div>
        <div className="space-y-2 font-mono text-sm">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex items-center gap-2 animate-slide-in ${
                step.status === 'complete' ? 'text-success' :
                step.status === 'active' ? 'text-primary' :
                'text-muted-foreground'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {step.status === 'complete' ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : step.status === 'active' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <span className="w-3 h-3 rounded-full border border-current" />
              )}
              <span>{step.label}</span>
            </div>
          ))}
        </div>
        {currentStep && (
          <p className="text-xs text-muted-foreground font-mono mt-2">
            <span className="text-primary">&gt;</span> {currentStep}
          </p>
        )}
      </div>
    </div>
  );
}
