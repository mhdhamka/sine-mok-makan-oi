import React from 'react';
import { Flame, Sparkles, Shield, ChevronRight } from 'lucide-react';
import { Faction, KolokStyle } from '../types';
import { soundFx } from '../utils/audio';

interface TurfWarBannerProps {
  kolokScore: number;
  laksaScore: number;
  userFaction: 'kolok' | 'laksa';
  onToggleFactionModal: () => void;
  kolokStyle?: KolokStyle;
}

export const TurfWarBanner: React.FC<TurfWarBannerProps> = ({
  kolokScore,
  laksaScore,
  userFaction,
  onToggleFactionModal,
  kolokStyle = 'merah',
}) => {
  const total = kolokScore + laksaScore;
  const kolokPct = total > 0 ? Math.round((kolokScore / total) * 100) : 50;
  const laksaPct = 100 - kolokPct;
  const leader: Faction = kolokPct > laksaPct ? 'kolok' : laksaPct > kolokPct ? 'laksa' : 'compromise';

  return (
    <div id="turf-war-banner" className="relative overflow-hidden rounded-[28px] border-4 border-[#2D2424] bg-white p-4 shadow-brutal transition-all sm:p-5">
      {/* Background ambient lighting based on leader */}
      <div
        className={`pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl opacity-20 transition-all duration-700 ${
          leader === 'kolok'
            ? 'bg-[#FFB300]'
            : leader === 'laksa'
            ? 'bg-[#E53935]'
            : 'bg-[#FF8A65]'
        }`}
      />

      <div className="relative z-10 flex flex-col gap-3.5">
        {/* Top title and user allegiance pill */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2D2424] text-base text-white shadow-brutal-sm">
              ⚔️
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base tracking-tight text-[#2D2424] sm:text-lg">
                  THE DAILY KUCHING TURF WAR
                </h3>
                <span className="rounded-full bg-[#FFB300] border-2 border-[#2D2424] px-2.5 py-0.5 text-[10px] font-black tracking-wide text-[#2D2424] shadow-2xs">
                  FACTION WAR
                </span>
              </div>
              <p className="text-xs font-bold text-[#2D2424]/70">
                {leader === 'kolok'
                  ? '🍯 Golden Pork Lard Oil tint sweeps Kuching right now!'
                  : leader === 'laksa'
                  ? '🌶️ Spicy Sambal-Red broth hue engulfs the city skyline!'
                  : '⚖️ Deadlock: Kolok and Laksa forces in holy harmony.'}
              </p>
            </div>
          </div>

          <button
            id="allegiance-status-btn"
            onClick={() => {
              soundFx.playTick(620);
              onToggleFactionModal();
            }}
            className={`group inline-flex items-center gap-2.5 rounded-2xl px-3.5 py-2 text-xs font-black transition-all shadow-brutal-sm border-2 border-[#2D2424] ${
              userFaction === 'kolok'
                ? 'bg-[#FFB300] text-[#2D2424] hover:bg-[#FFA000]'
                : 'bg-[#E53935] text-white hover:bg-[#D32F2F]'
            }`}
          >
            <span className="text-lg">{userFaction === 'kolok' ? '🥢' : '🍤'}</span>
            <div className="text-left leading-tight">
              <span className="block text-[9px] uppercase font-black opacity-80">YOUR ALLEGIANCE</span>
              <span className="font-black uppercase tracking-tight">
                {userFaction === 'kolok' ? `Team Kolok (${kolokStyle})` : 'Team Laksa'}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 opacity-80 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Tug of war progress bar */}
        <div className="space-y-1.5 bg-[#FFF8E1] border-2 border-[#2D2424] p-3 rounded-2xl">
          <div className="flex items-center justify-between text-xs font-black">
            <div className="flex items-center gap-1.5 text-[#2D2424]">
              <Shield className="h-4 w-4 text-[#FFB300]" />
              <span className="uppercase">TEAM KOLOK (THE DRY SIDE)</span>
              <span className="rounded-lg bg-[#FFB300] border border-[#2D2424] px-2 py-0.5 text-[11px] font-black text-[#2D2424]">
                {kolokPct}%
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[#2D2424]">
              <span className="rounded-lg bg-[#E53935] border border-[#2D2424] px-2 py-0.5 text-[11px] font-black text-white">
                {laksaPct}%
              </span>
              <span className="uppercase">TEAM LAKSA (THE BROTH SIDE)</span>
              <Flame className="h-4 w-4 text-[#E53935]" />
            </div>
          </div>

          <div className="relative h-5 w-full overflow-hidden rounded-full border-2 border-[#2D2424] bg-white p-0.5">
            <div className="flex h-full w-full overflow-hidden rounded-full">
              <div
                className="relative bg-[#FFB300] transition-all duration-700 ease-out"
                style={{ width: `${kolokPct}%` }}
              />
              <div
                className="relative bg-[#E53935] transition-all duration-700 ease-out"
                style={{ width: `${laksaPct}%` }}
              />
            </div>

            {/* Central clash marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-[#2D2424] px-2 py-0.5 text-[9px] font-black text-white shadow-md transition-all duration-700"
              style={{ left: `${kolokPct}%` }}
            >
              VS
            </div>
          </div>
        </div>

        {/* Faction active perk alert */}
        <div className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-[#2D2424] border-2 border-[#2D2424]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#FFB300]" />
            <span>
              {userFaction === 'kolok' ? (
                <span>
                  <strong className="font-black text-[#2D2424]">KOLOK PERK ACTIVE:</strong> +15% Check-in
                  Speed bonus &amp; instant Crispy Lard batch alerts!
                </span>
              ) : (
                <span>
                  <strong className="font-black text-[#2D2424]">LAKSA PERK ACTIVE:</strong> High-Tier FOMO
                  Tracker active &amp; early "Broth Sells Out" warning!
                </span>
              )}
            </span>
          </div>
          <span className="hidden text-[#2D2424]/60 sm:inline font-black text-[10px] uppercase">KUCHING FACTION ENGINE</span>
        </div>
      </div>
    </div>
  );
};
