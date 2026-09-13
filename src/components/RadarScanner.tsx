import React, { useState, useEffect } from 'react';
import { Eatery, WeatherData } from '../types';
import { INITIAL_EATERIES } from '../data/kuchingEateries';
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
  eateries = [],
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

  // FORCE use the full 19 spots if the passed prop is truncated or empty
  const activeEateries = eateries.length >= 15 ? eateries : INITIAL_EATERIES;

  // Animate sweep angle
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      setSweepAngle((prev) => (prev + delta * 0.12) % 360);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const triggerRadarPulse = () => {
    setIsScanning(true);
    soundFx.playRadarPing();
  };

  // Filter eateries using the robust activeEateries list
  const filteredEateries = activeEateries.filter((e) => {
    if (activeFilter === 'kolok') return e.faction === 'kolok';
    if (activeFilter === 'laksa') return e.faction === 'laksa';
    if (activeFilter === 'compromise') return e.faction === 'compromise';
    if (activeFilter === 'halal') return e.isHalalFriendly;
    if (activeFilter === 'fomoHot') return e.fomoIndex >= 88;
    if (activeFilter === 'weatherCraving') return (e.weatherCravingBoost || 0) > 0;
    return true;
  });

  const center = { x: 440, y: 500 };

  return (
    <div id="sine-mok-makan-radar" className="relative flex flex-col overflow-hidden rounded-[32px] border-4 border-[#2D2424] bg-white p-4 text-[#2D2424] shadow-brutal-lg sm:p-6">
      {/* Background Dot Matrix Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-5 bg-[radial-gradient(#2D2424_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#2D2424]/20 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-black text-[#2D2424] sm:text-2xl">
              FOOD RADAR
            </h3>
          </div>
          <p className="mt-1 text-xs font-bold text-[#2D2424]/70">
            Real-time proximity matrix tracking optimal culinary coordinates within range.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="trigger-radar-ping-btn"
            onClick={triggerRadarPulse}
            className="flex items-center gap-2 rounded-2xl border-2 border-[#2D2424] bg-[#FFB300] px-4 py-2 text-xs font-black text-[#2D2424] transition-all hover:bg-[#FFA000] active:scale-95 shadow-brutal-sm font-mono"
          >
            <span>INITIALIZE PING</span>
          </button>
        </div>
      </div>

      {/* Filter and Radius Controls */}
      <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-black text-[11px] text-[#2D2424] uppercase tracking-wider font-mono">
            FILTER:
          </span>
          <button
            onClick={() => {
              soundFx.playTick(500);
              setActiveFilter('all');
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all border-2 border-[#2D2424] font-mono ${
              activeFilter === 'all'
                ? 'bg-[#2D2424] text-white shadow-brutal-sm'
                : 'bg-white text-[#2D2424] hover:bg-stone-100'
            }`}
          >
            ALL ({activeEateries.length})
          </button>
          <button
            onClick={() => {
              soundFx.playTick(550);
              setActiveFilter('kolok');
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all border-2 border-[#2D2424] font-mono ${
              activeFilter === 'kolok'
                ? 'bg-[#FFB300] text-[#2D2424] shadow-brutal-sm'
                : 'bg-white text-[#2D2424] hover:bg-amber-50'
            }`}
          >
            KOLOK
          </button>
          <button
            onClick={() => {
              soundFx.playTick(600);
              setActiveFilter('laksa');
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all border-2 border-[#2D2424] font-mono ${
              activeFilter === 'laksa'
                ? 'bg-[#E53935] text-white shadow-brutal-sm'
                : 'bg-white text-[#2D2424] hover:bg-red-50'
            }`}
          >
            LAKSA
          </button>
          <button
            onClick={() => {
              soundFx.playTick(650);
              setActiveFilter('compromise');
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all border-2 border-[#2D2424] font-mono ${
              activeFilter === 'compromise'
                ? 'bg-emerald-500 text-white shadow-brutal-sm'
                : 'bg-white text-[#2D2424] hover:bg-emerald-50'
            }`}
          >
            NEUTRAL
          </button>
          <button
            onClick={() => {
              soundFx.playTick(700);
              setActiveFilter('halal');
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all border-2 border-[#2D2424] font-mono ${
              activeFilter === 'halal'
                ? 'bg-teal-500 text-white shadow-brutal-sm'
                : 'bg-white text-[#2D2424] hover:bg-teal-50'
            }`}
          >
            HALAL
          </button>
          <button
            onClick={() => {
              soundFx.playTick(750);
              setActiveFilter('fomoHot');
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all border-2 border-[#2D2424] font-mono ${
              activeFilter === 'fomoHot'
                ? 'bg-[#E53935] text-white shadow-brutal-sm'
                : 'bg-white text-[#2D2424] hover:bg-red-50'
            }`}
          >
            PEAK SURGE
          </button>

          <button
            id="radar-filter-weather-craving"
            onClick={() => {
              soundFx.playTick(800);
              setActiveFilter(activeFilter === 'weatherCraving' ? 'all' : 'weatherCraving');
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all border-2 border-[#2D2424] font-mono ${
              activeFilter === 'weatherCraving'
                ? 'bg-[#FFB300] text-[#2D2424] shadow-brutal-sm'
                : 'bg-white text-[#2D2424] hover:bg-amber-100'
            }`}
          >
            {weather?.condition === 'rainy' ? 'RAIN SURGE' : 'SUN PEAK'}
          </button>
        </div>

        {/* Range slider */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-2xl border-2 border-[#2D2424] shadow-brutal-sm">
          <span className="text-[11px] text-[#2D2424] font-black uppercase tracking-wider font-mono">RADIUS:</span>
          <input
            type="range"
            min="1.0"
            max="6.0"
            step="0.5"
            value={radiusKm}
            onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
            className="h-2 w-20 cursor-pointer accent-[#E53935]"
          />
          <span className="font-mono text-xs font-black text-[#E53935]">{radiusKm.toFixed(1)} KM</span>
        </div>
      </div>

      {/* Main Radar Screen + Quick Panel Grid */}
      <div className="relative z-10 mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12 items-center">
        
        {/* Real Tactical Radar Scope (7 cols on lg) */}
        <div className="relative mx-auto flex h-[340px] w-[340px] sm:h-[400px] sm:w-[400px] items-center justify-center rounded-full border-4 border-[#2D2424] bg-stone-950 p-2 shadow-brutal-lg lg:col-span-7 overflow-hidden">
          
          {/* Radar background grid rings */}
          <div className="absolute inset-4 rounded-full border border-emerald-500/30" />
          <div className="absolute inset-16 rounded-full border border-emerald-500/20" />
          <div className="absolute inset-28 rounded-full border border-emerald-500/20" />
          <div className="absolute inset-40 rounded-full border border-emerald-500/10" />

          {/* Tactical Crosshairs */}
          <div className="absolute h-full w-[1px] bg-emerald-500/30" />
          <div className="absolute w-full h-[1px] bg-emerald-500/30" />
          <div className="absolute h-full w-[1px] rotate-45 bg-emerald-500/15" />
          <div className="absolute h-full w-[1px] -rotate-45 bg-emerald-500/15" />

          {/* Bearing Labels */}
          <span className="absolute top-3 font-mono text-[9px] font-black tracking-widest text-emerald-400/70">N</span>
          <span className="absolute bottom-3 font-mono text-[9px] font-black tracking-widest text-emerald-400/70">S</span>
          <span className="absolute left-3 font-mono text-[9px] font-black tracking-widest text-emerald-400/70">W</span>
          <span className="absolute right-3 font-mono text-[9px] font-black tracking-widest text-emerald-400/70">E</span>

          {/* Smooth Sweeping Beam Effect */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              transform: `rotate(${sweepAngle}deg)`,
              background: `conic-gradient(from 0deg at 50% 50%, rgba(16, 185, 129, 0.45) 0deg, rgba(16, 185, 129, 0.05) 50deg, transparent 90deg)`,
            }}
          />

          {/* Center Target / User Position Marker */}
          <div className="relative z-20 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] ring-4 ring-emerald-900/60" />

          {/* Render Eatery Blips */}
          {filteredEateries.map((eatery) => {
            const dx = (eatery.coordinates.x - center.x) * 0.55;
            const dy = (eatery.coordinates.y - center.y) * 0.55;

            const distApprox = Math.sqrt(dx * dx + dy * dy);
            if (distApprox > 160) return null;

            const isSelected = selectedEatery?.id === eatery.id;

            const blipColor =
              eatery.faction === 'kolok'
                ? 'bg-[#FFB300] shadow-[0_0_10px_rgba(255,179,0,0.9)]'
                : eatery.faction === 'laksa'
                ? 'bg-[#E53935] shadow-[0_0_10px_rgba(229,57,53,0.9)]'
                : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]';

            return (
              <button
                key={eatery.id}
                id={`radar-blip-${eatery.id}`}
                onClick={() => {
                  soundFx.playTick(600);
                  onSelectEatery(eatery);
                }}
                className={`group absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-150 active:scale-95 ${
                  isSelected ? 'scale-150 z-40' : ''
                }`}
                style={{
                  left: `calc(50% + ${dx}px)`,
                  top: `calc(50% + ${dy}px)`,
                }}
                title={`${eatery.name}`}
              >
                <div
                  className={`h-3.5 w-3.5 rounded-full border border-white transition-all ${blipColor} ${
                    isSelected ? 'ring-2 ring-white scale-125' : ''
                  }`}
                />

                {/* Tactical Label Overlay on Select / Hot */}
                {(isSelected || eatery.fomoIndex >= 95) && (
                  <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-stone-900 px-2 py-0.5 text-[9px] font-mono font-black text-emerald-400 border border-emerald-500/40 shadow-md">
                    {eatery.name.slice(0, 12)} [{eatery.fomoIndex}%]
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Eatery Tactical Intelligence Panel (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-[28px] border-4 border-[#2D2424] bg-white p-4 shadow-brutal sm:p-5">
          {selectedEatery ? (
            <div className="space-y-3.5">
              
              {/* Header Info */}
              <div className="flex items-start justify-between gap-2 border-b-2 border-[#2D2424]/10 pb-3">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider border-2 border-[#2D2424] ${
                        selectedEatery.faction === 'kolok'
                          ? 'bg-[#FFB300] text-[#2D2424]'
                          : selectedEatery.faction === 'laksa'
                          ? 'bg-[#E53935] text-white'
                          : 'bg-emerald-400 text-[#2D2424]'
                      }`}
                    >
                      {selectedEatery.faction.toUpperCase()} ZONE
                    </span>
                    {selectedEatery.isHalalFriendly && (
                      <span className="rounded-md bg-teal-100 text-teal-900 border-2 border-[#2D2424] px-2 py-0.5 text-[9px] font-mono font-black">
                        HALAL
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1.5 text-lg font-black text-[#2D2424] sm:text-xl font-mono">
                    {selectedEatery.name}
                  </h3>
                  <p className="text-xs font-bold text-[#2D2424]/70 font-mono">
                    SECTOR: {selectedEatery.area.toUpperCase()}
                  </p>
                </div>

                {/* FOMO Index Readout */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 rounded-xl bg-[#E53935] px-3 py-1 text-white border-2 border-[#2D2424] shadow-brutal-sm">
                    <span className="font-mono text-sm font-black">
                      {selectedEatery.fomoIndex}%
                    </span>
                  </div>
                  <span className="text-[8px] uppercase font-mono font-black tracking-widest text-[#2D2424]/60 mt-1">
                    SURGE INDEX
                  </span>
                </div>
              </div>

              {/* Target Data Breakdown */}
              <div className="rounded-2xl border-2 border-[#2D2424] bg-[#FFF8E1] p-3 space-y-2 font-mono text-xs">
                <div>
                  <span className="text-[#2D2424]/60 uppercase">TARGET DISH:</span>{' '}
                  <span className="text-[#2D2424] font-bold">{selectedEatery.specialtyDish}</span>
                </div>

                {selectedEatery.weatherNotice && (
                  <div className="text-amber-900 bg-amber-100 border border-amber-800/40 px-2.5 py-1 rounded-lg font-bold">
                    {selectedEatery.weatherNotice}
                  </div>
                )}

                {selectedEatery.stockNote && (
                  <div className="text-white bg-[#2D2424] px-2.5 py-1 rounded-lg border border-[#2D2424]">
                    {selectedEatery.stockNote}
                  </div>
                )}

                <div className="flex items-center justify-between text-[#2D2424] pt-2 border-t border-[#2D2424]/20">
                  <span>EST. QUEUE DELAY:</span>
                  <span className="font-black text-[#E53935]">~{selectedEatery.queueWaitMin} MINS</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {selectedEatery.viralTags.map((tag) => (
                  <span key={tag} className="rounded-md bg-white border-2 border-[#2D2424] px-2 py-0.5 text-[9px] font-mono font-bold text-[#2D2424]">
                    #{tag}
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
                  className="flex-1 rounded-2xl bg-[#FFB300] hover:bg-[#FFA000] px-4 py-3 text-xs font-black text-[#2D2424] border-2 border-[#2D2424] shadow-brutal-sm transition-all active:scale-95 flex items-center justify-center font-mono tracking-wider"
                >
                  LOCK SQUAD DESTINATION
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF8E1] border-2 border-[#2D2424] text-[#E53935] font-mono font-black text-xs shadow-brutal-sm">
                SYS
              </div>
              <div>
                <h4 className="font-black text-sm text-[#2D2424] font-mono tracking-wider">
                  NO SECTOR SELECTED
                </h4>
                <p className="text-xs font-bold text-[#2D2424]/70 max-w-xs mt-1">
                  Click any glowing coordinate blip on the radar scope to analyze live telemetry.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};