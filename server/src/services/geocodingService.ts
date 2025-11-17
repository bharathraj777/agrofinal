import axios from 'axios';
import { AppError } from '../middleware';

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  components: {
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    district?: string;
    county?: string;
  };
  confidence: number;
}

export interface ReverseGeocodeResult {
  address: string;
  components: {
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    district?: string;
    county?: string;
    road?: string;
    house_number?: string;
  };
  formattedAddress: string;
}

interface OpenCageResponse {
  documentation: string;
  licenses: Array<{
    name: string;
    url: string;
  }>;
  rate: {
    limit: number;
    remaining: number;
    reset: number;
  };
  results: Array<{
    annotations: {
      DMS: {
        lat: string;
        lng: string;
      };
      callingcode: number;
      currency: {
        alternate_symbols: string[];
        decimal_mark: string;
        html_entity: string;
        iso_code: string;
        iso_numeric: string;
        name: string;
        smallest_denomination: number;
        subunit: string;
        subunit_to_unit: number;
        symbol: string;
        symbol_on_left: boolean;
        thousands_separator: string;
      };
      flag: string;
      geohash: string;
      what3words: {
        words: string;
      };
      Mercator: {
        x: number;
        y: number;
      };
      sun: {
        rise: {
          apparent: number;
          astronomical: number;
          civil: number;
          nautical: number;
        };
        set: {
          apparent: number;
          astronomical: number;
          civil: number;
          nautical: number;
        };
      };
      timezone: {
        name: string;
        now_in_dst: number;
        offset_sec: number;
        offset_string: string;
        short_name: string;
      };
    };
    bounds: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
    components: {
      _normalized_city?: string;
      continent?: string;
      country?: string;
      country_code?: string;
      county?: string;
      house_number?: string;
      postcode?: string;
      road?: string;
      state?: string;
      state_code?: string;
      state_district?: string;
      suburb?: string;
      town?: string;
      village?: string;
    };
    confidence: number;
    formatted: string;
    geometry: {
      lat: number;
      lng: number;
    };
  };
  status: {
    code: number;
    message: string;
  };
  stay_informed: {
    blog: string;
    twitter: string;
  };
  thanks: string;
  timestamp: {
    created_http: string;
    created_unix: number;
  };
  total_results: number;
}

interface NominatimResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address: {
    [key: string]: string;
  };
}

class GeocodingService {
  private readonly openCageApiKey: string;
  private readonly openCageUrl: string = 'https://api.opencagedata.com/geocode/v1/json';
  private readonly nominatimUrl: string = 'https://nominatim.openstreetmap.org/search';
  private readonly nominatimReverseUrl: string = 'https://nominatim.openstreetmap.org/reverse';

  constructor() {
    this.openCageApiKey = process.env.OPENCAGE_API_KEY || '';
  }

  async geocode(address: string): Promise<GeocodeResult[]> {
    try {
      const results: GeocodeResult[] = [];

      // Try OpenCage first (more accurate for Indian locations)
      if (this.openCageApiKey) {
        const openCageResults = await this.geocodeOpenCage(address);
        results.push(...openCageResults);
      }

      // Fallback to Nominatim (always free, no API key required)
      if (results.length === 0) {
        const nominatimResults = await this.geocodeNominatim(address);
        results.push(...nominatimResults);
      }

      // If still no results, try a more flexible search
      if (results.length === 0) {
        const flexibleResults = await this.geocodeFlexible(address);
        results.push(...flexibleResults);
      }

      return results.slice(0, 10); // Return max 10 results
    } catch (error: any) {
      console.error('Geocoding error:', error.message);
      throw new AppError('Failed to geocode address', 500);
    }
  }

  private async geocodeOpenCage(address: string): Promise<GeocodeResult[]> {
    try {
      const response = await axios.get<OpenCageResponse>(this.openCageUrl, {
        params: {
          q: address,
          key: this.openCageApiKey,
          limit: 5,
          countrycode: 'in', // Prioritize Indian results
          pretty: 0
        },
        timeout: 5000,
        headers: {
          'User-Agent': 'AgriSupport/1.0'
        }
      });

      return response.data.results.map(result => ({
        lat: result.geometry.lat,
        lng: result.geometry.lng,
        formattedAddress: result.formatted,
        components: {
          city: result.components.town || result.components.city || result.components.village,
          state: result.components.state,
          country: result.components.country,
          postalCode: result.components.postcode,
          district: result.components.county || result.components.state_district
        },
        confidence: result.confidence
      }));
    } catch (error: any) {
      console.error('OpenCage geocoding failed:', error.message);
      return [];
    }
  }

