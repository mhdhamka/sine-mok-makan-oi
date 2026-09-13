import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Eatery, WeatherData } from '../types';
import { INITIAL_EATERIES } from '../data/kuchingEateries';
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
    const bg = faction === 'kolok' ? '#FFB300' : faction === 'laksa' ? '#E53935' : '#10B981';
    const label = faction === 'kolok' ? 'K' : faction === 'laksa' ? 'L' : 'C';

    const fomo = eatery.fomoIndex || 50;
    const size = heatmapActive ? Math.max(28, Math.min(44, 28 + (fomo / 100) * 16)) : 30;
    const ringEffect = heatmapActive && fomo > 75 ? 'box-shadow: 0 0 12px 4px rgba(229, 57, 53, 0.8), 0 4px 6px rgba(0,0,0,0.4);' : 'box-shadow: 0 4px 6px rgba(0,0,0,0.4);';

    return L.divIcon({
      className: 'custom-brutal-marker',
      html: `
        <div style="
          background-color: ${bg};
          border: 2px solid #2D2424;
          width: ${size}px;
          height: ${size}px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${heatmapActive ? '14px' : '11px'};
          font-weight: 900;
          color: ${faction === 'kolok' ? '#2D2424' : '#ffffff'};
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
    <div id="kuching-live-map-card" className="relative flex flex-col overflow-hidden rounded-[32px] border-4 border-[#2D2424] bg-white text-[#2D2424] shadow-brutal-lg">
      
      {/* Header */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#2D2424]/20 bg-white px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-[#2D2424] sm:text-2xl">
                KUCHING LIVE MAP
              </h3>
            </div>
            <p className="mt-1 text-xs font-bold text-[#2D2424]/70">
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
            className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-black transition-all border-2 border-[#2D2424] shadow-brutal-sm ${
              showHeatmap
                ? 'bg-[#E53935] text-white'
                : 'bg-stone-100 text-[#2D2424] hover:bg-stone-200'
            }`}
          >
            <span>CROWD HEATMAP: {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 border-b-2 border-[#2D2424]/20 bg-[#FFF8E1] px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Search eatery name, area, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-[#2D2424] border-2 border-[#2D2424] focus:outline-none shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#2D2424]/60 hover:text-[#2D2424]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs font-mono font-black text-[#2D2424]/85">
            Showing {filteredEateries.length} of {activeEateries.length} spots
          </div>
        </div>

        {/* Scrollable Area Filters */}
        <div className="relative flex items-center gap-1.5">
          <button
            onClick={() => scrollFilters('left')}
            className="flex-shrink-0 rounded-xl bg-white px-2.5 py-1.5 text-xs font-black text-[#2D2424] border-2 border-[#2D2424] hover:bg-stone-100 transition-all shadow-brutal-sm"
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
                  className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-[11px] font-black transition-all border-2 border-[#2D2424] ${
                    isActive
                      ? 'bg-[#FFB300] text-[#2D2424] shadow-brutal-sm'
                      : 'bg-white text-[#2D2424] hover:bg-amber-50'
                  }`}
                >
                  {area}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollFilters('right')}
            className="flex-shrink-0 rounded-xl bg-white px-2.5 py-1.5 text-xs font-black text-[#2D2424] border-2 border-[#2D2424] hover:bg-stone-100 transition-all shadow-brutal-sm"
            title="Scroll Right"
          >
            ›
          </button>
        </div>
      </div>

      {/* Map Display Container */}
      <div className="relative h-[380px] sm:h-[460px] w-full overflow-hidden bg-stone-100">
        <MapContainer
          center={KUCHING_CENTER}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#F5F5F4' }}
        >
          <MapViewController selectedEatery={selectedEatery} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                  <div className="text-[#2D2424] font-mono p-1">
                    <strong className="block text-sm font-black">{eatery.name}</strong>
                    <span className="text-xs font-bold text-[#2D2424]/70">Area: {eatery.area}</span>
                    <span className="block text-xs font-bold text-[#2D2424]/70">FOMO Index: {eatery.fomoIndex}%</span>
                    {showHeatmap && <span className="block text-[10px] font-black text-[#E53935] mt-0.5">HEATMAP SURGE ACTIVE</span>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] flex flex-wrap items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 border-2 border-[#2D2424] text-[10px] font-mono font-black text-[#2D2424] shadow-brutal-sm">
          {weather && (
            <div className={`flex items-center gap-1 rounded-xl px-2 py-1 border-2 border-[#2D2424] ${
              weather.condition === 'rainy' ? 'bg-[#E53935] text-white' : 'bg-[#FFB300] text-[#2D2424]'
            }`}>
              <span>{weather.condition === 'rainy' ? 'RAIN SURGE ACTIVE' : 'SUN PEAK ACTIVE'}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-[#FFB300] border-2 border-[#2D2424]" />
            <span>TEAM KOLOK</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-[#E53935] border-2 border-[#2D2424]" />
            <span>TEAM LAKSA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-[#10B981] border-2 border-[#2D2424]" />
            <span>SANCTUARY</span>
          </div>
          <div className="flex items-center gap-1 text-[#2D2424]/60">
            <span>[HEATMAP: {showHeatmap ? 'ACTIVE' : 'MUTED'}]</span>
          </div>
        </div>
      </div>
    </div>
  );
};