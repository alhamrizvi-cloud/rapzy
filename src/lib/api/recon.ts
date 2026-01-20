import { supabase } from '@/integrations/supabase/client';

export interface SubdomainResult {
  subdomain: string;
  source: string;
  isLive?: boolean;
  statusCode?: number;
  ip?: string;
  checkedAt?: string;
}

export interface UrlResult {
  url: string;
  source: string;
  timestamp?: string;
  statusCode?: number;
  contentType?: string;
}

export interface ScanResult {
  success: boolean;
  subdomains: SubdomainResult[];
  error?: string;
  scanTime?: number;
  sources?: string[];
}

export interface UrlDiscoveryResult {
  success: boolean;
  urls: UrlResult[];
  error?: string;
  scanTime?: number;
}

export interface LiveCheckResult {
  results: SubdomainResult[];
  error?: string;
  liveCount?: number;
  deadCount?: number;
}

export const reconApi = {
  // Subdomain Enumeration
  async enumerateSubdomains(domain: string): Promise<ScanResult> {
    const { data, error } = await supabase.functions.invoke('subdomain-enum', {
      body: { domain },
    });

    if (error) {
      return { success: false, subdomains: [], error: error.message };
    }
    return data;
  },

  // Live Host Check
  async checkLiveHosts(subdomains: string[]): Promise<LiveCheckResult> {
    const { data, error } = await supabase.functions.invoke('check-live-hosts', {
      body: { subdomains },
    });

    if (error) {
      return { results: [], error: error.message };
    }
    return data;
  },

  // URL Discovery
  async discoverUrls(target: string): Promise<UrlDiscoveryResult> {
    const { data, error } = await supabase.functions.invoke('url-discovery', {
      body: { target },
    });

    if (error) {
      return { success: false, urls: [], error: error.message };
    }
    return data;
  },
};

// File export utilities
export const exportUtils = {
  exportToTxt(filename: string, data: string[]): void {
    const content = data.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportSubdomains(filename: string, results: SubdomainResult[]): void {
    const lines = results.map(r => {
      const status = r.isLive === true ? '[LIVE]' : r.isLive === false ? '[DEAD]' : '[UNKNOWN]';
      return `${r.subdomain} | ${r.source} | ${status}${r.statusCode ? ` (${r.statusCode})` : ''}`;
    });
    this.exportToTxt(filename, lines);
  },

  exportUrls(filename: string, results: UrlResult[]): void {
    const lines = results.map(r => `${r.url} | ${r.source}${r.timestamp ? ` | ${r.timestamp}` : ''}`);
    this.exportToTxt(filename, lines);
  },

  exportLiveHosts(filename: string, results: SubdomainResult[], onlyLive: boolean = false): void {
    const filtered = onlyLive ? results.filter(r => r.isLive === true) : results;
    const lines = filtered.map(r => r.subdomain);
    this.exportToTxt(filename, lines);
  },
};
