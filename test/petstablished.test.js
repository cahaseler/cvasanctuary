import { describe } from 'riteway/esm/riteway.js';
import fetch from 'node-fetch';

// Make fetch available globally for the function
if (!global.fetch) {
  global.fetch = fetch;
}

// Import the handler function
import { handler } from '../netlify/functions/petstablished.js';

describe('petstablished serverless function', async assert => {
  
  assert({
    given: 'an OPTIONS request (CORS preflight)',
    should: 'return 200 with CORS headers',
    actual: await handler({ httpMethod: 'OPTIONS' }).then(r => r.statusCode),
    expected: 200
  });

  assert({
    given: 'an OPTIONS request',
    should: 'include Access-Control-Allow-Origin header',
    actual: await handler({ httpMethod: 'OPTIONS' }).then(r => r.headers['Access-Control-Allow-Origin']),
    expected: '*'
  });
});

describe('petstablished serverless function: shelter endpoint', async assert => {
  
  // Mock fetch for testing
  const originalFetch = global.fetch;
  const mockShelterData = {
    shelter: {
      shelter_id: '2928982',
      organization_name: 'Test Shelter'
    },
    shelter_pets: [
      { id: 1, name: 'Fluffy' },
      { id: 2, name: 'Spot' }
    ]
  };
  
  // Test with mocked successful response
  global.fetch = async (url) => ({
    ok: true,
    status: 200,
    json: async () => mockShelterData
  });
  
  const response = await handler({
    httpMethod: 'GET',
    queryStringParameters: { endpoint: 'shelter' }
  });
  
  assert({
    given: 'a request for shelter data',
    should: 'return 200 status',
    actual: response.statusCode,
    expected: 200
  });

  assert({
    given: 'a successful shelter request',
    should: 'return JSON content type',
    actual: response.headers['Content-Type'],
    expected: 'application/json'
  });

  assert({
    given: 'a successful shelter request',
    should: 'return shelter data',
    actual: JSON.parse(response.body).shelter.organization_name,
    expected: 'Test Shelter'
  });

  assert({
    given: 'a successful shelter request',
    should: 'include pet data',
    actual: JSON.parse(response.body).shelter_pets.length,
    expected: 2
  });
  
  // Restore original fetch
  global.fetch = originalFetch;
});

describe('petstablished serverless function: pet endpoint', async assert => {
  
  const mockPetData = {
    pet: {
      id: 12345,
      name: 'Whiskers',
      age: 'Adult',
      sex: 'Female'
    }
  };
  
  // Mock successful pet fetch
  global.fetch = async (url) => ({
    ok: true,
    status: 200,
    json: async () => mockPetData
  });
  
  assert({
    given: 'a pet request without an ID',
    should: 'return an error',
    actual: await handler({
      httpMethod: 'GET',
      queryStringParameters: { endpoint: 'pet' }
    }).then(r => r.statusCode),
    expected: 500
  });

  const petResponse = await handler({
    httpMethod: 'GET',
    queryStringParameters: { 
      endpoint: 'pet',
      id: '12345'
    }
  });

  assert({
    given: 'a request for pet data with valid ID',
    should: 'return 200 status',
    actual: petResponse.statusCode,
    expected: 200
  });

  assert({
    given: 'a successful pet request',
    should: 'return the pet data',
    actual: JSON.parse(petResponse.body).pet.name,
    expected: 'Whiskers'
  });
});

describe('petstablished serverless function: error handling', async assert => {
  
  // Test with network error
  global.fetch = async () => {
    throw new Error('Network error');
  };
  
  const errorResponse = await handler({
    httpMethod: 'GET',
    queryStringParameters: { endpoint: 'shelter' }
  });
  
  assert({
    given: 'a network error',
    should: 'return 500 status',
    actual: errorResponse.statusCode,
    expected: 500
  });

  assert({
    given: 'a network error',
    should: 'return error message',
    actual: JSON.parse(errorResponse.body).error,
    expected: 'Failed to fetch data'
  });

  // Test invalid endpoint
  const invalidResponse = await handler({
    httpMethod: 'GET',
    queryStringParameters: { endpoint: 'invalid' }
  });

  assert({
    given: 'an invalid endpoint',
    should: 'return 500 status',
    actual: invalidResponse.statusCode,
    expected: 500
  });
  
  // Test API error response
  global.fetch = async () => ({
    ok: false,
    status: 404
  });
  
  const notFoundResponse = await handler({
    httpMethod: 'GET',
    queryStringParameters: { 
      endpoint: 'pet',
      id: '99999'
    }
  });
  
  assert({
    given: 'a 404 from the API',
    should: 'return 500 status',
    actual: notFoundResponse.statusCode,
    expected: 500
  });
});