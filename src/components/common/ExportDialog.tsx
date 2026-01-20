import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ExportDialogProps {
  onExport: (filename: string) => void;
  defaultFilename: string;
  buttonText?: string;
  description?: string;
  resultCount?: number;
}

export function ExportDialog({
  onExport,
  defaultFilename,
  buttonText = "Export TXT",
  description = "Save results to a text file",
  resultCount,
}: ExportDialogProps) {
  const [filename, setFilename] = useState(defaultFilename);
  const [open, setOpen] = useState(false);

  const handleExport = () => {
    onExport(filename);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-accent/50 text-accent hover:bg-accent/10"
        >
          <Download className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            Export Results
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
            {resultCount !== undefined && (
              <span className="block mt-1 text-primary font-mono">
                {resultCount} items will be exported
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label className="text-sm text-muted-foreground font-mono mb-2 block">
            Filename
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
              className="font-mono bg-background border-border"
            />
            <span className="text-muted-foreground font-mono">.txt</span>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            className="bg-primary hover:bg-primary/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Save File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
