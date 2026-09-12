import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Flame, ZoomIn, ZoomOut, RotateCcw, CloudRain, Sun } from 'lucide-react';
import { Eatery, WeatherData } from '../types';
import { soundFx } from '../utils/audio';

// Import Leaflet CSS (crucial for proper marker rendering)
import 'leaflet/dist/leaflet.css';

interface KuchingInteractiveMapProps {
  eateries: Eatery[];
  selectedEatery: Eatery | null;
  onSelectEatery: (eatery: Eatery) => void;
  userFaction: 'kolok' | 'laksa';
  weather?: WeatherData;
}

// Component to handle programmatic map view updates
const MapViewController: { center: [number, number]; zoom: number } => {
  const map = useMap();
  useEffect(() => {
    map.setView([1.5533, 110.3592], map.getZoom()); // Kuching Center coordinates
  }, [map]);
  return null;
};

export const KuchingInteractiveMap: React.FC<KuchingInteractiveMapProps> = ({
  eateries,
  selectedEatery,
  onSelectEatery,
  userFaction,
  weather,
}) => {
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Custom HTML markers matching your brutalist design system
  const createCustomIcon = (eatery: Eatery) => {
    const isSelected = selectedEatery?.id === eatery.id;
    const bgCol =
      eatery.faction === 'kolok'
        ? '#FFB300'
        : eatery.faction === 'laksa'
        ? '#E53935'
        : '#10B981';
    const emoji = eatery.faction === 'kolok' ? '🥢' : eatery.faction === 'laksa' ? '🍤' : '🤝';

    return L.divIcon({
      className: 'custom-brutal-marker',
      html: `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${isSelected ? '42px' : '34px'};
          height: ${isSelected ? '42px' : '34px'};
          background-color: ${bgCol};
          color: #2D2424;
          border: 3px solid #2D2424;
          border-radius: 12px;
          font-weight: 900;
          font-size: ${isSelected ? '18px' : '14px'};
          box-shadow: 3px 3px 0px #2D2424;
          transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          transition: all 0.2s ease;
        ">
          ${emoji}
          ${eatery.fomoIndex >= 95 ? '<span style="position: absolute; -top: -6px; -right: -6px; background: #E53935; color: white; font-size: 8px; padding: 1px 4px; border-radius: 6px; border: 2px solid #2D2424;">HOT</span>' : ''}
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });
  };

  return (
    <div id="kuching-live-map-card" className="relative flex flex-col overflow-hidden rounded-[32px] border-4 border-[#2D2424] bg-stone-900 text-stone-100 shadow-brutal-lg">
      {/* Top Map Controls */}
      <div className="relative z-25 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#2D2424] bg-[#2D2424] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-emerald-400 border border-white/20 text-base">
            🗺️
          </span>
          <div>
            <h3 className="text-sm font-black text-white sm:text-base">
              KUCHING GIS FOODIE CARTOGRAPHY &amp; LIVE HEATMAP
            </h3>
            <p className="text-[11px] font-bold text-white/70">
              Real OpenStreetMap Vector Integration: Live Sarawak River Basin Faction Densities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Heatmap/Density Toggle */}
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
            <span>FACTION INTENSITY: {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas Container */}
      <div className="relative h-[400px] sm:h-[480px] w-full overflow-hidden bg-stone-950 z-10">
        <MapContainer
          center={[1.5533, 110.3592]} // Kuching City Center coordinates
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', background: '#12161f' }}
        >
          {/* CartoDB Dark Matter Real Map Tile Layer (Sleek, dark, production-grade map tiles) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />

          <MapViewController center={[1.5533, 110.3592]} zoom={13} />

          {/* Render Real Markers for Eateries */}
          {eateries.map((eatery) => {
            // Fallback coordinate mapping if lat/lng are missing in mock database
            const lat = eatery.lat ?? 1.5533 + (eatery.coordinates.y - 450) * 0.0001;
            const lng = eatery.lng ?? 110.3592 + (eatery.coordinates.x - 500) * 0.0001;

            return (
              <Marker
                key={eatery.id}
                position={[lat, lng]}
                icon={createCustomIcon(eatery)}
                eventHandlers={{
                  click: () => {
                    soundFx.playTick(600);
                    onSelectEatery(eatery);
                  },
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-2 text-[#2D2424] font-sans">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#2D2424] text-white uppercase">
                        {eatery.faction}
                      </span>
                      <span className="text-xs font-black text-rose-600">🔥 {eatery.fomoIndex}% FOMO</span>
                    </div>
                    <h4 className="font-black text-sm">{eatery.name}</h4>
                    <p className="text-[11px] font-bold text-stone-600 mt-0.5">{eatery.address || 'Kuching Sarawak'}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Map Legend Overlay */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-[400] flex flex-wrap items-center gap-2 rounded-xl bg-[#2D2424] px-3.5 py-2 border-2 border-white/20 text-[10px] font-black text-white shadow-brutal-sm">
          {weather && (
            <div className={`flex items-center gap-1 rounded-lg px-2 py-0.5 border border-white/20 ${
              weather.condition === 'rainy' ? 'bg-[#E53935] text-white' : 'bg-[#FFB300] text-[#2D2424]'
            }`}>
              {weather.condition === 'rainy' ? <CloudRain className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
              <span>{weather.condition === 'rainy' ? 'Rain Laksa Surge Active' : 'Sun Kolok Rush Active'}</span>
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
        </div>
      </div>
    </div>
  );
};