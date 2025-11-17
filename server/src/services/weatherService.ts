import axios from 'axios';
import { AppError } from '../middleware';

export interface WeatherData {
  location: {
    lat: number;
    lng: number;
    city?: string;
    state?: string;
    country?: string;
  };
  current: {
    temperature: number; // Celsius
    humidity: number; // Percentage
    pressure: number; // hPa
    windSpeed: number; // km/h
    windDirection: number; // degrees
    visibility: number; // km
    uvIndex?: number;
    condition: string;
    description: string;
    icon: string;
  };
  rainfall: {
    current?: number; // mm
    last24h?: number; // mm
    last1h?: number; // mm
    probability: number; // percentage
  };
  seasonal: {
    season: 'kharif' | 'rabi' | 'zaid' | 'summer' | 'winter';
    monsoonActive: boolean;
    temperatureRange: {
      min: number;
      max: number;
    };
    rainfallExpected: 'low' | 'medium' | 'high';
  };
  agricultural: {
    soilTemperature?: number;
    soilMoisture?: number;
    evapotranspiration?: number;
    growingDegreeDays?: number;
    frostRisk: 'none' | 'low' | 'medium' | 'high';
    heatStressRisk: 'none' | 'low' | 'medium' | 'high';
  };
}

interface OpenWeatherResponse {
  coord: { lat: number; lon: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  snow?: {
    '1h'?: number;
    '3h'?: number;
  };
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

interface OpenWeatherForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
      gust?: number;
    };
    visibility: number;
    pop: number; // Probability of precipitation
    rain?: {
      '3h': number;
    };
    snow?: {
      '3h': number;
    };
    sys: {
      pod: string;
    };
    dt_txt: string;
  }>;
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.openweathermap.org/data/2.5';
  private readonly oneCallUrl: string = 'https://api.openweathermap.org/data/3.0';

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenWeatherMap API key not provided. Weather functionality will be limited.');
    }
  }

  async getCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
    try {
      if (!this.apiKey) {
        return this.getFallbackWeatherData(lat, lng);
      }

      // Current weather API call (free tier)
      const currentWeatherUrl = `${this.baseUrl}/weather`;
      const currentResponse = await axios.get<OpenWeatherResponse>(currentWeatherUrl, {
        params: {
          lat,
          lon: lng,
          appid: this.apiKey,
          units: 'metric'
        },
        timeout: 5000
      });

      // 5-day forecast API call (free tier)
      const forecastUrl = `${this.baseUrl}/forecast`;
      const forecastResponse = await axios.get<OpenWeatherForecastResponse>(forecastUrl, {
        params: {
          lat,
          lon: lng,
          appid: this.apiKey,
          units: 'metric'
        },
        timeout: 5000
      });

      return this.processWeatherData(currentResponse.data, forecastResponse.data);
    } catch (error: any) {
      console.error('Weather API error:', error.message);

      // Fall back to cached or simulated data if API fails
      return this.getFallbackWeatherData(lat, lng);
    }
  }

  private processWeatherData(current: OpenWeatherResponse, forecast: OpenWeatherForecastResponse): WeatherData {
    const { lat, lon } = current.coord;
    const temp = current.main.temp;
    const humidity = current.main.humidity;
    const month = new Date().getMonth();

    // Calculate rainfall data
    const rainfall = {
      current: current.rain?.['1h'],
      last1h: current.rain?.['1h'],
      last24h: this.calculate24hRainfall(forecast),
      probability: Math.round((forecast.list[0]?.pop || 0) * 100)
    };

    // Determine season based on month and location
    const seasonal = this.determineSeason(month, lat, current.sys.country);

    // Agricultural insights
    const agricultural = this.getAgriculturalInsights(temp, humidity, seasonal, rainfall);

    return {
      location: {
        lat,
        lng,
        city: current.name,
        country: current.sys.country
      },
      current: {
        temperature: Math.round(temp * 10) / 10,
        humidity,
        pressure: current.main.pressure,
        windSpeed: Math.round((current.wind.speed * 3.6) * 10) / 10, // Convert m/s to km/h
        windDirection: current.wind.deg,
        visibility: current.visibility / 1000, // Convert to km
        condition: current.weather[0].main,
        description: current.weather[0].description,
        icon: current.weather[0].icon
      },
      rainfall,
      seasonal,
      agricultural
    };
  }

  private calculate24hRainfall(forecast: OpenWeatherForecastResponse): number {
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);

    let totalRainfall = 0;
    for (const item of forecast.list) {
      if (item.dt * 1000 >= twentyFourHoursAgo && item.dt * 1000 <= now) {
        totalRainfall += item.rain?.['3h'] || 0;
      }
    }

    return Math.round(totalRainfall * 100) / 100;
  }

  private determineSeason(month: number, lat: number, country: string): WeatherData['seasonal'] {
    let season: 'kharif' | 'rabi' | 'zaid' | 'summer' | 'winter';
    let monsoonActive = false;
    let temperatureRange: { min: number; max: number };
    let rainfallExpected: 'low' | 'medium' | 'high';

    // Indian subcontinent seasons (approximate)
    if (country === 'IN') {
      if (month >= 6 && month <= 9) {
        season = 'kharif';
        monsoonActive = true;
        rainfallExpected = 'high';
        temperatureRange = { min: 25, max: 35 };
      } else if (month >= 10 && month <= 2) {
        season = 'rabi';
        monsoonActive = false;
        rainfallExpected = 'low';
        temperatureRange = { min: 15, max: 25 };
      } else {
        season = 'zaid';
        monsoonActive = false;
        rainfallExpected = 'low';
        temperatureRange = { min: 20, max: 35 };
      }
    } else {
      // General seasonal determination for other regions
      if (lat > 0) { // Northern hemisphere
        if (month >= 3 && month <= 5) {
          season = 'summer';
          temperatureRange = { min: 20, max: 35 };
        } else if (month >= 6 && month <= 8) {
          season = 'summer';
          temperatureRange = { min: 25, max: 40 };
          rainfallExpected = 'high';
        } else if (month >= 9 && month <= 11) {
          season = 'winter';
          temperatureRange = { min: 15, max: 25 };
          rainfallExpected = 'medium';
        } else {
          season = 'winter';
          temperatureRange = { min: 5, max: 20 };
          rainfallExpected = 'low';
        }
      } else { // Southern hemisphere
        if (month >= 9 && month <= 11) {
          season = 'summer';
          temperatureRange = { min: 20, max: 35 };
        } else if (month >= 12 && month <= 2) {
          season = 'summer';
          temperatureRange = { min: 25, max: 40 };
          rainfallExpected = 'high';
        } else if (month >= 3 && month <= 5) {
          season = 'winter';
          temperatureRange = { min: 15, max: 25 };
          rainfallExpected = 'medium';
        } else {
          season = 'winter';
          temperatureRange = { min: 5, max: 20 };
          rainfallExpected = 'low';
        }
      }
    }

    return {
      season,
      monsoonActive,
      temperatureRange,
      rainfallExpected: rainfallExpected || 'medium'
    };
  }

  private getAgriculturalInsights(
    temperature: number,
    humidity: number,
    seasonal: WeatherData['seasonal'],
    rainfall: WeatherData['rainfall']
  ): WeatherData['agricultural'] {
    const { season, temperatureRange } = seasonal;

    // Calculate growing degree days (simplified)
    const baseTemp = 10; // Base temperature for most crops
    const gdd = Math.max(0, temperature - baseTemp);

    // Determine risks
    let frostRisk: 'none' | 'low' | 'medium' | 'high' = 'none';
    let heatStressRisk: 'none' | 'low' | 'medium' | 'high' = 'none';

    if (temperature < 5) frostRisk = 'high';
    else if (temperature < 10) frostRisk = 'medium';
    else if (temperature < 15) frostRisk = 'low';

    if (temperature > 35) heatStressRisk = 'high';
    else if (temperature > 30) heatStressRisk = 'medium';
    else if (temperature > 25) heatStressRisk = 'low';

    // Estimate soil temperature (simplified correlation with air temperature)
    const soilTemperature = temperature * 0.9 + 2; // Soil is usually cooler and more stable

    // Estimate evapotranspiration (simplified)
    const evapotranspiration = Math.round((temperature * humidity * 0.01) * 100) / 100;

    return {
      soilTemperature: Math.round(soilTemperature * 10) / 10,
      soilMoisture: humidity > 70 ? 'High' as any : humidity > 40 ? 'Medium' as any : 'Low' as any,
      evapotranspiration,
      growingDegreeDays: Math.round(gdd * 100) / 100,
      frostRisk,
      heatStressRisk
    };
  }

  private getFallbackWeatherData(lat: number, lng: number): WeatherData {
    const month = new Date().getMonth();
    const seasonal = this.determineSeason(month, lat, 'IN'); // Default to India for fallback

    // Use seasonal averages as fallback
    const avgTemp = (seasonal.temperatureRange.min + seasonal.temperatureRange.max) / 2;
    const humidity = 60 + Math.random() * 30; // 60-90% humidity

    return {
      location: { lat, lng },
      current: {
        temperature: Math.round(avgTemp * 10) / 10,
        humidity: Math.round(humidity),
        pressure: 1013,
        windSpeed: 10,
        windDirection: 180,
        visibility: 10,
        condition: 'Clear',
        description: 'Simulated weather data',
        icon: '01d'
      },
      rainfall: {
        probability: seasonal.rainfallExpected === 'high' ? 60 :
                   seasonal.rainfallExpected === 'medium' ? 30 : 10,
        last24h: seasonal.rainfallExpected === 'high' ? 5 :
                seasonal.rainfallExpected === 'medium' ? 2 : 0
      },
      seasonal,
      agricultural: this.getAgriculturalInsights(avgTemp, humidity, seasonal, {
        probability: 30,
        last24h: 2
      })
    };
  }

  async getWeatherAlerts(lat: number, lng: number): Promise<string[]> {
    const alerts: string[] = [];

    try {
      const weather = await this.getCurrentWeather(lat, lng);

      // Check for extreme conditions
      if (weather.current.temperature > 40) {
        alerts.push('🔥 Extreme heat alert! Ensure adequate irrigation and consider shade nets for sensitive crops.');
      }

      if (weather.current.temperature < 5) {
        alerts.push('❄️ Frost warning! Protect sensitive crops with covers or bring them indoors.');
      }

      if (weather.rainfall.probability > 80) {
        alerts.push('🌧️ Heavy rainfall expected! Ensure proper drainage and avoid pesticide application.');
      }

      if (weather.agricultural.heatStressRisk === 'high') {
        alerts.push('🌡️ High heat stress risk. Increase irrigation frequency and consider mulching.');
      }

      if (weather.agricultural.frostRisk === 'high') {
        alerts.push('🥶 High frost risk. Use frost protection measures for sensitive crops.');
      }

      if (weather.current.humidity > 85) {
        alerts.push('💧 High humidity conditions. Monitor for fungal diseases and ensure good air circulation.');
      }

      if (weather.current.windSpeed > 30) {
        alerts.push('💨 Strong winds! Secure loose items and consider windbreaks for young plants.');
      }

    } catch (error) {
      console.error('Error generating weather alerts:', error);
    }

    return alerts;
  }

  // Get optimal planting times based on weather patterns
  async getOptimalPlantingTimes(lat: number, lng: number, cropType: string): Promise<{
    bestSeason: string;
    plantingWindow: { start: string; end: string };
    considerations: string[];
  }> {
    try {
      const weather = await this.getCurrentWeather(lat, lng);
      const { season } = weather.seasonal;

      // Crop-specific recommendations (simplified)
      const cropRecommendations: { [key: string]: any } = {
        rice: {
          bestSeason: 'kharif',
          plantingWindow: { start: 'June', end: 'July' },
          considerations: [
            'Requires high rainfall (1000-2000mm)',
            'Temperature: 20-35°C ideal',
            'High humidity preferred',
            'Standing water requirement during early growth'
          ]
        },
        wheat: {
          bestSeason: 'rabi',
          plantingWindow: { start: 'October', end: 'November' },
          considerations: [
            'Cool season crop',
            'Temperature: 15-25°C ideal',
            'Low rainfall preferred',
            'Requires well-drained soil'
          ]
        },
        maize: {
          bestSeason: 'zaid',
          plantingWindow: { start: 'February', end: 'March' },
          considerations: [
            'Warm season crop',
            'Temperature: 20-30°C ideal',
            'Moderate rainfall required',
            'Good drainage essential'
          ]
        },
        cotton: {
          bestSeason: 'kharif',
          plantingWindow: { start: 'April', end: 'May' },
          considerations: [
            'Long growing season required',
            'High temperature preferred',
            'Moderate rainfall adequate',
            'Frost-sensitive'
          ]
        }
      };

      const defaultRecommendation = {
        bestSeason: season,
        plantingWindow: { start: 'Varies', end: 'Varies' },
        considerations: [
          'Consult local agricultural expert',
          'Consider soil conditions',
          'Check market demand',
          'Follow local farming calendar'
        ]
      };

      return cropRecommendations[cropType.toLowerCase()] || defaultRecommendation;
    } catch (error) {
      console.error('Error getting planting times:', error);
      return {
        bestSeason: 'varies',
        plantingWindow: { start: 'Varies', end: 'Varies' },
        considerations: ['Weather data unavailable. Consult local agricultural office.']
      };
    }
  }
}

export default new WeatherService();