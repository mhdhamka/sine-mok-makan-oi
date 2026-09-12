import React, { useState } from 'react';
import { Layers, Flame, MapPin, ZoomIn, ZoomOut, RotateCcw, Sparkles, CloudRain, Sun } from 'lucide-react';
import { Eatery, WeatherData } from '../types';
import { soundFx } from '../utils/audio';

interface KuchingInteractiveMapProps {
  eateries: Eatery[];
  selectedEatery: Eatery | null;
  onSelectEatery: (eatery: Eatery) => void;
  userFaction: 'kolok' | 'laksa';
  weather?: WeatherData;
}

export const KuchingInteractiveMap: React.FC<KuchingInteractiveMapProps> = ({
  eateries,
  selectedEatery,
  onSelectEatery,
  userFaction,
  weather,
}) => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null);

  const districts = [
    { name: 'Carpenter St / Waterfront', x: 380, y: 460 },
    { name: 'Ban Hock / Padungan', x: 500, y: 510 },
    { name: 'Matang Jaya', x: 230, y: 320 },
    { name: 'Satok / Kubah Ria', x: 300, y: 430 },
    { name: 'Hui Sing Garden', x: 420, y: 720 },
    { name: 'Tabuan Jaya', x: 620, y: 650 },
    { name: 'Pending Ports', x: 710, y: 510 },
  ];

  return (
    <div id="kuching-live-map-card" className="relative flex flex-col overflow-hidden rounded-[32px] border-4 border-[#2D2424] bg-stone-900 text-stone-100 shadow-brutal-lg">
      {/* Top Map Controls */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#2D2424] bg-[#2D2424] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-emerald-400 border border-white/20 text-base">
            🗺️
          </span>
          <div>
            <h3 className="text-sm font-black text-white sm:text-base">
              KUCHING FOODIE CARTOGRAPHY &amp; LIVE HEATMAP
            </h3>
            <p className="text-[11px] font-bold text-white/70">
              Sarawak River basin mapping: live queue densities and faction dominance zones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Heatmap Toggle */}
          <button
            id="toggle-heatmap-btn"
            onClick={() => {
              soundFx.playTick(500);
              setShowHeatmap(!showHeatmap);
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black transition-all border-2 ${
              showHeatmap
                ? 'bg-[#E53935] text-white border-white shadow-xs'
                : 'bg-stone-800 text-stone-300 border-transparent hover:bg-stone-700'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>CROWD HEATMAP: {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center rounded-xl bg-stone-800 p-0.5 border border-stone-700">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 text-stone-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
              className="p-1.5 text-stone-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-stone-300 hover:text-white"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map Area */}
      <div className="relative h-[380px] sm:h-[460px] w-full overflow-hidden bg-[#151922]">
        <svg
          viewBox="0 0 1000 850"
          className="h-full w-full select-none transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <defs>
            {/* Water gradient */}
            <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.85" />
            </linearGradient>

            {/* Heatmap blur filter */}
            <filter id="heatBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
            </filter>

            {/* Heat glow gradients */}
            <radialGradient id="hotGlowKolok">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#d97706" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hotGlowLaksa">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#dc2626" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hotGlowCompromise">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#059669" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid lines */}
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1f2937" strokeWidth="0.5" />
          </pattern>
          <rect width="1000" height="850" fill="url(#grid)" />

          {/* District boundary outlines / background geography */}
          <path
            d="M 50 150 Q 300 120 550 160 T 950 200 L 950 800 Q 550 820 50 780 Z"
            fill="#1e2430"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Major Road Arteries (Jalan Tun Abang Haji Openg, Jalan Ban Hock, Jalan Padungan, Rock Road) */}
          <path d="M 120 400 Q 350 430 500 480 T 880 520" fill="none" stroke="#374151" strokeWidth="5" />
          <path d="M 400 200 Q 420 450 440 750" fill="none" stroke="#374151" strokeWidth="4" />
          <path d="M 280 430 Q 380 580 450 780" fill="none" stroke="#374151" strokeWidth="3" />
          <path d="M 500 480 Q 640 580 750 720" fill="none" stroke="#374151" strokeWidth="3" />

          {/* Sarawak River (Sungai Sarawak) - The soul of Kuching! */}
          <path
            d="M 20 380 Q 180 440 280 410 T 390 430 T 490 450 T 620 420 T 780 480 T 980 460"
            fill="none"
            stroke="url(#riverGradient)"
            strokeWidth="38"
            strokeLinecap="round"
          />
          <path
            d="M 20 380 Q 180 440 280 410 T 390 430 T 490 450 T 620 420 T 780 480 T 980 460"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="3"
            strokeDasharray="8 12"
            opacity="0.4"
          />
          <text x="640" y="415" fill="#93c5fd" fontSize="11" fontWeight="bold" opacity="0.75" letterSpacing="2">
            SUNGAI SARAWAK (SARAWAK RIVER)
          </text>

          {/* Bridge landmarks */}
          {/* Satok Suspension Bridge */}
          <line x1="290" y1="395" x2="310" y2="435" stroke="#f59e0b" strokeWidth="3" />
          <text x="270" y="385" fill="#cbd5e1" fontSize="9" opacity="0.6">Satok Bridge</text>

          {/* Darul Hana Bridge (Waterfront) */}
          <path d="M 400 420 Q 420 440 440 435" fill="none" stroke="#ef4444" strokeWidth="3" />
          <text x="390" y="410" fill="#cbd5e1" fontSize="9" opacity="0.6">Darul Hana S-Bridge</text>

          {/* Heatmap blobs when enabled */}
          {showHeatmap && (
            <g id="heatmap-layer" filter="url(#heatBlur)">
              {eateries.map((eatery) => {
                const glowSize = eatery.fomoIndex * 1.5;
                const glowColor =
                  eatery.faction === 'kolok'
                    ? 'url(#hotGlowKolok)'
                    : eatery.faction === 'laksa'
                    ? 'url(#hotGlowLaksa)'
                    : 'url(#hotGlowCompromise)';

                return (
                  <circle
                    key={`heat-${eatery.id}`}
                    cx={eatery.coordinates.x}
                    cy={eatery.coordinates.y}
                    r={glowSize}
                    fill={glowColor}
                  />
                );
              })}
            </g>
          )}

          {/* District Labels */}
          {districts.map((d) => (
            <g key={d.name} transform={`translate(${d.x}, ${d.y})`} opacity="0.5">
              <circle cx="0" cy="0" r="3" fill="#64748b" />
              <text x="6" y="3" fill="#94a3b8" fontSize="10" fontFamily="sans-serif" fontWeight="semibold">
                {d.name}
              </text>
            </g>
          ))}

          {/* Eatery Pins */}
          {eateries.map((eatery) => {
            const isSelected = selectedEatery?.id === eatery.id;
            const markerBg =
              eatery.faction === 'kolok' ? '#f59e0b' : eatery.faction === 'laksa' ? '#ef4444' : '#10b981';

            return (
              <g
                key={eatery.id}
                id={`map-pin-${eatery.id}`}
                transform={`translate(${eatery.coordinates.x}, ${eatery.coordinates.y})`}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => {
                  soundFx.playTick(600);
                  onSelectEatery(eatery);
                }}
              >
                {/* Pin Pulse Ring if selected or peak FOMO */}
                {(isSelected || eatery.fomoIndex >= 95) && (
                  <circle cx="0" cy="-14" r="22" fill="none" stroke={markerBg} strokeWidth="2" opacity="0.8">
                    <animate attributeName="r" values="16;28;16" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Base shadow */}
                <ellipse cx="0" cy="0" rx="8" ry="4" fill="#000000" opacity="0.5" />

                {/* Pin teardrop / badge */}
                <path
                  d="M 0 0 C -12 -12 -16 -24 0 -34 C 16 -24 12 -12 0 0 Z"
                  fill={markerBg}
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="drop-shadow(0 2px 5px rgba(0,0,0,0.5))"
                />

                {/* Icon inside pin */}
                <text x="0" y="-18" textAnchor="middle" dominantBaseline="central" fontSize="12">
                  {eatery.faction === 'kolok' ? '🥢' : eatery.faction === 'laksa' ? '🍤' : '🤝'}
                </text>

                {/* Pin Title on hover or selection */}
                {(isSelected || eatery.fomoIndex >= 92) && (
                  <g transform="translate(0, -42)">
                    <rect
                      x="-60"
                      y="-16"
                      width="120"
                      height="20"
                      rx="6"
                      fill="#0f172a"
                      stroke="#475569"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="-3"
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {eatery.name.length > 15 ? eatery.name.slice(0, 13) + '..' : eatery.name} ({eatery.fomoIndex}%)
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Map Legend */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-2 rounded-xl bg-[#2D2424] px-3.5 py-2 border-2 border-white/20 text-[10px] font-black text-white shadow-brutal-sm">
          {weather && (
            <div className={`flex items-center gap-1 rounded-lg px-2 py-0.5 border border-white/20 ${
              weather.condition === 'rainy' ? 'bg-[#E53935] text-white' : 'bg-[#FFB300] text-[#2D2424]'
            }`}>
              {weather.condition === 'rainy' ? <CloudRain className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
              <span>{weather.condition === 'rainy' ? 'Rain Craving Surge Active' : 'Sun Craving Peak Active'}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FFB300] border border-[#2D2424]" />
            <span>Team Kolok</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E53935] border border-[#2D2424]" />
            <span>Team Laksa</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 border border-[#2D2424]" />
            <span>Compromise Sanctuary</span>
          </div>
          <div className="flex items-center gap-1 text-white/60">
            <span>• Tap pin to inspect</span>
          </div>
        </div>
      </div>
    </div>
  );
};
