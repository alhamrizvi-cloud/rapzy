import { useState, useRef } from "react";
import { Upload, FileText, X, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface FileInputProps {
  onDataLoad: (data: string[]) => void;
  placeholder?: string;
  label?: string;
}

export function FileInput({ 
  onDataLoad, 
  placeholder = "Paste domains/URLs here (one per line) or upload a .txt file",
  label = "Input Data"
}: FileInputProps) {
  const [textValue, setTextValue] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseInput = (text: string): string[] => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'));
  };

  const handleTextChange = (value: string) => {
    setTextValue(value);
    const data = parseInput(value);
    if (data.length > 0) {
      onDataLoad(data);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      toast({
        title: "Invalid File",
        description: "Please upload a .txt file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTextValue(content);
      setFileName(file.name);
      const data = parseInput(content);
      onDataLoad(data);
      toast({
        title: "File Loaded",
        description: `Loaded ${data.length} items from ${file.name}`,
      });
    };
    reader.readAsText(file);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleTextChange(text);
      toast({
        title: "Pasted",
        description: "Content pasted from clipboard",
      });
    } catch (err) {
      toast({
        title: "Paste Failed",
        description: "Could not access clipboard",
        variant: "destructive",
      });
    }
  };

  const clearInput = () => {
    setTextValue("");
    setFileName(null);
    onDataLoad([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-foreground">{label}</label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePaste}
            className="border-border text-muted-foreground hover:text-foreground"
          >
            <Clipboard className="w-3 h-3 mr-1" />
            Paste
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="border-border text-muted-foreground hover:text-foreground"
          >
            <Upload className="w-3 h-3 mr-1" />
            Upload TXT
          </Button>
          {(textValue || fileName) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearInput}
              className="text-destructive hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      {fileName && (
        <div className="flex items-center gap-2 text-sm text-primary font-mono bg-primary/10 px-3 py-2 rounded-lg">
          <FileText className="w-4 h-4" />
          <span>{fileName}</span>
        </div>
      )}

      <Textarea
        value={textValue}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[120px] font-mono text-sm bg-card border-border resize-y"
      />

      <p className="text-xs text-muted-foreground font-mono">
        {parseInput(textValue).length} items loaded
      </p>
    </div>
  );
}
