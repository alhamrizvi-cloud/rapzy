const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UrlResult {
  url: string;
  source: string;
  timestamp?: string;
}

// Wayback Machine CDX API
async function fetchFromWayback(target: string): Promise<UrlResult[]> {
  console.log(`[Wayback] Fetching URLs for ${target}`);
  
  try {
    const response = await fetch(
      `https://web.archive.org/cdx/search/cdx?url=*.${encodeURIComponent(target)}/*&output=json&fl=original,timestamp&collapse=urlkey&limit=1000`,
      {
        headers: {
          'User-Agent': 'RAPZY-Recon/1.0',
        },
      }
    );

    if (!response.ok) {
      console.log(`[Wayback] Request failed with status ${response.status}`);
      return [];
    }

    const data = await response.json();
    const urls = new Map<string, UrlResult>();

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const [url, timestamp] = data[i];
      if (url && !urls.has(url)) {
        urls.set(url, {
          url,
          source: 'Wayback Machine',
          timestamp: timestamp ? `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}` : undefined,
        });
      }
    }

    console.log(`[Wayback] Found ${urls.size} unique URLs`);
    return Array.from(urls.values());
  } catch (error) {
    console.error('[Wayback] Error:', error);
    return [];
  }
}

// AlienVault OTX URL indicator
async function fetchFromAlienVaultUrls(target: string): Promise<UrlResult[]> {
  console.log(`[AlienVault] Fetching URLs for ${target}`);
  
  try {
    const response = await fetch(
      `https://otx.alienvault.com/api/v1/indicators/domain/${encodeURIComponent(target)}/url_list`,
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
    const urls: UrlResult[] = [];

    for (const entry of data.url_list || []) {
      if (entry.url) {
        urls.push({
          url: entry.url,
          source: 'AlienVault OTX',
          timestamp: entry.date ? entry.date.split('T')[0] : undefined,
        });
      }
    }

    console.log(`[AlienVault] Found ${urls.length} URLs`);
    return urls;
  } catch (error) {
    console.error('[AlienVault] Error:', error);
    return [];
  }
}

// URLScan.io search
async function fetchFromUrlScan(target: string): Promise<UrlResult[]> {
  console.log(`[URLScan] Fetching URLs for ${target}`);
  
  try {
    const response = await fetch(
      `https://urlscan.io/api/v1/search/?q=domain:${encodeURIComponent(target)}&size=100`,
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
    const urls: UrlResult[] = [];

    for (const result of data.results || []) {
      if (result.page?.url) {
        urls.push({
          url: result.page.url,
          source: 'URLScan.io',
          timestamp: result.task?.time ? result.task.time.split('T')[0] : undefined,
        });
      }
    }

    console.log(`[URLScan] Found ${urls.length} URLs`);
    return urls;
  } catch (error) {
    console.error('[URLScan] Error:', error);
    return [];
  }
}

// Common Crawl Index
async function fetchFromCommonCrawl(target: string): Promise<UrlResult[]> {
  console.log(`[CommonCrawl] Fetching URLs for ${target}`);
  
  try {
    // Use the latest index
    const response = await fetch(
      `https://index.commoncrawl.org/CC-MAIN-2024-10-index?url=*.${encodeURIComponent(target)}&output=json&limit=500`,
      {
        headers: {
          'User-Agent': 'RAPZY-Recon/1.0',
        },
      }
    );

    if (!response.ok) {
      console.log(`[CommonCrawl] Request failed with status ${response.status}`);
      return [];
    }

    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim());
    const urls = new Map<string, UrlResult>();

    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        if (data.url && !urls.has(data.url)) {
          urls.set(data.url, {
            url: data.url,
            source: 'Common Crawl',
            timestamp: data.timestamp ? `${data.timestamp.slice(0, 4)}-${data.timestamp.slice(4, 6)}` : undefined,
          });
        }
      } catch {
        // Skip invalid JSON lines
      }
    }

    console.log(`[CommonCrawl] Found ${urls.size} unique URLs`);
    return Array.from(urls.values());
  } catch (error) {
    console.error('[CommonCrawl] Error:', error);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { target } = await req.json();

    if (!target) {
      return new Response(
        JSON.stringify({ success: false, error: 'Target is required', urls: [] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean target
    let cleanTarget = target.trim().toLowerCase();
    cleanTarget = cleanTarget.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');

    console.log(`Starting URL discovery for: ${cleanTarget}`);

    // Fetch from all sources in parallel
    const [waybackResults, alienVaultResults, urlScanResults, commonCrawlResults] = await Promise.all([
      fetchFromWayback(cleanTarget),
      fetchFromAlienVaultUrls(cleanTarget),
      fetchFromUrlScan(cleanTarget),
      fetchFromCommonCrawl(cleanTarget),
    ]);

    // Merge and deduplicate
    const allResults = [...waybackResults, ...alienVaultResults, ...urlScanResults, ...commonCrawlResults];
    const uniqueUrls = new Map<string, UrlResult>();

    for (const result of allResults) {
      const normalizedUrl = result.url.toLowerCase().replace(/\/$/, '');
      if (!uniqueUrls.has(normalizedUrl)) {
        uniqueUrls.set(normalizedUrl, result);
      }
    }

    const urls = Array.from(uniqueUrls.values()).sort((a, b) => 
      a.url.localeCompare(b.url)
    );

    const scanTime = Date.now() - startTime;
    console.log(`URL discovery complete. Found ${urls.length} unique URLs in ${scanTime}ms`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        urls,
        scanTime,
        sources: ['Wayback Machine', 'AlienVault OTX', 'URLScan.io', 'Common Crawl'],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in URL discovery:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to discover URLs',
        urls: [],
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
