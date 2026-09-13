import React from 'react';
import {
  CloudRain,
  Sun,
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  AlertTriangle,
  RefreshCw,
  Coffee
} from 'lucide-react';
import { WeatherCondition, WeatherData, WeatherImpactSummary } from '../types';
import { soundFx } from '../utils/audio';

interface WeatherRadarWidgetProps {
  weather?: WeatherData;
  impactSummary?: WeatherImpactSummary;
  onSelectCondition: (condition: WeatherCondition) => void;
  onToggleAutoSim: () => void;
  isSimulating: boolean;
}

export const WeatherRadarWidget: React.FC<WeatherRadarWidgetProps> = ({
  weather,
  impactSummary,
  onSelectCondition,
  onToggleAutoSim,
  isSimulating,
}) => {
  // Guard against undefined props during initial load or data fetch
  if (!weather || !impactSummary) {
    return (
      <section className="relative overflow-hidden rounded-[28px] border-4 border-[#3E2723] bg-[#FFF8E1] p-4 text-[#3E2723] shadow-brutal">
        <div className="flex items-center justify-center py-6 text-sm font-black">
          Loading weather radar...
        </div>
      </section>
    );
  }

  const isRainy = weather.condition === 'rainy';
  const isSunny = weather.condition === 'sunny';

  const handleConditionClick = (condition: WeatherCondition) => {
    if (condition === 'rainy') {
      soundFx.playRainSound();
    } else if (condition === 'sunny') {
      soundFx.playSunnySound();
    } else {
      soundFx.playWeatherShift();
    }
    onSelectCondition(condition);
  };

  return (
    <section
      id="kuching-weather-craving-engine"
      className="relative overflow-hidden rounded-[28px] border-4 border-[#3E2723] bg-[#FFF8E1] p-4 text-[#3E2723] shadow-brutal transition-all sm:p-5"
    >
      {/* Dynamic atmospheric ambient glow behind the widget */}
      <div
        className={`pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full blur-3xl opacity-25 transition-all duration-700 ${
          isRainy ? 'bg-[#D32F2F]' : isSunny ? 'bg-[#FFC107]' : 'bg-[#1B4D3E]'
        }`}
      />

      <div className="relative z-10 flex flex-col gap-3.5">
        {/* Top bar: title, live weather tag, API condition controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#3E2723]/20 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-brutal-sm border-2 border-[#3E2723] transition-transform ${
                isRainy
                  ? 'bg-[#D32F2F] text-white animate-bounce'
                  : isSunny
                  ? 'bg-[#FFC107] text-[#3E2723] rotate-12'
                  : 'bg-white text-[#1B4D3E]'
              }`}
            >
              {isRainy ? '🌧️' : isSunny ? '☀️' : '☁️'}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#3E2723] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#FFC107]">
                  KUCHING WEATHER API
                </span>
                <span className="rounded-full border border-[#3E2723] bg-white px-2.5 py-0.5 text-[10px] font-black text-[#3E2723] flex items-center gap-1 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-[#1B4D3E] animate-ping" />
                  LIVE CRAVING ENGINE
                </span>
              </div>
              <h3 className="mt-0.5 text-base font-black tracking-tight text-[#3E2723] sm:text-lg">
                {weather.localNickname}
              </h3>
            </div>
          </div>

          {/* Direct Weather Condition Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-black uppercase text-[#3E2723] mr-1 hidden md:inline">
              Simulate Weather:
            </span>

            <button
              id="weather-toggle-rainy"
              onClick={() => handleConditionClick('rainy')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all border-2 border-[#3E2723] ${
                isRainy
                  ? 'bg-[#D32F2F] text-white shadow-brutal-sm scale-105'
                  : 'bg-white text-[#3E2723] hover:bg-rose-50'
              }`}
              title="Trigger Rainy Weather & Laksa Craving Surge"
            >
              <CloudRain className="h-3.5 w-3.5" />
              <span>🌧️ Rainy (Laksa Surge)</span>
            </button>

            <button
              id="weather-toggle-sunny"
              onClick={() => handleConditionClick('sunny')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all border-2 border-[#3E2723] ${
                isSunny
                  ? 'bg-[#FFC107] text-[#3E2723] shadow-brutal-sm scale-105'
                  : 'bg-white text-[#3E2723] hover:bg-amber-50'
              }`}
              title="Trigger Sunny Weather & Kolok Craving Surge"
            >
              <Sun className="h-3.5 w-3.5" />
              <span>☀️ Sunny (Kolok Rush)</span>
            </button>

            <button
              id="weather-toggle-cloudy"
              onClick={() => handleConditionClick('cloudy')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all border-2 border-[#3E2723] ${
                weather.condition === 'cloudy'
                  ? 'bg-[#3E2723] text-white shadow-brutal-sm'
                  : 'bg-white text-[#3E2723] hover:bg-stone-100'
              }`}
              title="Equilibrium Weather"
            >
              <Cloud className="h-3.5 w-3.5" />
              <span>☁️ Overcast</span>
            </button>

            <button
              id="weather-toggle-auto"
              onClick={() => {
                soundFx.playTick(600);
                onToggleAutoSim();
              }}
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-black transition-all border-2 border-[#3E2723] ${
                isSimulating
                  ? 'bg-[#1B4D3E] text-white shadow-brutal-sm'
                  : 'bg-white text-[#3E2723] opacity-80 hover:opacity-100'
              }`}
              title="Toggle Auto Weather Cycling"
            >
              <RefreshCw className={`h-3 w-3 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'AUTO: ON' : 'AUTO: OFF'}</span>
            </button>
          </div>
        </div>

        {/* Live Weather Metrics Chips */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="flex items-center gap-2 rounded-xl border-2 border-[#3E2723] bg-white p-2.5 shadow-2xs">
            <Thermometer className={`h-4 w-4 ${isSunny ? 'text-[#D32F2F]' : 'text-[#1B4D3E]'}`} />
            <div>
              <span className="block text-[9px] font-black uppercase text-[#3E2723]/60">TEMP</span>
              <span className="text-sm font-black text-[#3E2723]">{weather.tempC}°C</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border-2 border-[#3E2723] bg-white p-2.5 shadow-2xs">
            <Droplets className="h-4 w-4 text-sky-600" />
            <div>
              <span className="block text-[9px] font-black uppercase text-[#3E2723]/60">HUMIDITY</span>
              <span className="text-sm font-black text-[#3E2723]">{weather.humidityPct}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border-2 border-[#3E2723] bg-white p-2.5 shadow-2xs">
            <Wind className="h-4 w-4 text-[#1B4D3E]" />
            <div>
              <span className="block text-[9px] font-black uppercase text-[#3E2723]/60">WIND</span>
              <span className="text-sm font-black text-[#3E2723]">{weather.windKmH} km/h</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border-2 border-[#3E2723] bg-white p-2.5 shadow-2xs">
            <Coffee className="h-4 w-4 text-[#FFC107]" />
            <div className="min-w-0">
              <span className="block text-[9px] font-black uppercase text-[#3E2723]/60 truncate">DRINK PAIRING</span>
              <span className="text-xs font-black text-[#3E2723] truncate block">
                {weather.recommendedDrink.split('&')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* The Dynamic Craving Surge Highlight Banner */}
        <div
          className={`relative overflow-hidden rounded-2xl border-3 border-[#3E2723] p-3.5 sm:p-4 transition-all shadow-brutal-sm ${
            isRainy
              ? 'bg-[#D32F2F] text-white'
              : isSunny
              ? 'bg-[#FFC107] text-[#3E2723]'
              : 'bg-white text-[#3E2723]'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1 min-w-[240px]">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#3E2723] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white border border-white/30">
                  {isRainy ? '🌧️ CRAVING SURGE: TEAM LAKSA' : isSunny ? '☀️ CRAVING SURGE: TEAM KOLOK' : '☁️ BALANCED CRAVING'}
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-[#3E2723] shadow-2xs">
                  {isRainy ? '+22% FOMO BOOST' : isSunny ? '+20% FOMO BOOST' : 'BASE RATINGS'}
                </span>
              </div>

              <h4 className="mt-1 text-sm font-black tracking-tight sm:text-base">
                {weather.cravingHeadline}
              </h4>
              <p className="mt-1 text-xs font-bold leading-relaxed opacity-95">
                {weather.cravingDescription}
              </p>
            </div>

            {/* Quick Faction FOMO comparison chip */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0 bg-white/90 p-2.5 rounded-xl border-2 border-[#3E2723] text-[#3E2723]">
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-black block uppercase text-[#3E2723]/70">LAKSA AVG FOMO</span>
                <span className={`text-base font-black ${isRainy ? 'text-[#D32F2F]' : 'text-[#3E2723]'}`}>
                  {impactSummary.laksaAvgFomo}% {isRainy ? '🔺 SURGING' : ''}
                </span>
              </div>
              <div className="text-left sm:text-right border-l-2 sm:border-l-0 sm:border-t-2 border-[#3E2723]/20 pl-2 sm:pl-0 sm:pt-1">
                <span className="text-[10px] font-black block uppercase text-[#3E2723]/70">KOLOK AVG FOMO</span>
                <span className={`text-base font-black ${isSunny ? 'text-amber-700' : 'text-[#3E2723]'}`}>
                  {impactSummary.kolokAvgFomo}% {isSunny ? '🔺 SURGING' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Stock & Broth depletion notice */}
          <div className="mt-3 flex items-center gap-2 border-t-2 border-[#3E2723]/20 pt-2.5 text-xs font-black">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="leading-snug">{weather.stockDepletionAlert}</span>
          </div>
        </div>
      </div>
    </section>
  );
};