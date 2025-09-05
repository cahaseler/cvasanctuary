import EleventyFetch from "@11ty/eleventy-fetch";

export default async function() {
  // Fetch shelter data at build time for initial load
  // Runtime updates will happen via client-side fetch
  try {
    const url = "https://petstablished.com/api/v2/public/search/shelter_show/2928982?sort=default&page=1";
    
    const data = await EleventyFetch(url, {
      duration: "1h", // Cache for 1 hour during development
      type: "json"
    });
    
    return {
      info: data.shelter || {},
      pets: data.shelter_pets || [],
      filters: data.shelter_filters || {},
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching shelter data:", error);
    // Return empty data structure if fetch fails
    return {
      info: {},
      pets: [],
      filters: {},
      lastUpdated: new Date().toISOString(),
      error: true
    };
  }
};