import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Eatery, WeatherData } from '../types';
import { INITIAL_EATERIES } from '../data/kuchingEateries'; // Import full list as fallback
import { soundFx } from '../utils/audio';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface InteractiveMapProps {
  eateries: Eatery[];
  selectedEatery: Eatery | null;
  onSelectEatery: (eatery: Eatery) => void;
  userFaction: 'kolok' | 'laksa';
  weather?: WeatherData;
}

const MapViewController: React.FC<{ selectedEatery: Eatery | null }> = ({ selectedEatery }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedEatery && selectedEatery.coordinates) {
      const lat = selectedEatery.coordinates.lat || 1.5533;
      const lng = selectedEatery.coordinates.lng || 110.3592;
      map.setView([lat, lng], 15, { animate: true });
    }
  }, [selectedEatery, map]);
  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  eateries = [],
  selectedEatery,
  onSelectEatery,
  userFaction,
  weather,
}) => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollFilters = (direction: 'left' | 'right') => {
    soundFx.playTick(300);
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const KUCHING_CENTER: [number, number] = [1.5533, 110.3592];

  // FORCE use the full list if the passed prop is truncated or empty
  const activeEateries = eateries.length >= 15 ? eateries : INITIAL_EATERIES;

  // Dynamically extract unique areas from the complete active list
  const areas = ['ALL', ...Array.from(new Set(activeEateries.map((e) => e.area)))];

  // Filter eateries based on search query and area filter
  const filteredEateries = activeEateries.filter((eatery) => {
    const matchesSearch =
      eatery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eatery.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eatery.specialtyDish.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesArea =
      selectedArea === 'ALL' ||
      eatery.area.toLowerCase() === selectedArea.toLowerCase();

    return matchesSearch && matchesArea;
  });

  const createCustomIcon = (eatery: Eatery, isSelected: boolean, heatmapActive: boolean) => {
    const faction = eatery.faction;
    const bg = faction === 'kolok' ? '#f59e0b' : faction === 'laksa' ? '#ef4444' : '#10b981';
    const label = faction === 'kolok' ? 'K' : faction === 'laksa' ? 'L' : 'C';

    const fomo = eatery.fomoIndex || 50;
    const size = heatmapActive ? Math.max(28, Math.min(44, 28 + (fomo / 100) * 16)) : 30;
    const ringEffect = heatmapActive && fomo > 75 ? 'box-shadow: 0 0 12px 4px rgba(239, 68, 68, 0.8), 0 4px 6px rgba(0,0,0,0.4);' : 'box-shadow: 0 4px 6px rgba(0,0,0,0.4);';

    return L.divIcon({
      className: 'custom-brutal-marker',
      html: `
        <div style="
          background-color: ${bg};
          border: ${heatmapActive ? '3px solid #ffffff' : '2px solid #555555'};
          width: ${size}px;
          height: ${size}px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${heatmapActive ? '14px' : '11px'};
          font-weight: 900;
          color: #ffffff;
          ${ringEffect}
          transform: ${isSelected ? 'scale(1.3)' : 'scale(1)'};
          transition: all 0.2s ease-in-out;
          opacity: ${heatmapActive ? '1.0' : '0.65'};
        ">
          ${label}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <div id="kuching-live-map-card" className="relative flex flex-col overflow-hidden rounded-[32px] border-4 border-[#2D2424] bg-stone-900 text-stone-100 shadow-brutal-lg">
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#2D2424] bg-[#2D2424] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <div>
            <h3 className="text-sm font-black text-white sm:text-base">
              KUCHING FOODIE CARTOGRAPHY &amp; LIVE HEATMAP (LEAFLET)
            </h3>
            <p className="text-[11px] font-bold text-white/70">
              Interactive OpenStreetMap integration: live queue densities and faction dominance zones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            <span>CROWD HEATMAP: {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-b-2 border-[#2D2424] bg-stone-800 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Search eatery name, area, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-bold text-white border-2 border-stone-700 focus:border-[#FFB300] focus:outline-none shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-stone-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs font-black text-stone-400">
            Showing {filteredEateries.length} of {activeEateries.length} spots
          </div>
        </div>

        <div className="relative flex items-center gap-1.5">
          <button
            onClick={() => scrollFilters('left')}
            className="flex-shrink-0 rounded-lg bg-stone-900 px-2 py-1 text-xs font-black text-stone-300 border border-stone-700 hover:bg-stone-700 hover:text-white transition-all shadow-xs"
            title="Scroll Left"
          >
            ‹
          </button>

          <div
            ref={scrollContainerRef}
            className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth flex-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {areas.map((area) => {
              const isActive = selectedArea === area;
              return (
                <button
                  key={area}
                  onClick={() => {
                    soundFx.playTick(400);
                    setSelectedArea(area);
                  }}
                  className={`whitespace-nowrap rounded-lg px-3 py-1 text-[11px] font-black transition-all border ${
                    isActive
                      ? 'bg-[#FFB300] text-[#2D2424] border-white shadow-2xs'
                      : 'bg-stone-900 text-stone-300 border-stone-700 hover:bg-stone-700'
                  }`}
                >
                  {area}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollFilters('right')}
            className="flex-shrink-0 rounded-lg bg-stone-900 px-2 py-1 text-xs font-black text-stone-300 border border-stone-700 hover:bg-stone-700 hover:text-white transition-all shadow-xs"
            title="Scroll Right"
          >
            ›
          </button>
        </div>
      </div>

      <div className="relative h-[380px] sm:h-[460px] w-full overflow-hidden bg-[#151922]">
        <style>{`
          .dark-osm-tiles {
            filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3);
          }
        `}</style>

        <MapContainer
          center={KUCHING_CENTER}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#151922' }}
        >
          <MapViewController selectedEatery={selectedEatery} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="dark-osm-tiles"
          />

          {filteredEateries.map((eatery) => {
            const isSelected = selectedEatery?.id === eatery.id;
            
            const lat = eatery.coordinates.lat || KUCHING_CENTER[0] + (eatery.coordinates.y - 400) * 0.0001;
            const lng = eatery.coordinates.lng || KUCHING_CENTER[1] + (eatery.coordinates.x - 500) * 0.0001;

            return (
              <Marker
                key={eatery.id}
                position={[lat, lng]}
                icon={createCustomIcon(eatery, isSelected, showHeatmap)}
                eventHandlers={{
                  click: () => {
                    soundFx.playTick(600);
                    onSelectEatery(eatery);
                  },
                }}
              >
                <Popup>
                  <div className="text-stone-900 font-sans p-1">
                    <strong className="block text-sm font-black">{eatery.name}</strong>
                    <span className="text-xs font-bold text-stone-600">Area: {eatery.area}</span>
                    <span className="block text-xs font-bold text-stone-600">FOMO Index: {eatery.fomoIndex}%</span>
                    {showHeatmap && <span className="block text-[10px] font-black text-red-600 mt-0.5">HEATMAP SURGE ACTIVE</span>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] flex flex-wrap items-center gap-2 rounded-xl bg-[#2D2424] px-3.5 py-2 border-2 border-white/20 text-[10px] font-black text-white shadow-brutal-sm">
          {weather && (
            <div className={`flex items-center gap-1 rounded-lg px-2 py-0.5 border border-white/20 ${
              weather.condition === 'rainy' ? 'bg-[#E53935] text-white' : 'bg-[#FFB300] text-[#2D2424]'
            }`}>
              <span>{weather.condition === 'rainy' ? 'RAIN SURGE ACTIVE' : 'SUN PEAK ACTIVE'}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FFB300] border border-[#2D2424]" />
            <span>TEAM KOLOK</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E53935] border border-[#2D2424]" />
            <span>TEAM LAKSA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 border border-[#2D2424]" />
            <span>SANCTUARY</span>
          </div>
          <div className="flex items-center gap-1 text-white/60">
            <span>[HEATMAP: {showHeatmap ? 'ACTIVE' : 'MUTED'}]</span>
          </div>
        </div>
      </div>
    </div>
  );
};