  private async geocodeNominatim(address: string): Promise<GeocodeResult[]> {
    try {
      const response = await axios.get<NominatimResponse[]>(this.nominatimUrl, {
        params: {
          q: address,
          format: 'json',
          addressdetails: 1,
          limit: 5,
          countrycodes: 'in',
          featuretype: 'settlement'
        },
        timeout: 5000,
        headers: {
          'User-Agent': 'AgriSupport/1.0'
        }
      });

      return response.data.map(result => ({
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        formattedAddress: result.display_name,
        components: {
          city: result.address.city || result.address.town || result.address.village,
          state: result.address.state,
          country: result.address.country,
          postalCode: result.address.postcode,
          district: result.address.county
        },
        confidence: result.importance * 10 // Convert importance to confidence
      }));
    } catch (error: any) {
      console.error('Nominatim geocoding failed:', error.message);
      return [];
    }
  }

  private async geocodeFlexible(address: string): Promise<GeocodeResult[]> {
    // Try different variations of the address
    const variations = [
      address,
      address + ', India',
      address.replace(/district/gi, ''),
      address.replace(/tehsil/gi, ''),
      address + ', Tamil Nadu, India',
      address + ', Maharashtra, India',
      address + ', Uttar Pradesh, India'
    ];

    const results: GeocodeResult[] = [];

    for (const variation of variations) {
      if (results.length >= 3) break; // Stop if we have some results

      try {
        const nominatimResults = await this.geocodeNominatim(variation);
        results.push(...nominatimResults);
      } catch (error) {
        // Continue to next variation
      }
    }

    return results;
  }

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    try {
      // Try Nominatim first (no API key needed)
      const nominatimResult = await this.reverseGeocodeNominatim(lat, lng);
      if (nominatimResult) {
        return nominatimResult;
      }

      // Fallback to OpenCage
      if (this.openCageApiKey) {
        const openCageResult = await this.reverseGeocodeOpenCage(lat, lng);
        if (openCageResult) {
          return openCageResult;
        }
      }

      return null;
    } catch (error: any) {
      console.error('Reverse geocoding error:', error.message);
      return null;
    }
  }

  private async reverseGeocodeNominatim(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    try {
      const response = await axios.get<NominatimResponse>(this.nominatimReverseUrl, {
        params: {
          lat,
          lon: lng,
          format: 'json',
          addressdetails: 1,
          zoom: 10
        },
        timeout: 5000,
        headers: {
          'User-Agent': 'AgriSupport/1.0'
        }
      });

      if (response.data) {
        return {
          address: response.data.display_name,
          components: {
            city: response.data.address.city || response.data.address.town || response.data.address.village,
            state: response.data.address.state,
            country: response.data.address.country,
            postalCode: response.data.address.postcode,
            district: response.data.address.county,
            road: response.data.address.road,
            house_number: response.data.address.house_number
          },
          formattedAddress: response.data.display_name
        };
      }

      return null;
    } catch (error: any) {
      console.error('Nominatim reverse geocoding failed:', error.message);
      return null;
    }
  }

  private async reverseGeocodeOpenCage(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    try {
      const response = await axios.get<OpenCageResponse>(this.openCageUrl, {
        params: {
          q: `${lat},${lng}`,
          key: this.openCageApiKey,
          limit: 1
        },
        timeout: 5000,
        headers: {
          'User-Agent': 'AgriSupport/1.0'
        }
      });

      if (response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          address: result.formatted,
          components: {
            city: result.components.town || result.components.city || result.components.village,
            state: result.components.state,
            country: result.components.country,
            postalCode: result.components.postcode,
            district: result.components.county || result.components.state_district,
            road: result.components.road,
            house_number: result.components.house_number
          },
          formattedAddress: result.formatted
        };
      }

      return null;
    } catch (error: any) {
      console.error('OpenCage reverse geocoding failed:', error.message);
      return null;
    }
  }

  async searchIndianLocations(query: string): Promise<GeocodeResult[]> {
    const indianStateTerms = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
      'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
      'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
      'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ];

    const results: GeocodeResult[] = [];

    // Try with state names appended
    for (const state of indianStateTerms.slice(0, 5)) { // Limit to avoid too many API calls
      const searchQuery = `${query}, ${state}`;
      try {
        const searchResults = await this.geocode(searchQuery);
        results.push(...searchResults);
        if (results.length >= 10) break;
      } catch (error) {
        // Continue with next state
      }
    }

    return results.slice(0, 10);
  }

  async getDistrictCenter(districtName: string, stateName?: string): Promise<GeocodeResult | null> {
    const query = stateName ? `${districtName} district, ${stateName}` : `${districtName} district`;

    try {
      const results = await this.geocode(query);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      return null;
    }
  }

  async validateLocation(lat: number, lng: number): Promise<{
    isValid: boolean;
    country?: string;
    isIndia: boolean;
    nearestCity?: string;
  }> {
    try {
      const result = await this.reverseGeocode(lat, lng);

      if (!result) {
        return { isValid: false, isIndia: false };
      }

      const isIndia = result.components.country === 'India' ||
                     result.components.country === 'IN' ||
                     result.address.toLowerCase().includes('india');

      return {
        isValid: true,
        country: result.components.country,
        isIndia,
        nearestCity: result.components.city
      };
    } catch (error) {
      return { isValid: false, isIndia: false };
    }
  }

  // Get coordinates for major agricultural regions in India
  async getAgriculturalRegions(): Promise<{ name: string; lat: number; lng: number; crops: string[] }[]> {
    // Predefined major agricultural regions with their coordinates
    return [
      {
        name: 'Punjab - Wheat Belt',
        lat: 30.9010,
        lng: 75.8573,
        crops: ['Wheat', 'Rice', 'Cotton', 'Maize']
      },
      {
        name: 'Uttar Pradesh - Gangetic Plain',
        lat: 26.8467,
        lng: 80.9462,
        crops: ['Rice', 'Wheat', 'Sugarcane', 'Pulses']
      },
      {
        name: 'Maharashtra - Cotton Belt',
        lat: 19.0760,
        lng: 72.8777,
        crops: ['Cotton', 'Soybean', 'Sugarcane', 'Jowar']
      },
      {
        name: 'Tamil Nadu - Rice Bowl',
        lat: 11.1271,
        lng: 78.6569,
        crops: ['Rice', 'Sugarcane', 'Cotton', 'Banana']
      },
      {
        name: 'West Bengal - Rice Belt',
        lat: 22.9868,
        lng: 87.8550,
        crops: ['Rice', 'Jute', 'Tea', 'Potato']
      },
      {
        name: 'Gujarat - Groundnut Belt',
        lat: 22.2587,
        lng: 71.1924,
        crops: ['Groundnut', 'Cotton', 'Sugarcane', 'Cumin']
      },
      {
        name: 'Karnataka - Millet Zone',
        lat: 15.3173,
        lng: 75.7139,
        crops: ['Ragi', 'Jowar', 'Maize', 'Cotton']
      },
      {
        name: 'Andhra Pradesh - Rice Zone',
        lat: 15.9129,
        lng: 79.7400,
        crops: ['Rice', 'Cotton', 'Chili', 'Tobacco']
      },
      {
        name: 'Madhya Pradesh - Soybean Zone',
        lat: 22.9734,
        lng: 78.6569,
        crops: ['Soybean', 'Wheat', 'Gram', 'Mustard']
      },
      {
        name: 'Rajasthan - Millet Zone',
        lat: 26.2389,
        lng: 73.0243,
        crops: ['Bajra', 'Jowar', 'Wheat', 'Mustard']
      }
    ];
  }

  async searchNearbyLocations(lat: number, lng: number, radiusKm: number = 50): Promise<GeocodeResult[]> {
    // For nearby search, we'll use a simple approach with predefined locations
    const regions = await this.getAgriculturalRegions();

    const nearby = regions.filter(region => {
      const distance = this.calculateDistance(lat, lng, region.lat, region.lng);
      return distance <= radiusKm;
    }).map(region => ({
      lat: region.lat,
      lng: region.lng,
      formattedAddress: region.name,
      components: {
        city: region.name.split(' - ')[0],
        state: region.name.split(' - ')[1]?.split(' ')[0],
        country: 'India'
      },
      confidence: 1.0
    }));

    return nearby;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export default new GeocodingService();