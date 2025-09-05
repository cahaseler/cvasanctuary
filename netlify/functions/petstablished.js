const SHELTER_ID = '2928982';
const API_BASE = 'https://petstablished.com/api/v2/public';

export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const params = event.queryStringParameters || {};
  const endpoint = params.endpoint || 'shelter';
  
  try {
    let data;
    
    switch(endpoint) {
      case 'shelter':
        data = await getShelterData(params);
        break;
      
      case 'pet':
        if (!params.id) {
          throw new Error('Pet ID required');
        }
        data = await getPetData(params.id);
        break;
      
      default:
        throw new Error('Invalid endpoint');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
    
  } catch (error) {
    console.error('API Proxy Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch data',
        message: error.message
      })
    };
  }
};

async function getShelterData(params) {
  const page = params.page || '1';
  const sort = params.sort || 'default';
  
  const url = `${API_BASE}/search/shelter_show/${SHELTER_ID}?page=${page}&sort=${sort}`;
  console.log('Fetching:', url);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }
  
  return await response.json();
}

async function getPetData(petId) {
  const url = `${API_BASE}/search/pet/${petId}`;
  console.log('Fetching:', url);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }
  
  return await response.json();
}