const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LiveCheckResult {
  subdomain: string;
  isLive: boolean;
  statusCode?: number;
  checkedAt: string;
}

async function checkHost(subdomain: string): Promise<LiveCheckResult> {
  const protocols = ['https://', 'http://'];
  
  for (const protocol of protocols) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${protocol}${subdomain}`, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeout);

      return {
        subdomain,
        isLive: true,
        statusCode: response.status,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      // Continue to next protocol or mark as dead
    }
  }

  return {
    subdomain,
    isLive: false,
    checkedAt: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subdomains } = await req.json();

    if (!subdomains || !Array.isArray(subdomains) || subdomains.length === 0) {
      return new Response(
        JSON.stringify({ results: [], error: 'Subdomains array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit to 50 subdomains per request to avoid timeout
    const limitedSubdomains = subdomains.slice(0, 50);
    console.log(`Checking ${limitedSubdomains.length} hosts for liveness`);

    // Check in batches of 10 for better performance
    const batchSize = 10;
    const results: LiveCheckResult[] = [];

    for (let i = 0; i < limitedSubdomains.length; i += batchSize) {
      const batch = limitedSubdomains.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(checkHost));
      results.push(...batchResults);
    }

    const liveCount = results.filter(r => r.isLive).length;
    console.log(`Live check complete. ${liveCount}/${results.length} hosts are live`);

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking live hosts:', error);
    return new Response(
      JSON.stringify({ 
        results: [], 
        error: error instanceof Error ? error.message : 'Failed to check hosts' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
