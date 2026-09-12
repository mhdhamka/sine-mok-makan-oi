import { Eatery, WeatherCondition, WeatherData, WeatherImpactSummary } from '../types';

/**
 * Mock Kuching Weather & Craving Engine API
 * Dynamically correlates equatorial tropical weather patterns with local culinary cravings:
 * - 'Rainy': High humidity & chilling downpour triggers Sarawak Laksa Craving Surge (+18% to +25% FOMO, faster broth depletion)
 * - 'Sunny': Blazing 33°C heat triggers Mee Kolok Craving Surge (+18% to +25% FOMO for crispy lard noodles & iced Teh C Peng)
 * - 'Cloudy': Pleasant riverside weather, balanced culinary equilibrium
 */

export const KUCHING_WEATHER_PRESETS: Record<WeatherCondition, WeatherData> = {
  rainy: {
    condition: 'rainy',
    title: 'Torrential Tropical Downpour',
    localNickname: 'Hujan Lebat Tropika (Sejuk Giler)',
    tempC: 24,
    humidityPct: 96,
    windKmH: 19,
    cravingFaction: 'laksa',
    cravingHeadline: 'LAKSA CRAVING SURGE (HUJAN-HUJAN HIRUP KUAH PANAS!)',
    cravingDescription:
      'Chilly monsoon clouds blanket Mount Santubong and Kuching city. Everyone rushes for steaming, aromatic prawn-sambal laksa broth with fresh calamansi to warm their souls.',
    fomoBoostFaction: 'laksa',
    fomoBoostAmount: 22,
    stockDepletionAlert:
      '⚠️ CRITICAL BROTH DEFICIT: Prawn broth depletion velocity is 2.5x normal! Choon Hui & Chong Chon nearing bottom of the pot!',
    recommendedDrink: 'Teh Tarik Panas Kaw or Warm Barley',
    updatedAt: 'Just now (Simulated Meteorological Station)',
    isSimulating: false,
  },
  sunny: {
    condition: 'sunny',
    title: 'Scorching Equatorial Midday',
    localNickname: 'Panas Terik Lit-Lit (Kering Kontang)',
    tempC: 33,
    humidityPct: 62,
    windKmH: 8,
    cravingFaction: 'kolok',
    cravingHeadline: 'KOLOK CRISPY LARD CRUNCH SURGE (PANAS-PANAS MAKAN MEE KERING!)',
    cravingDescription:
      'The sun blazes over the Sarawak River. Nobody wants scalding hot soup; instead, the entire city craves springy dry noodles glistening in fragrant rendered pork lard oil and icy cold beverages!',
    fomoBoostFaction: 'kolok',
    fomoBoostAmount: 20,
    stockDepletionAlert:
      '☀️ SUN SIZZLE ALERT: Extra crispy lard batches frying on high rotation! Iced Teh C Peng & White Lady shaved ice demand at all-time high.',
    recommendedDrink: 'Teh C Peng Special (3-Layer) & White Lady Shaved Ice',
    updatedAt: 'Just now (Simulated Meteorological Station)',
    isSimulating: false,
  },
  cloudy: {
    condition: 'cloudy',
    title: 'Humid Waterfront River Mist',
    localNickname: 'Mendung Teduh & Berangin',
    tempC: 28,
    humidityPct: 78,
    windKmH: 14,
    cravingFaction: 'neutral',
    cravingHeadline: 'BALANCED CRAVING (FACTION TRUCE)',
    cravingDescription:
      'Overcast skies and a gentle breeze off the Sarawak River. Ideal weather for peaceful co-existence at Lau Ya Keng under red paper lanterns.',
    fomoBoostFaction: 'kolok',
    fomoBoostAmount: 5,
    stockDepletionAlert: 'Standard morning stock consumption across all downtown kopitiams.',
    recommendedDrink: 'Kopi O Peng or Fresh Young Coconut',
    updatedAt: 'Just now (Simulated Meteorological Station)',
    isSimulating: false,
  },
};

class WeatherService {
  private currentCondition: WeatherCondition = 'rainy'; // Default to Rainy for dramatic Laksa craving on first load
  private isAutoSimulating: boolean = false;
  private simulationTimer: NodeJS.Timeout | null = null;
  private listeners: ((weather: WeatherData) => void)[] = [];

  constructor() {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('sine_weather_condition') : null;
    if (saved && (saved === 'rainy' || saved === 'sunny' || saved === 'cloudy')) {
      this.currentCondition = saved as WeatherCondition;
    }
  }

