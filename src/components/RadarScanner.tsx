import React, { useState, useEffect } from 'react';
import { Radio, Compass, Filter, Zap, Clock, MapPin, ChevronRight, CheckCircle2, ShieldAlert, CloudRain, Sun } from 'lucide-react';
import { Eatery, Faction, WeatherData } from '../types';
import { soundFx } from '../utils/audio';

interface RadarScannerProps {
  eateries: Eatery[];
  selectedEatery: Eatery | null;
  onSelectEatery: (eatery: Eatery) => void;
  onLockSquadQuest: (eatery: Eatery) => void;
  userFaction: 'kolok' | 'laksa';
  weather?: WeatherData;
}

export const RadarScanner: React.FC<RadarScannerProps> = ({
  eateries,
  selectedEatery,
  onSelectEatery,
  onLockSquadQuest,
  userFaction,
  weather,
}) => {
  const [isScanning, setIsScanning] = useState(true);
  const [radiusKm, setRadiusKm] = useState(3.5);
  const [activeFilter, setActiveFilter] = useState<'all' | 'kolok' | 'laksa' | 'compromise' | 'halal' | 'fomoHot' | 'weatherCraving'>('all');
  const [sweepAngle, setSweepAngle] = useState(0);

  // Animate sweep angle
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      setSweepAngle((prev) => (prev + (delta * 0.12)) % 360);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const triggerRadarPulse = () => {
    setIsScanning(true);
    soundFx.playRadarPing();
  };

  // Filter eateries
  const filteredEateries = eateries.filter((e) => {
    if (activeFilter === 'kolok') return e.faction === 'kolok';
    if (activeFilter === 'laksa') return e.faction === 'laksa';
    if (activeFilter === 'compromise') return e.faction === 'compromise';
    if (activeFilter === 'halal') return e.isHalalFriendly;
    if (activeFilter === 'fomoHot') return e.fomoIndex >= 88;
    if (activeFilter === 'weatherCraving') return (e.weatherCravingBoost || 0) > 0;
    return true;
  });

  // Center coordinate for the radar (approximate center of Kuching core: Carpenter / Ban Hock)
  const center = { x: 440, y: 500 };

  return (
    <div id="sine-mok-makan-radar" className="relative flex flex-col overflow-hidden rounded-[32px] border-4 border-[#2D2424] bg-white p-4 text-[#2D2424] shadow-brutal-lg sm:p-6">
      {/* Background dot matrix */}
      <div className="pointer-events-none absolute inset-0 opacity-10 bg-dot-pattern" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#2D2424]/20 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="bg-[#E53935] text-white px-3 py-1 rounded-full font-black text-xs flex items-center gap-2 shadow-2xs">
              <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
              FOMO RADAR ACTIVE
            </span>
            <h2 className="text-xl font-black tracking-tight text-[#2D2424] sm:text-2xl">
              "SINE MOK MAKAN?" RADAR
            </h2>
          </div>
          <p className="mt-1 text-xs font-bold text-[#2D2424]/70">
            Sitting in the car paralyzed by indecision? Live sonar scans the hottest stalls within your radius right now.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="trigger-radar-ping-btn"
            onClick={triggerRadarPulse}
            className="flex items-center gap-2 rounded-2xl border-2 border-[#2D2424] bg-[#FFB300] px-4 py-2 text-xs font-black text-[#2D2424] transition-all hover:bg-[#FFA000] active:scale-95 shadow-brutal-sm"
          >
            <Radio className="h-4 w-4 animate-pulse" />
            <span>PING RADIUS</span>
          </button>
        </div>
      </div>

      {/* Filter and Radius Controls */}
      <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-black text-[11px] text-[#2D2424] uppercase tracking-wider flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Faction:
          </span>
          <button
            onClick={() => {
              soundFx.playTick(500);
              setActiveFilter('all');
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all border-2 border-[#2D2424] ${
              activeFilter === 'all'
                ? 'bg-[#2D2424] text-white shadow-brutal-sm'
                : 'bg-white text-[#2D2424] hover:bg-[#FFF8E1]'
            }`}
          >
            All Spots ({eateries.length})
          </button>
          <button
            onClick={() => {
              soundFx.playTick(550);
              setActiveFilter('kolok');
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all border-2 border-[#2D2424] flex items-center gap-1.5 ${
              activeFilter === 'kolok'
                ? 'bg-[#FFB300] text-[#2D2424] shadow-brutal-sm'
                : 'bg-white text-[#2D2424] hover:bg-amber-50'
            }`}
          >
            <span>🥢</span> Team Kolok
          </button>
          <button
            onClick={() => {
              soundFx.playTick(600);
              setActiveFilter('laksa');
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all border-2 border-[#2D2424] flex items-center gap-1.5 ${
              activeFilter === 'laksa'
                ? 'bg-[#E53935] text-white shadow-brutal-sm'
                : 'bg-white text-[#2D2424] hover:bg-red-50'
            }`}
          >
            <span>🍤</span> Team Laksa
          </button>
          <button
            onClick={() => {
              soundFx.playTick(650);
              setActiveFilter('compromise');
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all border-2 border-[#2D2424] flex items-center gap-1.5 ${
              activeFilter === 'compromise'
                ? 'bg-emerald-500 text-white shadow-brutal-sm'
                : 'bg-white text-[#2D2424] hover:bg-emerald-50'
            }`}
          >
            Neutral Compromise
          </button>
          <button
            onClick={() => {
              soundFx.playTick(700);
              setActiveFilter('halal');
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all border-2 border-[#2D2424] ${
              activeFilter === 'halal'
                ? 'bg-teal-500 text-white shadow-brutal-sm'
                : 'bg-white text-[#2D2424] hover:bg-teal-50'
            }`}
          >
            Halal / Friendly
          </button>
          <button
            onClick={() => {
              soundFx.playTick(750);
              setActiveFilter('fomoHot');
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all border-2 border-[#2D2424] flex items-center gap-1 ${
              activeFilter === 'fomoHot'
                ? 'bg-[#E53935] text-white shadow-brutal-sm'
                : 'bg-white text-[#2D2424] hover:bg-red-50'
            }`}
          >
            <Zap className="h-3 w-3" /> Peak FOMO (&gt;88%)
          </button>

          {/* Weather Craving Surge Filter Button */}
          <button
            id="radar-filter-weather-craving"
            onClick={() => {
              soundFx.playTick(800);
              setActiveFilter(activeFilter === 'weatherCraving' ? 'all' : 'weatherCraving');
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all border-2 border-[#2D2424] flex items-center gap-1.5 ${
              activeFilter === 'weatherCraving'
                ? 'bg-[#2D2424] text-[#FFB300] shadow-brutal-sm scale-105'
                : weather?.condition === 'rainy'
                ? 'bg-rose-100 text-rose-900 hover:bg-rose-200'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            }`}
          >
            {weather?.condition === 'rainy' ? (
              <>
                <CloudRain className="h-3.5 w-3.5 text-[#E53935]" />
                <span>🌧️ Rain Surge Spots</span>
              </>
            ) : (
              <>
                <Sun className="h-3.5 w-3.5 text-[#FFB300]" />
                <span>☀️ Sun Rush Spots</span>
              </>
            )}
          </button>
        </div>

        {/* Range slider */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-2xl border-2 border-[#2D2424] shadow-brutal-sm">
          <Compass className="h-4 w-4 text-[#2D2424]" />
          <span className="text-[11px] text-[#2D2424] font-black uppercase">Radius:</span>
          <input
            type="range"
            min="1.0"
            max="6.0"
            step="0.5"
            value={radiusKm}
            onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
            className="h-2 w-20 cursor-pointer accent-[#E53935]"
          />
          <span className="font-mono text-xs font-black text-[#E53935]">{radiusKm.toFixed(1)} km</span>
        </div>
      </div>

      {/* Main Radar Screen + Quick Panel Grid */}
      <div className="relative z-10 mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12 items-center">
        {/* Radar Circular Visual (7 cols on lg) */}
        <div className="relative mx-auto flex h-[320px] w-[320px] sm:h-[380px] sm:w-[380px] items-center justify-center rounded-full border-4 border-[#2D2424] bg-[#2D2424] p-2 shadow-brutal-lg lg:col-span-7">
          {/* Radar background grid rings */}
          <div className="absolute inset-4 rounded-full border-2 border-dashed border-white/20" />
          <div className="absolute inset-14 rounded-full border-2 border-dashed border-white/30" />
          <div className="absolute inset-28 rounded-full border-2 border-dashed border-white/40" />
          <div className="absolute inset-40 rounded-full border-2 border-dashed border-white/50" />

          {/* Crosshairs */}
          <div className="absolute h-full w-[2px] bg-white/20" />
          <div className="absolute w-full h-[2px] bg-white/20" />
          <div className="absolute h-full w-[1px] rotate-45 bg-white/10" />
          <div className="absolute h-full w-[1px] -rotate-45 bg-white/10" />

          {/* Compass labels */}
          <span className="absolute top-3 font-mono text-[9px] font-black text-[#FFB300] uppercase">N (Matang)</span>
          <span className="absolute bottom-3 font-mono text-[9px] font-black text-[#FFB300] uppercase">S (Tabuan / Hui Sing)</span>
          <span className="absolute left-3 font-mono text-[9px] font-black text-[#FFB300] uppercase">W (Satok)</span>
          <span className="absolute right-3 font-mono text-[9px] font-black text-[#FFB300] uppercase">E (Pending)</span>

          {/* Rotating sweep cone */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              transform: `rotate(${sweepAngle}deg)`,
              background: `conic-gradient(from 0deg at 50% 50%, rgba(229, 57, 53, 0.35) 0deg, rgba(255, 179, 0, 0.1) 45deg, transparent 75deg)`,
            }}
          />

          {/* Center User Car Marker */}
          <div className="relative z-20 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#E53935] text-sm text-white shadow-lg ring-4 ring-[#E53935]/30">
            🚗
          </div>

          {/* Render Eatery Blips */}
          {filteredEateries.map((eatery) => {
            const dx = (eatery.coordinates.x - center.x) * 0.55;
            const dy = (eatery.coordinates.y - center.y) * 0.55;

            const distApprox = Math.sqrt(dx * dx + dy * dy);
            if (distApprox > 150) return null;

            const isSelected = selectedEatery?.id === eatery.id;

            const colorClass =
              eatery.faction === 'kolok'
                ? 'bg-[#FFB300] text-[#2D2424] border-white shadow-[0_0_12px_rgba(255,179,0,0.9)]'
                : eatery.faction === 'laksa'
                ? 'bg-[#E53935] text-white border-white shadow-[0_0_12px_rgba(229,57,53,0.9)]'
                : 'bg-emerald-400 text-[#2D2424] border-white shadow-[0_0_12px_rgba(52,211,153,0.9)]';

            return (
              <button
                key={eatery.id}
                id={`radar-blip-${eatery.id}`}
                onClick={() => {
                  soundFx.playTick(600);
                  onSelectEatery(eatery);
                }}
                className={`group absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-130 active:scale-95 ${
                  isSelected ? 'scale-125 z-40' : ''
                }`}
                style={{
                  left: `calc(50% + ${dx}px)`,
                  top: `calc(50% + ${dy}px)`,
                }}
                title={`${eatery.name} (${eatery.specialtyDish})`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-black transition-all ${colorClass} ${
                    isSelected ? 'ring-4 ring-white' : ''
                  }`}
                >
                  {eatery.faction === 'kolok' ? '🥢' : eatery.faction === 'laksa' ? '🍤' : '🤝'}
                </div>

                {/* Micro tooltip pill on hover or selection */}
                {(isSelected || eatery.fomoIndex >= 95) && (
                  <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-white px-2 py-0.5 text-[9px] font-black text-[#2D2424] shadow-brutal-sm border-2 border-[#2D2424]">
                    {eatery.name.slice(0, 14)}.. ({eatery.fomoIndex}%)
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Eatery Live Intelligence Card (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-[28px] border-4 border-[#2D2424] bg-white p-4 shadow-brutal sm:p-5">
          {selectedEatery ? (
            <div className="space-y-3.5">
              {/* Header with faction tag and FOMO index */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide border-2 border-[#2D2424] ${
                        selectedEatery.faction === 'kolok'
                          ? 'bg-[#FFB300] text-[#2D2424]'
                          : selectedEatery.faction === 'laksa'
                          ? 'bg-[#E53935] text-white'
                          : 'bg-emerald-400 text-[#2D2424]'
                      }`}
                    >
                      {selectedEatery.faction === 'kolok'
                        ? '🥢 Team Kolok Stronghold'
                        : selectedEatery.faction === 'laksa'
                        ? '🍤 Church of Laksa Shrine'
                        : '🤝 Compromise Sanctuary'}
                    </span>
                    {selectedEatery.isHalalFriendly && (
                      <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[9px] font-black text-teal-900 border border-teal-800">
                        HALAL
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 text-lg font-black text-[#2D2424] sm:text-xl">
                    {selectedEatery.name}
                  </h3>
                  <p className="flex items-center gap-1 text-xs font-bold text-[#2D2424]/70">
                    <MapPin className="h-3 w-3 text-[#E53935]" />
                    {selectedEatery.area}
                  </p>
                </div>

                {/* FOMO meter gauge */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 rounded-2xl bg-[#E53935] px-3 py-1 text-white border-2 border-[#2D2424] shadow-brutal-sm">
                    <Zap className="h-3.5 w-3.5 text-white animate-pulse" />
                    <span className="font-mono text-sm font-black">
                      {selectedEatery.fomoIndex}%
                    </span>
                  </div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-[#2D2424]/60 mt-1">
                    FOMO INDEX
                  </span>
                </div>
              </div>

              {/* Specialty & Stock alert */}
              <div className="rounded-2xl border-2 border-[#2D2424] bg-[#FFF8E1] p-3 space-y-2">
                <div className="text-xs">
                  <span className="font-black text-[#2D2424] uppercase">Target Dish:</span>{' '}
                  <span className="font-bold text-[#2D2424]">{selectedEatery.specialtyDish}</span>
                </div>

                {selectedEatery.weatherNotice && (
                  <div className={`flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-xl border border-[#2D2424] ${
                    (selectedEatery.weatherCravingBoost || 0) > 0
                      ? selectedEatery.faction === 'laksa'
                        ? 'bg-[#E53935] text-white'
                        : 'bg-[#FFB300] text-[#2D2424]'
                      : 'bg-white text-[#2D2424]'
                  }`}>
                    <span>{selectedEatery.weatherNotice}</span>
                  </div>
                )}

                {selectedEatery.stockNote && (
                  <div className="flex items-center gap-1.5 text-xs font-black text-white bg-[#2D2424] px-2.5 py-1 rounded-xl border border-[#2D2424]">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-[#FFB300]" />
                    <span>{selectedEatery.stockNote}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-bold text-[#2D2424] pt-1 border-t border-[#2D2424]/20">
                  <span>Est. Queue Wait:</span>
                  <span className="font-black text-[#E53935]">~{selectedEatery.queueWaitMin} mins</span>
                </div>
              </div>

              {/* Viral tags */}
              <div className="flex flex-wrap gap-1.5">
                {selectedEatery.viralTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white border border-[#2D2424] px-2.5 py-0.5 text-[10px] font-black text-[#2D2424]">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  id={`lock-squad-quest-${selectedEatery.id}`}
                  onClick={() => {
                    soundFx.playFanfare();
                    onLockSquadQuest(selectedEatery);
                  }}
                  className="flex-1 rounded-2xl bg-[#FFB300] hover:bg-[#FFA000] px-4 py-3 text-xs font-black text-[#2D2424] border-2 border-[#2D2424] shadow-brutal-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>LOCK AS SQUAD QUEST</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-10 space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF8E1] border-2 border-[#2D2424] text-[#E53935] shadow-brutal-sm">
                <Radio className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-base text-[#2D2424]">
                  Select a Sonar Ping on the Radar
                </h4>
                <p className="text-xs font-bold text-[#2D2424]/70 max-w-xs mt-1">
                  Click any glowing blip to inspect live queue lengths, remaining broth count, and specialty lard recipes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
