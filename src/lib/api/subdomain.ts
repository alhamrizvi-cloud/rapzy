import { supabase } from '@/integrations/supabase/client';

export interface SubdomainResult {
  subdomain: string;
  source: string;
  isLive?: boolean;
  statusCode?: number;
  ip?: string;
  checkedAt?: string;
}

export interface ScanResult {
  success: boolean;
  subdomains: SubdomainResult[];
  error?: string;
  scanTime?: number;
}

export const subdomainApi = {
  async enumerate(domain: string): Promise<ScanResult> {
    const { data, error } = await supabase.functions.invoke('subdomain-enum', {
      body: { domain },
    });

    if (error) {
      return { success: false, subdomains: [], error: error.message };
    }
    return data;
  },

  async checkLive(subdomains: string[]): Promise<{ results: SubdomainResult[]; error?: string }> {
    const { data, error } = await supabase.functions.invoke('check-live-hosts', {
      body: { subdomains },
    });

    if (error) {
      return { results: [], error: error.message };
    }
    return data;
  },
};
