export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const apiKey = process.env.SHELTERLUV_API_KEY;
  if (!apiKey) {
    console.error('SHELTERLUV_API_KEY environment variable is not set');
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    const baseUrl = 'https://new.shelterluv.com/api/v1/animals';
    const limit = 100;
    const maxIterations = 20;
    let allAnimals = [];
    let offset = 0;
    let totalCount = 0;

    for (let i = 0; i < maxIterations; i++) {
      const url = baseUrl + '?status_type=publishable&offset=' + offset + '&limit=' + limit;
      const response = await fetch(url, {
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Shelterluv API responded with status ' + response.status);
      }

      const data = await response.json();
      const animals = data.animals || [];
      allAnimals = allAnimals.concat(animals);
      totalCount = data.total_count || allAnimals.length;

      if (!data.has_more) break;
      offset += limit;
    }

    if (offset >= maxIterations * limit) {
      console.warn('Shelterluv pagination cap reached at ' + allAnimals.length + ' animals');
    }

    return new Response(
      JSON.stringify({
        animals: allAnimals,
        total_count: totalCount,
        fetched_at: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching from Shelterluv:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch pet data',
        message: error.message,
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
