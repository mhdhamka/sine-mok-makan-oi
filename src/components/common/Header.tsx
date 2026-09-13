import React from 'react';
import { WeatherData, UserProfile } from '../../types';
import { soundFx } from '../../utils/audio';

const LAKSA_LOGO_PATH = `${(import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/'}laksa.png`;

interface HeaderProps {
  weather: WeatherData;
  profile: UserProfile;
  onOpenSquadModal: () => void;
  onOpenProfileModal: () => void;
  onOpenCheckinModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  weather,
  profile,
  onOpenSquadModal,
  onOpenProfileModal,
  onOpenCheckinModal,
}) => {
  const isRainy = weather.condition === 'rainy';
  const isSunny = weather.condition === 'sunny';

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border-4 border-[#2D2424] bg-white/95 p-4 shadow-brutal-sm backdrop-blur-md sm:px-6">
      {/* Logo & Culture Tagline */}
      <div className="flex items-center gap-3.5">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2D2424] text-white shadow-brutal-xs border-2 border-[#2D2424] group overflow-hidden p-1.5">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-red-500/20" />
          <img
            src={LAKSA_LOGO_PATH}
            alt="Logo"
            className="relative z-15 h-full w-full object-contain transform transition-transform group-hover:scale-110 drop-shadow-sm"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-lg font-black tracking-tight text-[#2D2424] sm:text-xl">
              Sine Mok Makan Oi?
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-900 border border-amber-300">
              Live Radar
            </span>
          </div>
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider text-[10px]">
            Kuching Food Hunt &amp; Turf War
          </p>
        </div>
      </div>

      {/* Quick Actions & Profile Pills */}
      <div className="flex items-center gap-2.5">
        {/* Live Weather Status Pill */}
        <div
          id="header-weather-status-pill"
          className={`hidden md:flex items-center gap-2 rounded-xl border-2 border-[#2D2424] px-3 py-1.5 text-xs font-black shadow-brutal-xs uppercase tracking-wider ${
            isRainy
              ? 'bg-[#E53935] text-white'
              : isSunny
              ? 'bg-[#FFB300] text-[#2D2424]'
              : 'bg-white text-[#2D2424]'
          }`}
        >
          <div className={` ${isRainy ? 'bg-white' : isSunny ? 'bg-[#2D2424]' : 'bg-stone-400'}`} />
          <span>
            {weather.temperature}°C {isRainy ? 'Laksa Surge' : isSunny ? 'Kolok Rush' : 'Overcast'}
          </span>
        </div>

        {/* Squad Room Trigger Button */}
        <button
          id="open-squad-room-btn"
          onClick={() => {
            soundFx.playTick(550);
            onOpenSquadModal();
          }}
          className="flex items-center gap-1.5 rounded-xl border-2 border-[#2D2424] bg-stone-50 px-3 py-1.5 text-xs font-black text-[#2D2424] transition-all hover:bg-stone-100 active:scale-95 shadow-brutal-xs uppercase tracking-wider"
        >
          <span>Car Squad (4)</span>
        </button>

        {/* Profile & Badges Trigger Button */}
        <button
          id="open-profile-btn"
          onClick={() => {
            soundFx.playTick(600);
            onOpenProfileModal();
          }}
          className="flex items-center gap-2 rounded-xl border-2 border-[#2D2424] bg-white px-3 py-1.5 text-xs font-bold text-[#2D2424] transition-all hover:bg-stone-50 active:scale-95 shadow-brutal-xs"
        >
          <span className="rounded-lg bg-[#2D2424] px-2 py-0.5 text-[10px] font-black text-amber-400 uppercase tracking-widest">
            {profile.tierTitle ? profile.tierTitle.substring(0, 4) : 'VIP'}
          </span>
          <div className="hidden sm:flex flex-col text-left leading-none">
            <span className="font-black text-stone-900 tracking-tight">{profile.tierTitle}</span>
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Lvl {profile.level} - {profile.savedCoupons.length} Perks</span>
          </div>
        </button>

        {/* Quick Check-in Button */}
        <button
          id="header-checkin-btn"
          onClick={() => {
            soundFx.playTick(650);
            onOpenCheckinModal();
          }}
          className="flex items-center gap-1.5 rounded-xl bg-[#2D2424] px-3.5 py-1.5 text-xs font-black text-white shadow-brutal-xs border-2 border-[#2D2424] transition-all hover:bg-black active:scale-95 uppercase tracking-wider"
        >
          <span className="hidden sm:inline">Check In Here</span>
          <span className="sm:hidden">Check In</span>
        </button>
      </div>
    </header>
  );
};