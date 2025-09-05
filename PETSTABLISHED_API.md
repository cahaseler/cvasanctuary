# Petstablished API Documentation

## Overview
Petstablished provides an undocumented public API that returns JSON data for shelter and pet information. The API is read-only and does not require authentication, but lacks CORS headers which prevents direct browser access.

**Base URL**: `https://petstablished.com/api/v2/public/`

**Widget/Iframe URL**: The current iframe implementation uses:
- Initial URL: `https://awo.petstablished.com/organization/{shelter_id}/widget/animals/adopt`
- Redirects to: `https://www.wagtopia.com/search/org?id={shelter_id}&iframe=normal`
- Note: Wagtopia owns Petstablished; both domains serve the same shelter management system

## Important Notes
- **CORS Limitation**: The API does not set CORS headers, requiring server-side proxy for browser applications
- **Undocumented**: This API is not officially documented and could change without notice
- **Read-Only**: All endpoints are GET requests for data retrieval only
- **No Rate Limits**: No documented rate limits, but implement caching to be respectful

## Endpoints

### 1. Get Shelter Information with Pets
Retrieves shelter details and all available pets.

**Endpoint**: `/search/shelter_show/{shelter_id}`

**Method**: `GET`

**Parameters**:
- `shelter_id` (required): The shelter's unique identifier
- `page` (optional): Page number for pagination (default: 1)
- `sort` (optional): Sort order - appears to not affect results currently
  - Options tested: `default`, `name`, `newest`, `oldest`, `random`

**Example Request**:
```
GET https://petstablished.com/api/v2/public/search/shelter_show/2928982?page=1&sort=default
```

**Response Structure**:
```json
{
  "shelter": {
    "shelter_id": "2928982",
    "organization_name": "Colville Valley Animal Sanctuary",
    "address": "501 Old Arden Hwy",
    "city": "Colville",
    "state": "wa",
    "postalcode": "99114",
    "country": "us",
    "phone": "509-684-1475",
    "email": "office@cvasanctuary.org",
    "website_url": "https://www.cvasanctuary.org/",
    "logo": {
      "url": "https://s3.us-east-1.amazonaws.com/..."
    },
    "desc": "CVAS' mission is...",
    "areas_served": "Our area of service...",
    "adoption_process": "Once your application...",
    "email_for_cat_inquiries": "animals@cvasanctuary.org",
    "email_for_dog_inquiries": "animals@cvasanctuary.org",
    "volunteer_contact_email": "volunteer@cvasanctuary.org",
    "donation_url": "https://petstablished.com/online_donations/organization/2928982",
    "adoption_form_id": 48770,
    "foster_form_id": 58084,
    "settings_donation_visible": true,
    "show_weight": true,
    "show_date_of_birth": true,
    // ... additional shelter settings
  },
  "shelter_pets": [
    {
      "id": 2392965,
      "pet_id": 2392965,
      "name": "Feral - DF",
      "primary_breed": "Domestic Short Hair",
      "secondary_breed": "",
      "mixed_breed": "",
      "description": "<p>Barn Home - FFF</p>...",
      "sex": "Female",
      "age": "Adult",
      "size": "Medium",
      "weight": "6#",
      "status": "Available",
      "date_of_birth": null,
      "adopt_button_state": "visible",
      "foster_button_state": "invisible",
      "adoption_form_id": 48770,
      "foster_form_id": 58084,
      "adopt_url": "https://petstablished.com/public/search/redirect?application_type=adoption&pet_id=2392965&premium=true",
      "foster_url": null,
      "public_url": "/public/search/pet/2392965",
      "thumb_url": "https://s3.us-east-1.amazonaws.com/...",
      "images": [
        {
          "thumb_url": "https://s3.us-east-1.amazonaws.com/..."
        }
      ],
      "city": "Colville",
      "state": "wa",
      "premium": true,
      "no_longer_available": false,
      "is_bonded": null,
      "liked": null
    }
    // ... more pets
  ],
  "shelter_pets_total_page": 1,
  "shelter_filters": {
    "animals": [
      "Cat",
      "Dog",
      "Bird",
      "Farm Animal",
      "Horse",
      "Rabbit",
      "Reptile, Amphibian, Fish",
      "Small Animal"
    ],
    "breeds": {
      "cat": ["Domestic Long Hair", "Domestic Short Hair", ...],
      "dog": ["Labrador Retriever", "German Shepherd", ...],
      // ... breeds for each animal type
    },
    "ages": ["Baby", "Young", "Adult", "Senior"],
    "sizes": ["Small", "Medium", "Large", "Extra Large"],
    "sexes": ["Male", "Female"]
  }
}
```

