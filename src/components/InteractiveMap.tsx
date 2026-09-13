import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Flame, CloudRain, Sun } from 'lucide-react';
import { Eatery, WeatherData } from '../types';
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

// Helper component to handle programmatic map view updates when selectedEatery changes
const MapViewController: React.FC<{ selectedEatery: Eatery | null }> = ({ selectedEatery }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedEatery && selectedEatery.coordinates) {
      map.setView([1.5533, 110.3592], 14, { animate: true });
    }
  }, [selectedEatery, map]);
  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  eateries,
  selectedEatery,
  onSelectEatery,
  userFaction,
  weather,
}) => {
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Kuching Center Coordinates
  const KUCHING_CENTER: [number, number] = [1.5533, 110.3592];

  // Custom marker factory based on faction
  const createCustomIcon = (faction: string, isSelected: boolean) => {
    const bg = faction === 'kolok' ? '#f59e0b' : faction === 'laksa' ? '#ef4444' : '#10b981';
    const emoji = faction === 'kolok' ? '🥢' : faction === 'laksa' ? '🍤' : '🤝';

    return L.divIcon({
      className: 'custom-brutal-marker',
      html: `
        <div style="
          background-color: ${bg};
          border: 2px solid #ffffff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.4);
          transform: ${isSelected ? 'scale(1.25)' : 'scale(1)'};
          transition: transform 0.2s;
        ">
          ${emoji}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <div id="kuching-live-map-card" className="relative flex flex-col overflow-hidden rounded-[32px] border-4 border-[#2D2424] bg-stone-900 text-stone-100 shadow-brutal-lg">
      {/* Top Map Controls */}
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
        </div>
      </div>

      {/* Leaflet Map Container Area */}
      <div className="relative h-[380px] sm:h-[460px] w-full overflow-hidden bg-[#151922]">
        {/* Style block to nicely invert standard OSM tiles into a dark mode map theme */}
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
          
          {/* OpenStreetMap Free Tile Layer with Dark Mode Filter */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="dark-osm-tiles"
          />

          {/* Render Eatery Markers */}
          {eateries.map((eatery) => {
            const isSelected = selectedEatery?.id === eatery.id;
            
            const lat = eatery.coordinates.lat || KUCHING_CENTER[0] + (eatery.coordinates.y - 400) * 0.0001;
            const lng = eatery.coordinates.lng || KUCHING_CENTER[1] + (eatery.coordinates.x - 500) * 0.0001;

            return (
              <Marker
                key={eatery.id}
                position={[lat, lng]}
                icon={createCustomIcon(eatery.faction, isSelected)}
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
                    <span className="text-xs font-bold text-stone-600">FOMO Index: {eatery.fomoIndex}%</span>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Map Legend */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] flex flex-wrap items-center gap-2 rounded-xl bg-[#2D2424] px-3.5 py-2 border-2 border-white/20 text-[10px] font-black text-white shadow-brutal-sm">
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