  // Subscribe to real-time weather changes
  subscribe(listener: (weather: WeatherData) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const data = this.getCurrentWeatherData();
    this.listeners.forEach((l) => l(data));
  }

  // Get current state
  getCurrentWeatherData(): WeatherData {
    const base = KUCHING_WEATHER_PRESETS[this.currentCondition];
    return {
      ...base,
      isSimulating: this.isAutoSimulating,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // Async API fetch call to simulate remote endpoint
  async fetchWeather(): Promise<WeatherData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getCurrentWeatherData());
      }, 150);
    });
  }

  // Manually toggle or set weather
  setCondition(condition: WeatherCondition): WeatherData {
    this.currentCondition = condition;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sine_weather_condition', condition);
    }
    this.notify();
    return this.getCurrentWeatherData();
  }

  // Toggle auto simulation mode (cycles between rainy and sunny every 45s)
  toggleAutoSimulation(): boolean {
    this.isAutoSimulating = !this.isAutoSimulating;
    if (this.isAutoSimulating) {
      this.simulationTimer = setInterval(() => {
        const next: WeatherCondition = this.currentCondition === 'rainy' ? 'sunny' : 'rainy';
        this.setCondition(next);
      }, 45000);
    } else {
      if (this.simulationTimer) {
        clearInterval(this.simulationTimer);
        this.simulationTimer = null;
      }
    }
    this.notify();
    return this.isAutoSimulating;
  }

  getIsAutoSimulating(): boolean {
    return this.isAutoSimulating;
  }

  /**
   * Pure functional algorithm that recalculates eatery availability,
   * FOMO scores, queue wait velocities, and stock alerts based on live weather.
   */
  applyWeatherToEateries(eateries: Eatery[], weather: WeatherData): Eatery[] {
    return eateries.map((eatery) => {
      // Retain or initialize immutable base metrics
      const baseFomo = eatery.baseFomoIndex !== undefined ? eatery.baseFomoIndex : eatery.fomoIndex;
      const baseQueue = eatery.baseQueueWaitMin !== undefined ? eatery.baseQueueWaitMin : eatery.queueWaitMin;

      let newFomo = baseFomo;
      let newQueue = baseQueue;
      let boost = 0;
      let weatherNotice = '';
      let availabilityStatus: Eatery['weatherAvailabilityStatus'] = 'normal';
      let stockNote = eatery.stockNote;

      if (weather.condition === 'rainy') {
        // === RAINY WEATHER: LAKSA CRAVING SURGE ===
        if (eatery.faction === 'laksa') {
          boost = +22;
          newFomo = Math.min(100, Math.round(baseFomo * 1.18 + 4));
          newQueue = Math.round(baseQueue * 1.4 + 6);
          availabilityStatus = 'critical_stock';
          weatherNotice = '🌧️ Rain Surge: +22% Craving Boost • High Broth Depletion!';

          if (eatery.id === 'choon-hui') {
            stockNote = '🚨 DOWNPOUR SELLOUT EMERGENCY: Only 5 bowls of Holy Prawn Broth remaining!';
          } else if (eatery.id === 'chong-chon') {
            stockNote = '🌧️ Rain Surge: Pot 3 boiling dry! Extra sambal requests flooding counter';
          } else if (eatery.id === 'pending-seafood-kopitiam') {
            stockNote = '🌧️ River Mist Downpour: Port fishermen slurping giant tiger prawn laksa!';
          } else {
            stockNote = '⚠️ Rain Craving Peak: Broth reserves depleting twice as fast!';
          }
        } else if (eatery.faction === 'kolok') {
          boost = -6;
          newFomo = Math.max(62, baseFomo - 6);
          newQueue = Math.max(5, baseQueue - 4);
          availabilityStatus = 'sheltered_rush';
          weatherNotice = '☔ Rain Shelter: Covered indoor seating priority';
          stockNote = 'Covered tables full • Mee Kolok Kicap with separate hot soup in high demand';
        } else {
          // Compromise spots: peaceful sheltered sanctuary
          boost = +14;
          newFomo = Math.min(99, baseFomo + 6);
          newQueue = baseQueue + 4;
          availabilityStatus = 'high_demand';
          weatherNotice = '🤝 Rain Sanctuary: Sheltered temple court bustling with Laksa slurpers!';
          stockNote = 'Lau Ya Keng covered canopy full • Laksa stall has line out to Carpenter St';
        }
      } else if (weather.condition === 'sunny') {
        // === SUNNY WEATHER: KOLOK CRISPY LARD SURGE ===
        if (eatery.faction === 'kolok') {
          boost = +20;
          newFomo = Math.min(100, Math.round(baseFomo * 1.16 + 5));
          newQueue = Math.round(baseQueue * 1.35 + 5);
          availabilityStatus = 'high_demand';
          weatherNotice = '☀️ Sun Peak: +20% Craving Boost • Crispy Lard Frenzy!';

          if (eatery.id === 'sin-lian-shin') {
            stockNote = '☀️ SUN SIZZLE: Extra crispy rendered lard cubes tossing fast • Teh C Peng frenzy!';
          } else if (eatery.id === 'noodle-descendants') {
            stockNote = '☀️ Midday Sun Rush: Fast curly noodle tosses • High energy kopitiam crowds!';
          } else if (eatery.id === 'hui-sing-hawker') {
            stockNote = '☀️ Sun Refreshment: Stall 7 Kolo Mee paired with ice cold White Lady dessert!';
          } else {
            stockNote = '☀️ Sunny Rush: Springy curly noodles & fresh rendered lard oil flying!';
          }
        } else if (eatery.faction === 'laksa') {
          // In hot 33°C weather, hot soup dips slightly UNLESS air-conditioned
          if (eatery.id === 'madam-tang') {
            boost = +12;
            newFomo = Math.min(96, baseFomo + 8);
            availabilityStatus = 'high_demand';
            weatherNotice = '☀️ Air-Con Refuge: Ice-chilled dining with premium beef laksa';
            stockNote = 'Air-conditioned dining hall full • Chilled calamansi drinks surging';
          } else {
            boost = -7;
            newFomo = Math.max(68, baseFomo - 7);
            newQueue = Math.max(8, baseQueue - 5);
            availabilityStatus = 'normal';
            weatherNotice = '☀️ Hot Midday: Ceiling fans at full speed • Pair with Iced Barley';
            stockNote = 'Open-air fans running • Recommend cold coconut water or iced teh';
          }
        } else {
          // Compromise spots
          boost = +12;
          newFomo = Math.min(98, baseFomo + 5);
          availabilityStatus = 'high_demand';
          weatherNotice = '☀️ Sun Sanctuary: Kolo Mee Merah & shaved ice dessert combo ready!';
          stockNote = 'Red char siu oil noodles tossing fast alongside cold refreshment stalls';
        }
      } else {
        // === CLOUDY / HUMID: BALANCED EQUILIBRIUM ===
        boost = 0;
        newFomo = baseFomo;
        newQueue = baseQueue;
        availabilityStatus = 'normal';
        weatherNotice = '☁️ Humid Breeze: Equal demand for both dry noodles & hot broth';
      }

      return {
        ...eatery,
        baseFomoIndex: baseFomo,
        baseQueueWaitMin: baseQueue,
        fomoIndex: newFomo,
        fomoTrend: boost > 5 ? 'surging' : boost < -3 ? 'cooling' : 'stable',
        queueWaitMin: newQueue,
        weatherCravingBoost: boost,
        weatherNotice,
        weatherAvailabilityStatus: availabilityStatus,
        stockNote,
      };
    });
  }

  // Calculate live statistical breakdown of weather impact
  calculateImpactSummary(eateries: Eatery[], weather: WeatherData): WeatherImpactSummary {
    const laksaSpots = eateries.filter((e) => e.faction === 'laksa');
    const kolokSpots = eateries.filter((e) => e.faction === 'kolok');

    const laksaAvg =
      laksaSpots.length > 0
        ? Math.round(laksaSpots.reduce((acc, curr) => acc + curr.fomoIndex, 0) / laksaSpots.length)
        : 85;

    const kolokAvg =
      kolokSpots.length > 0
        ? Math.round(kolokSpots.reduce((acc, curr) => acc + curr.fomoIndex, 0) / kolokSpots.length)
        : 85;

    return {
      laksaAvgFomo: laksaAvg,
      kolokAvgFomo: kolokAvg,
      activeSurgeFaction: weather.cravingFaction,
      brothRiskLevel:
        weather.condition === 'rainy' ? 'CRITICAL' : weather.condition === 'cloudy' ? 'ELEVATED' : 'STABLE',
      shelterStatus:
        weather.condition === 'rainy'
          ? 'Indoor Covered Stalls at 98% Capacity'
          : 'Outdoor & Covered Stalls Operating Smoothly',
    };
  }
}

export const weatherApi = new WeatherService();