### 2. Get Individual Pet Details
Retrieves detailed information about a specific pet.

**Endpoint**: `/search/pet/{pet_id}`

**Method**: `GET`

**Parameters**:
- `pet_id` (required): The pet's unique identifier

**Example Request**:
```
GET https://petstablished.com/api/v2/public/search/pet/2392965
```

**Response Structure**:
```json
{
  "pet": {
    "id": 2392965,
    "name": "Feral - DF",
    "sex": "Female",
    "age": "Adult",
    "size": "Medium",
    "animal": "Cat",
    "description": "<p>Barn Home - FFF</p>...",
    "status": "Available",
    "breeds": ["Domestic Short Hair", "", "", ...],
    "shelter_id": 2928982,
    "user_id": 2928982,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "options": [],
    // ... additional pet fields
  },
  "shelter": {
    // Same shelter object as in shelter_show endpoint
  },
  "shelter_pets": [
    // Array of other pets from the same shelter
  ],
  "shelter_pets_total_page": 1
}
```

### 3. General Pet Search
Searches for pets across all shelters (not specific to one shelter).

**Endpoint**: `/search`

**Method**: `GET`

**Parameters**: Unknown/undocumented

**Example Request**:
```
GET https://petstablished.com/api/v2/public/search
```

**Response Structure**:
```json
{
  "pets": [
    {
      "pet_id": 271883,
      "pet_name": "Sirius",
      "age": "Adult",
      "primary_breed": "Domestic Shorthair",
      "secondary_breed": "",
      "sex": "Female",
      "size": "small",
      "status": "fostered",
      "shelter_name": "Tenth Life Cat Rescue",
      "shelter_email": "info@tenthlifecats.org",
      "public_url": "https://petstablished.com/public/search/pet/271883",
      // ... additional fields
    }
    // ... more pets from various shelters
  ]
}
```

## Data Types and Values

### Pet Ages
- `Baby`
- `Young`
- `Adult`
- `Senior`

### Pet Sizes
- `Small`
- `Medium`
- `Large`
- `Extra Large`

### Pet Sex
- `Male`
- `Female`

### Pet Status
- `Available`
- `Fostered`
- `Adopted`
- `Hold`

### Animal Types
- `Cat`
- `Dog`
- `Bird`
- `Farm Animal`
- `Horse`
- `Rabbit`
- `Reptile, Amphibian, Fish`
- `Small Animal`

## Implementation Considerations

### CORS Workaround
Since the API lacks CORS headers, you must implement a server-side proxy:

```javascript
// Example Netlify Function (netlify/functions/petstablished-proxy.js)
exports.handler = async (event) => {
  const { path, ...params } = event.queryStringParameters;
  const apiUrl = `https://petstablished.com/api/v2/public/${path}`;
  
  const queryString = new URLSearchParams(params).toString();
  const fullUrl = queryString ? `${apiUrl}?${queryString}` : apiUrl;
  
  try {
    const response = await fetch(fullUrl);
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data' })
    };
  }
};
```

### Caching Strategy
Implement caching to reduce API calls and improve performance:

1. **Build-time caching**: Fetch and cache data during static site generation
2. **Runtime caching**: Cache API responses in browser with reasonable TTL
3. **Fallback data**: Store last known good data for when API is unavailable

### Error Handling
Always implement fallback behavior:
- Display cached data when API is unavailable
- Show user-friendly error messages
- Log errors for monitoring
- Consider implementing retry logic with exponential backoff

### Image Handling
Pet images are hosted on AWS S3:
- URLs are direct S3 links
- Implement lazy loading for performance
- Consider image optimization/resizing
- Handle missing images gracefully

## Limitations and Risks

1. **Unofficial API**: No guarantee of stability or continued availability
2. **No Documentation**: Behavior may change without notice
3. **No SLA**: No uptime guarantees or support
4. **CORS Restrictions**: Requires proxy implementation
5. **Limited Filtering**: Filter parameters don't seem to work on shelter_show endpoint
6. **No Write Access**: Cannot update pet data via API

## Testing Notes

Based on testing with shelter ID 2928982 (Colville Valley Animal Sanctuary):
- The shelter currently has 13 pets listed
- All pets appear to be cats (Domestic Short Hair or Domestic Long Hair)
- Sort parameters don't appear to affect the order
- Filter parameters on the shelter_show endpoint don't seem to work
- Individual pet endpoints return additional shelter pets in the response
- The API returns HTML in description fields that needs sanitization for display