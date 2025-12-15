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

  try {
    // Fetch first page to get total page count
    const baseUrl = 'https://petstablished.com/api/v2/public/search/shelter_show/2928982';
    const firstResponse = await fetch(baseUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CVAS Website Proxy',
      },
    });

    if (!firstResponse.ok) {
      throw new Error(`API responded with status ${firstResponse.status}`);
    }

    const firstData = await firstResponse.json();
    const totalPages = firstData.shelter_pets_total_page || 1;

    // Collect all pets from all pages
    let allPets = [...(firstData.shelter_pets || [])];

    // Fetch remaining pages if there are more
    if (totalPages > 1) {
      const pagePromises = [];
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(
          fetch(`${baseUrl}?page=${page}`, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'CVAS Website Proxy',
            },
          }).then(res => res.json())
        );
      }

      const pageResults = await Promise.all(pagePromises);
      for (const pageData of pageResults) {
        if (pageData.shelter_pets) {
          allPets = allPets.concat(pageData.shelter_pets);
        }
      }
    }

    // Return combined data with all pets
    const data = {
      ...firstData,
      shelter_pets: allPets,
      shelter_pets_total_page: 1,  // All pets now in single response
    };

    // Return with CORS headers and cache for 5 minutes
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching from PetStablished:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch pet data',
        message: error.message 
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}