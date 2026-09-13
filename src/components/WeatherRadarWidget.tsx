import React from 'react';
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
        <div className="flex items-center justify-center py-6 text-sm font-black tracking-wider uppercase">
          Loading atmospheric telemetry...
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
          isRainy ? 'bg-[#D32F2F]' : isSunny ? 'bg-[#FFC107]' : 'bg-[#FFC107]'
        }`}
      />

      <div className="relative z-10 flex flex-col gap-3.5">
        {/* Top bar: title, live weather tag, API condition controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#3E2723]/20 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xs font-black uppercase tracking-wider shadow-brutal-sm border-2 border-[#3E2723] transition-transform ${
                isRainy
                  ? 'bg-[#D32F2F] text-white animate-pulse'
                  : isSunny
                  ? 'bg-[#FFC107] text-[#3E2723]'
                  : 'bg-white text-[#3E2723]'
              }`}
            >
              {isRainy ? 'RAIN' : isSunny ? 'SUN' : 'CLD'}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#3E2723] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#FFC107]">
                  KUCHING WEATHER
                </span>
                <span className="rounded-full border border-[#3E2723] bg-white px-2.5 py-0.5 text-[10px] font-black text-[#3E2723] tracking-wide shadow-2xs">
                  LIVE TELEMETRY
                </span>
              </div>
              <h3 className="mt-0.5 text-base font-black tracking-tight text-[#3E2723] sm:text-lg">
                {weather.localNickname}
              </h3>
            </div>
          </div>

          {/* Direct Weather Condition Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#3E2723] mr-1 hidden md:inline">
              Simulation:
            </span>

            <button
              id="weather-toggle-rainy"
              onClick={() => handleConditionClick('rainy')}
              className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all border-2 border-[#3E2723] ${
                isRainy
                  ? 'bg-[#D32F2F] text-white shadow-brutal-sm scale-105'
                  : 'bg-white text-[#3E2723] hover:bg-rose-50'
              }`}
              title="Trigger Rainy Weather & Laksa Craving Surge"
            >
              Rainy
            </button>

            <button
              id="weather-toggle-sunny"
              onClick={() => handleConditionClick('sunny')}
              className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all border-2 border-[#3E2723] ${
                isSunny
                  ? 'bg-[#FFC107] text-[#3E2723] shadow-brutal-sm scale-105'
                  : 'bg-white text-[#3E2723] hover:bg-amber-50'
              }`}
              title="Trigger Sunny Weather & Kolok Craving Surge"
            >
              Sunny
            </button>

            <button
              id="weather-toggle-cloudy"
              onClick={() => handleConditionClick('cloudy')}
              className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all border-2 border-[#3E2723] ${
                weather.condition === 'cloudy'
                  ? 'bg-[#3E2723] text-white shadow-brutal-sm'
                  : 'bg-white text-[#3E2723] hover:bg-stone-100'
              }`}
              title="Equilibrium Weather"
            >
              Overcast
            </button>

            <button
              id="weather-toggle-auto"
              onClick={() => {
                soundFx.playTick(600);
                onToggleAutoSim();
              }}
              className={`rounded-xl px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all border-2 border-[#3E2723] ${
                isSimulating
                  ? 'bg-[#FFC107] text-[#3E2723] shadow-brutal-sm'
                  : 'bg-white text-[#3E2723] opacity-80 hover:opacity-100'
              }`}
              title="Toggle Auto Weather Cycling"
            >
              {isSimulating ? 'Auto: Active' : 'Auto: Idle'}
            </button>
          </div>
        </div>

        {/* Live Weather Metrics Chips */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#3E2723] bg-white p-2.5 shadow-2xs">
            <div className="h-2 w-2 rounded-full bg-[#D32F2F]" />
            <div>
              <span className="block text-[9px] font-black uppercase tracking-wider text-[#3E2723]/60">Temp</span>
              <span className="text-sm font-black text-[#3E2723]">{weather.tempC}°C</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#3E2723] bg-white p-2.5 shadow-2xs">
            <div className="h-2 w-2 rounded-full bg-sky-600" />
            <div>
              <span className="block text-[9px] font-black uppercase tracking-wider text-[#3E2723]/60">Humidity</span>
              <span className="text-sm font-black text-[#3E2723]">{weather.humidityPct}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#3E2723] bg-white p-2.5 shadow-2xs">
            <div className="h-2 w-2 rounded-full bg-[#FFC107]" />
            <div>
              <span className="block text-[9px] font-black uppercase tracking-wider text-[#3E2723]/60">Wind</span>
              <span className="text-sm font-black text-[#3E2723]">{weather.windKmH} km/h</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#3E2723] bg-white p-2.5 shadow-2xs">
            <div className="h-2 w-2 rounded-full bg-[#FFC107]" />
            <div className="min-w-0">
              <span className="block text-[9px] font-black uppercase tracking-wider text-[#3E2723]/60 truncate">Pairing</span>
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
                  {isRainy ? 'Surge: Laksa Protocol' : isSunny ? 'Surge: Kolok Protocol' : 'Equilibrium State'}
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-[#3E2723] tracking-wide shadow-2xs">
                  {isRainy ? '+22% FOMO' : isSunny ? '+20% FOMO' : 'Baseline'}
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
                <span className="text-[10px] font-black block uppercase tracking-wider text-[#3E2723]/70">Laksa FOMO</span>
                <span className={`text-base font-black ${isRainy ? 'text-[#D32F2F]' : 'text-[#3E2723]'}`}>
                  {impactSummary.laksaAvgFomo}% {isRainy ? '[Peak]' : ''}
                </span>
              </div>
              <div className="text-left sm:text-right border-l-2 sm:border-l-0 sm:border-t-2 border-[#3E2723]/20 pl-2 sm:pl-0 sm:pt-1">
                <span className="text-[10px] font-black block uppercase tracking-wider text-[#3E2723]/70">Kolok FOMO</span>
                <span className={`text-base font-black ${isSunny ? 'text-amber-700' : 'text-[#3E2723]'}`}>
                  {impactSummary.kolokAvgFomo}% {isSunny ? '[Peak]' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Stock & Broth depletion notice */}
          <div className="mt-3 flex items-center gap-2 border-t-2 border-[#3E2723]/20 pt-2.5 text-xs font-black uppercase tracking-wide">
            <span className="rounded bg-black/10 px-1.5 py-0.5 text-[10px]">Notice</span>
            <span className="leading-snug">{weather.stockDepletionAlert}</span>
          </div>
        </div>
      </div>
    </section>
  );
};