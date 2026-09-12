import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { RotateCw, Sparkles, Trophy, Users, ShieldAlert, CheckCircle2, Award, CloudRain, Sun } from 'lucide-react';
import { Eatery, Faction, WeatherData } from '../types';
import { soundFx } from '../utils/audio';

interface BailoutWheelProps {
  eateries: Eatery[];
  onLockQuest: (eatery: Eatery) => void;
  userFaction: 'kolok' | 'laksa';
  weather?: WeatherData;
}

export const BailoutWheel: React.FC<BailoutWheelProps> = ({
  eateries,
  onLockQuest,
  userFaction,
  weather,
}) => {
  // Use a shortlist of 8 top representative eateries for a readable, clean wheel
  const wheelSpots = eateries.slice(0, 8);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Eatery | null>(null);
  const [compromiseMode, setCompromiseMode] = useState(false);
  const [squadKolokCount, setSquadKolokCount] = useState(2);
  const [squadLaksaCount, setSquadLaksaCount] = useState(2);

  const numSlices = wheelSpots.length;
  const sliceAngle = 360 / numSlices;

  // Spin the wheel with authentic deceleration physics
  const spinWheel = (targetOverrideIndex?: number) => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinner(null);

    // Play initial sound
    soundFx.playRadarPing();

    // If compromiseMode is activated, skew random landing towards compromise spots (like Lau Ya Keng)
    let targetIndex = targetOverrideIndex !== undefined ? targetOverrideIndex : Math.floor(Math.random() * numSlices);
    if (targetOverrideIndex === undefined && compromiseMode) {
      const compromiseIndices = wheelSpots
        .map((e, idx) => (e.faction === 'compromise' ? idx : -1))
        .filter((idx) => idx !== -1);
      if (compromiseIndices.length > 0) {
        targetIndex = compromiseIndices[Math.floor(Math.random() * compromiseIndices.length)];
      }
    }

    // Number of full rotations (5 to 8) + exact angle to land on target slice
    const extraRounds = 5 + Math.floor(Math.random() * 3);
    // Needle points at top (270 deg or 90 deg depending on canvas orientation).
    // Let's align so needle is at 0 deg (top). Target slice offset:
    const targetSliceCenter = targetIndex * sliceAngle + sliceAngle / 2;
    // We want the wheel rotation to end where top (0 deg) hits targetSliceCenter:
    const finalAngle = rotationAngle + extraRounds * 360 + (360 - (targetSliceCenter % 360));

    // Play tick sounds as it spins
    let ticks = 0;
    const tickInterval = setInterval(() => {
      soundFx.playTick(450 + Math.random() * 200);
      ticks++;
      if (ticks > 24) clearInterval(tickInterval);
    }, 120);

    setRotationAngle(finalAngle);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      const selected = wheelSpots[targetIndex];
      setWinner(selected);
      soundFx.playFanfare();

      // Confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ef4444', '#10b981', '#fbbf24'],
        });
      } catch {}
    }, 3800);
  };

  // Weather-skewed spin handler
  const spinWithWeatherCraving = () => {
    if (isSpinning) return;
    const targetFaction = weather?.condition === 'rainy' ? 'laksa' : 'kolok';
    const candidateIndices = wheelSpots
      .map((e, idx) => (e.faction === targetFaction ? idx : -1))
      .filter((idx) => idx !== -1);

    const targetIdx =
      candidateIndices.length > 0
        ? candidateIndices[Math.floor(Math.random() * candidateIndices.length)]
        : undefined;

    if (weather?.condition === 'rainy') {
      soundFx.playRainSound();
    } else {
      soundFx.playSunnySound();
    }
    spinWheel(targetIdx);
  };

  // Run Compromise Algorithm
  const runCompromiseAlgorithm = () => {
    setCompromiseMode(true);
    soundFx.playTick(650);

    // Find the best compromise spot
    const compromiseSpot =
      wheelSpots.find((e) => e.faction === 'compromise' && e.name.includes('Lau Ya Keng')) ||
      wheelSpots.find((e) => e.faction === 'compromise') ||
      wheelSpots[0];

    // Automatically trigger spin targeting compromise!
    spinWheel();
  };

  return (
    <div id="bailout-spin-wheel-card" className="relative overflow-hidden rounded-[32px] border-4 border-[#2D2424] bg-white p-4 shadow-brutal-lg sm:p-6">
      <div className="relative z-10 flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-[#2D2424]/20 pb-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2D2424] text-base text-white shadow-brutal-sm">
                🎡
              </span>
              <h3 className="text-xl font-black text-[#2D2424] sm:text-2xl">
                THE "BAILOUT" SPIN-THE-WHEEL
              </h3>
            </div>
            <p className="mt-1 text-xs font-bold text-[#2D2424]/70">
              Trapped in the 10-minute agonizing silence of <em>“Sine mok makan oi?”</em> Let fate decide and lock in a Squad Quest.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFB300] border-2 border-[#2D2424] px-3 py-1 text-xs font-black text-[#2D2424] shadow-2xs">
              <Users className="h-3.5 w-3.5" /> SQUAD VOTING ACTIVE
            </span>
          </div>
        </div>

        {/* Compromise Engine Sub-panel */}
        <div className="rounded-2xl border-2 border-[#2D2424] bg-[#FFF8E1] p-3.5 shadow-brutal-sm sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#FFB300]" />
                <span className="text-xs font-black uppercase tracking-wider text-[#2D2424]">
                  The "Compromise" Algorithm
                </span>
                <span className="rounded-full bg-[#E53935] px-2 py-0.5 text-[9px] font-black text-white">
                  PEACE TREATY
                </span>
              </div>
              <p className="text-xs font-bold text-[#2D2424]/70 max-w-md">
                Squad divided between Mee Kolok and Sarawak Laksa? Balance faction allegiances to pick a neutral spot serving BOTH at top tier.
              </p>
            </div>

            {/* Squad faction tally adjusters */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 shadow-brutal-sm border-2 border-[#2D2424] text-xs font-black">
                <span>🥢 Kolok:</span>
                <button
                  onClick={() => setSquadKolokCount((c) => Math.max(0, c - 1))}
                  className="h-5 w-5 rounded bg-stone-100 text-xs font-black hover:bg-stone-200 border border-[#2D2424]"
                >
                  -
                </button>
                <span className="font-mono font-black text-[#FFB300] text-sm">{squadKolokCount}</span>
                <button
                  onClick={() => setSquadKolokCount((c) => c + 1)}
                  className="h-5 w-5 rounded bg-stone-100 text-xs font-black hover:bg-stone-200 border border-[#2D2424]"
                >
                  +
                </button>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 shadow-brutal-sm border-2 border-[#2D2424] text-xs font-black">
                <span>🍤 Laksa:</span>
                <button
                  onClick={() => setSquadLaksaCount((c) => Math.max(0, c - 1))}
                  className="h-5 w-5 rounded bg-stone-100 text-xs font-black hover:bg-stone-200 border border-[#2D2424]"
                >
                  -
                </button>
                <span className="font-mono font-black text-[#E53935] text-sm">{squadLaksaCount}</span>
                <button
                  onClick={() => setSquadLaksaCount((c) => c + 1)}
                  className="h-5 w-5 rounded bg-stone-100 text-xs font-black hover:bg-stone-200 border border-[#2D2424]"
                >
                  +
                </button>
              </div>

              <button
                id="run-compromise-algo-btn"
                onClick={runCompromiseAlgorithm}
                disabled={isSpinning}
                className="flex items-center gap-2 rounded-xl bg-[#E53935] px-4 py-2 text-xs font-black text-white border-2 border-[#2D2424] shadow-brutal-sm hover:bg-[#D32F2F] active:scale-95 disabled:opacity-50"
              >
                <Award className="h-4 w-4" />
                <span>COMPROMISE LOCK-IN</span>
              </button>
            </div>
          </div>
        </div>

        {/* Wheel Display & Spin Needle Area */}
        <div className="flex flex-col items-center justify-center py-2 sm:py-4">
          <div className="relative flex h-[290px] w-[290px] sm:h-[350px] sm:w-[350px] items-center justify-center">
            {/* Top Indicator Needle */}
            <div className="absolute top-0 z-30 -translate-y-3 flex flex-col items-center">
              <div className="h-0 w-0 border-x-10 border-x-transparent border-t-[20px] border-t-[#2D2424] filter drop-shadow-md" />
              <div className="h-2 w-2 rounded-full bg-[#FFB300] -mt-1 border border-[#2D2424]" />
            </div>

            {/* The SVG Wheel */}
            <div
              className="h-full w-full rounded-full border-4 border-[#2D2424] shadow-brutal-lg transition-transform ease-out bg-[#2D2424]"
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                transitionDuration: isSpinning ? '3800ms' : '0ms',
              }}
            >
              <svg viewBox="0 0 400 400" className="h-full w-full">
                {wheelSpots.map((spot, idx) => {
                  const startAngle = idx * sliceAngle;
                  const endAngle = startAngle + sliceAngle;
                  const midAngle = startAngle + sliceAngle / 2;

                  // Polar to cartesian coordinates
                  const r = 200;
                  const x1 = 200 + r * Math.cos((Math.PI * (startAngle - 90)) / 180);
                  const y1 = 200 + r * Math.sin((Math.PI * (startAngle - 90)) / 180);
                  const x2 = 200 + r * Math.cos((Math.PI * (endAngle - 90)) / 180);
                  const y2 = 200 + r * Math.sin((Math.PI * (endAngle - 90)) / 180);

                  const pathData = `M 200 200 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

                  // Colors by faction
                  const fillColor =
                    spot.faction === 'kolok'
                      ? idx % 2 === 0
                        ? '#FFB300'
                        : '#FFA000'
                      : spot.faction === 'laksa'
                      ? idx % 2 === 0
                        ? '#E53935'
                        : '#D32F2F'
                      : '#10b981';

                  // Text position
                  const textR = 125;
                  const tx = 200 + textR * Math.cos((Math.PI * (midAngle - 90)) / 180);
                  const ty = 200 + textR * Math.sin((Math.PI * (midAngle - 90)) / 180);

                  return (
                    <g key={spot.id}>
                      <path d={pathData} fill={fillColor} stroke="#2D2424" strokeWidth="2.5" />
                      <g transform={`translate(${tx}, ${ty}) rotate(${midAngle})`}>
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={spot.faction === 'laksa' ? '#ffffff' : '#2D2424'}
                          fontSize="11"
                          fontWeight="900"
                          fontFamily="sans-serif"
                        >
                          {spot.name.length > 13 ? spot.name.slice(0, 11) + '..' : spot.name}
                        </text>
                        <text
                          y="13"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={spot.faction === 'laksa' ? '#ffcdd2' : '#2D2424'}
                          fontSize="8.5"
                          fontWeight="800"
                        >
                          {spot.faction === 'kolok' ? '🥢 Kolok' : spot.faction === 'laksa' ? '🍤 Laksa' : '🤝 Both'}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Central Hub Button */}
            <button
              id="spin-the-wheel-center-btn"
              onClick={spinWheel}
              disabled={isSpinning}
              className="group absolute z-20 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-4 border-[#2D2424] bg-[#FFB300] text-[#2D2424] shadow-brutal transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
            >
              <div className="flex flex-col items-center">
                <RotateCw
                  className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform ${isSpinning ? 'animate-spin' : 'group-hover:rotate-45'}`}
                />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#2D2424]">
                  {isSpinning ? 'SPINNING' : 'SPIN'}
                </span>
              </div>
            </button>
          </div>

          {/* Weather Craving Advisory Banner */}
          {weather && (
            <div className={`mt-4 rounded-2xl border-2 border-[#2D2424] p-3 text-center text-xs font-black shadow-2xs ${
              weather.condition === 'rainy'
                ? 'bg-[#E53935] text-white'
                : weather.condition === 'sunny'
                ? 'bg-[#FFB300] text-[#2D2424]'
                : 'bg-white text-[#2D2424]'
            }`}>
              <div className="flex items-center justify-center gap-1.5">
                {weather.condition === 'rainy' ? <CloudRain className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span>
                  WEATHER ADVISORY: {weather.condition === 'rainy'
                    ? 'Cold downpour detected! The Bailout Wheel awards +25% craving weight to warming Sarawak Laksa.'
                    : weather.condition === 'sunny'
                    ? '33°C heat detected! The Bailout Wheel favors springy dry Mee Kolok & icy beverages.'
                    : 'Overcast skies! The Wheel balances dry noodles and hot broth equally.'}
                </span>
              </div>
            </div>
          )}

          {/* Controls below wheel */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              id="spin-wheel-bailout-btn"
              onClick={() => spinWheel()}
              disabled={isSpinning}
              className="flex items-center gap-2 rounded-2xl bg-[#FFB300] hover:bg-[#FFA000] text-[#2D2424] border-2 border-[#2D2424] px-6 py-3 text-xs sm:text-sm font-black shadow-brutal transition-all active:scale-95 disabled:opacity-50"
            >
              <RotateCw className="h-4 w-4" />
              <span>🎡 STANDARD BAILOUT SPIN</span>
            </button>

            {weather && (
              <button
                id="spin-wheel-weather-craving-btn"
                onClick={spinWithWeatherCraving}
                disabled={isSpinning}
                className={`flex items-center gap-2 rounded-2xl border-2 border-[#2D2424] px-6 py-3 text-xs sm:text-sm font-black shadow-brutal transition-all active:scale-95 disabled:opacity-50 ${
                  weather.condition === 'rainy'
                    ? 'bg-[#E53935] text-white hover:bg-[#D32F2F]'
                    : 'bg-[#2D2424] text-[#FFB300] hover:bg-black'
                }`}
              >
                {weather.condition === 'rainy' ? (
                  <>
                    <CloudRain className="h-4 w-4" />
                    <span>🌧️ SPIN WITH RAIN CRAVING (LAKSA SKEW)</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>☀️ SPIN WITH SUN CRAVING (KOLOK SKEW)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Winner Announcement & Quest Lock */}
        {winner && (
          <div
            id="wheel-winner-announcement"
            className={`rounded-[28px] border-4 border-[#2D2424] p-4 shadow-brutal transition-all sm:p-5 ${
              winner.faction === 'kolok'
                ? 'bg-[#FFF8E1]'
                : winner.faction === 'laksa'
                ? 'bg-[#FFEBEE]'
                : 'bg-emerald-50'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-brutal-sm border-2 border-[#2D2424]">
                  {winner.faction === 'kolok' ? '🥢' : winner.faction === 'laksa' ? '🍤' : '🤝'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#2D2424]">
                      Destination Locked by Fate!
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-black text-[#2D2424] border border-[#2D2424]">
                      FOMO {winner.fomoIndex}%
                    </span>
                  </div>
                  <h4 className="text-base font-black text-[#2D2424] sm:text-lg">
                    {winner.name} ({winner.area})
                  </h4>
                  <p className="text-xs font-bold text-[#2D2424]/70">
                    <strong>Specialty:</strong> {winner.specialtyDish}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="lock-winner-quest-btn"
                  onClick={() => {
                    soundFx.playCheckinChime();
                    onLockQuest(winner);
                  }}
                  className="flex items-center gap-2 rounded-2xl bg-[#E53935] hover:bg-[#D32F2F] px-5 py-2.5 text-xs font-black text-white border-2 border-[#2D2424] shadow-brutal-sm transition-all active:scale-95"
                >
                  <Trophy className="h-4 w-4 text-[#FFB300]" />
                  <span>ACCEPT SQUAD QUEST &amp; CLAIM PERKS</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
