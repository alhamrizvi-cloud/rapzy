const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubdomainResult {
  subdomain: string;
  source: string;
}

async function fetchFromCrtSh(domain: string): Promise<SubdomainResult[]> {
  console.log(`[crt.sh] Fetching subdomains for ${domain}`);
  
  try {
    const response = await fetch(
      `https://crt.sh/?q=%.${encodeURIComponent(domain)}&output=json`,
      {
        headers: {
          'User-Agent': 'SubdomainFinder/1.0',
        },
      }
    );

    if (!response.ok) {
      console.log(`[crt.sh] Request failed with status ${response.status}`);
      return [];
    }

    const data = await response.json();
    const subdomains = new Set<string>();

    for (const entry of data) {
      const names = entry.name_value?.split('\n') || [];
      for (const name of names) {
        const cleaned = name.trim().toLowerCase();
        if (cleaned && cleaned.endsWith(domain) && !cleaned.startsWith('*')) {
          subdomains.add(cleaned);
        }
      }
    }

    console.log(`[crt.sh] Found ${subdomains.size} unique subdomains`);
    return Array.from(subdomains).map(sub => ({ subdomain: sub, source: 'crt.sh' }));
  } catch (error) {
    console.error('[crt.sh] Error:', error);
    return [];
  }
}

async function fetchFromHackerTarget(domain: string): Promise<SubdomainResult[]> {
  console.log(`[HackerTarget] Fetching subdomains for ${domain}`);
  
  try {
    const response = await fetch(
      `https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(domain)}`,
      {
        headers: {
          'User-Agent': 'SubdomainFinder/1.0',
        },
      }
    );

    if (!response.ok) {
      console.log(`[HackerTarget] Request failed with status ${response.status}`);
      return [];
    }

    const text = await response.text();
    
    if (text.includes('error') || text.includes('API count exceeded')) {
      console.log('[HackerTarget] API limit or error');
      return [];
    }

    const lines = text.split('\n').filter(line => line.trim());
    const subdomains = new Set<string>();

    for (const line of lines) {
      const parts = line.split(',');
      if (parts[0]) {
        const cleaned = parts[0].trim().toLowerCase();
        if (cleaned && cleaned.endsWith(domain)) {
          subdomains.add(cleaned);
        }
      }
    }

    console.log(`[HackerTarget] Found ${subdomains.size} unique subdomains`);
    return Array.from(subdomains).map(sub => ({ subdomain: sub, source: 'HackerTarget' }));
  } catch (error) {
    console.error('[HackerTarget] Error:', error);
    return [];
  }
}

async function fetchFromAlienVault(domain: string): Promise<SubdomainResult[]> {
  console.log(`[AlienVault] Fetching subdomains for ${domain}`);
  
  try {
    const response = await fetch(
      `https://otx.alienvault.com/api/v1/indicators/domain/${encodeURIComponent(domain)}/passive_dns`,
      {
        headers: {
          'User-Agent': 'RAPZY-Recon/1.0',
        },
      }
    );

    if (!response.ok) {
      console.log(`[AlienVault] Request failed with status ${response.status}`);
      return [];
    }

    const data = await response.json();
    const subdomains = new Set<string>();

    for (const entry of data.passive_dns || []) {
      const hostname = entry.hostname?.trim().toLowerCase();
      if (hostname && hostname.endsWith(domain)) {
        subdomains.add(hostname);
      }
    }

    console.log(`[AlienVault] Found ${subdomains.size} unique subdomains`);
    return Array.from(subdomains).map(sub => ({ subdomain: sub, source: 'AlienVault' }));
  } catch (error) {
    console.error('[AlienVault] Error:', error);
    return [];
  }
}

// ThreatCrowd API
async function fetchFromThreatCrowd(domain: string): Promise<SubdomainResult[]> {
  console.log(`[ThreatCrowd] Fetching subdomains for ${domain}`);
  
  try {
    const response = await fetch(
      `https://www.threatcrowd.org/searchApi/v2/domain/report/?domain=${encodeURIComponent(domain)}`,
      {
        headers: {
          'User-Agent': 'RAPZY-Recon/1.0',
        },
      }
    );

    if (!response.ok) {
      console.log(`[ThreatCrowd] Request failed with status ${response.status}`);
      return [];
    }

    const data = await response.json();
    const subdomains = new Set<string>();

    for (const sub of data.subdomains || []) {
      const cleaned = sub.trim().toLowerCase();
      if (cleaned && cleaned.endsWith(domain)) {
        subdomains.add(cleaned);
      }
    }

    console.log(`[ThreatCrowd] Found ${subdomains.size} unique subdomains`);
    return Array.from(subdomains).map(sub => ({ subdomain: sub, source: 'ThreatCrowd' }));
  } catch (error) {
    console.error('[ThreatCrowd] Error:', error);
    return [];
  }
}

// URLScan.io search for subdomains
async function fetchFromUrlScan(domain: string): Promise<SubdomainResult[]> {
  console.log(`[URLScan] Fetching subdomains for ${domain}`);
  
  try {
    const response = await fetch(
      `https://urlscan.io/api/v1/search/?q=domain:${encodeURIComponent(domain)}&size=100`,
      {
        headers: {
          'User-Agent': 'RAPZY-Recon/1.0',
        },
      }
    );

    if (!response.ok) {
      console.log(`[URLScan] Request failed with status ${response.status}`);
      return [];
    }

    const data = await response.json();
    const subdomains = new Set<string>();

    for (const result of data.results || []) {
      const hostname = result.page?.domain?.toLowerCase();
      if (hostname && hostname.endsWith(domain)) {
        subdomains.add(hostname);
      }
    }

    console.log(`[URLScan] Found ${subdomains.size} unique subdomains`);
    return Array.from(subdomains).map(sub => ({ subdomain: sub, source: 'URLScan.io' }));
  } catch (error) {
    console.error('[URLScan] Error:', error);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { domain } = await req.json();

    if (!domain) {
      return new Response(
        JSON.stringify({ success: false, error: 'Domain is required', subdomains: [] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean domain
    let cleanDomain = domain.trim().toLowerCase();
    cleanDomain = cleanDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');

    console.log(`Starting subdomain enumeration for: ${cleanDomain}`);

    // Fetch from all sources in parallel
    const [crtResults, hackerTargetResults, alienVaultResults, threatCrowdResults, urlScanResults] = await Promise.all([
      fetchFromCrtSh(cleanDomain),
      fetchFromHackerTarget(cleanDomain),
      fetchFromAlienVault(cleanDomain),
      fetchFromThreatCrowd(cleanDomain),
      fetchFromUrlScan(cleanDomain),
    ]);

    // Merge and deduplicate
    const allResults = [...crtResults, ...hackerTargetResults, ...alienVaultResults, ...threatCrowdResults, ...urlScanResults];
    const uniqueSubdomains = new Map<string, SubdomainResult>();

    for (const result of allResults) {
      if (!uniqueSubdomains.has(result.subdomain)) {
        uniqueSubdomains.set(result.subdomain, result);
      } else {
        // Append source if different
        const existing = uniqueSubdomains.get(result.subdomain)!;
        if (!existing.source.includes(result.source)) {
          existing.source += `, ${result.source}`;
        }
      }
    }

    const subdomains = Array.from(uniqueSubdomains.values()).sort((a, b) => 
      a.subdomain.localeCompare(b.subdomain)
    );

    const scanTime = Date.now() - startTime;
    console.log(`Enumeration complete. Found ${subdomains.length} unique subdomains in ${scanTime}ms`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        subdomains,
        scanTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in subdomain enumeration:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to enumerate subdomains',
        subdomains: [],
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
