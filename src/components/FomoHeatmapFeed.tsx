import React, { useState } from 'react';
import { Flame, TrendingUp, Zap, Clock, Users, ArrowUpRight, MessageSquare, PlusCircle } from 'lucide-react';
import { Eatery, LiveCheckinEvent, Faction } from '../types';
import { soundFx } from '../utils/audio';

interface FomoHeatmapFeedProps {
  eateries: Eatery[];
  liveEvents: LiveCheckinEvent[];
  onOpenCheckinModal: (eatery?: Eatery) => void;
  onSelectEatery: (eatery: Eatery) => void;
  userFaction: 'kolok' | 'laksa';
}

export const FomoHeatmapFeed: React.FC<FomoHeatmapFeedProps> = ({
  eateries,
  liveEvents,
  onOpenCheckinModal,
  onSelectEatery,
  userFaction,
}) => {
  const [activeTab, setActiveTab] = useState<'surging' | 'liveFeed'>('surging');

  // Sort eateries by highest FOMO index
  const trendingHotspots = [...eateries].sort((a, b) => b.fomoIndex - a.fomoIndex).slice(0, 6);

  return (
    <div id="fomo-engine-feed-card" className="flex flex-col rounded-[32px] border-4 border-[#2D2424] bg-white p-4 shadow-brutal-lg sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#2D2424]/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E53935] text-white shadow-brutal-sm border-2 border-[#2D2424]">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-[#2D2424] sm:text-xl">
                FOMO &amp; CROWD HEAT ENGINE
              </h3>
              <span className="rounded-full bg-[#E53935] px-2.5 py-0.5 text-[9px] font-black text-white">
                VELOCITY LIVE
              </span>
            </div>
            <p className="text-xs font-bold text-[#2D2424]/70">
              Live algorithmic tracking of check-in surges, broth sellouts, and queue queues across Kuching.
            </p>
          </div>
        </div>

        <button
          id="quick-checkin-trigger-btn"
          onClick={() => {
            soundFx.playTick(600);
            onOpenCheckinModal();
          }}
          className="flex items-center gap-1.5 rounded-xl bg-[#E53935] px-4 py-2 text-xs font-black text-white shadow-brutal-sm border-2 border-[#2D2424] transition-all hover:bg-[#D32F2F] active:scale-95"
        >
          <PlusCircle className="h-4 w-4 text-[#FFB300]" />
          <span>I'M EATING HERE (CHECK IN)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-3.5 flex items-center gap-2 text-xs">
        <button
          id="fomo-tab-surging"
          onClick={() => setActiveTab('surging')}
          className={`rounded-xl px-3.5 py-2 font-black transition-all flex items-center gap-1.5 border-2 ${
            activeTab === 'surging'
              ? 'bg-[#FFB300] text-[#2D2424] border-[#2D2424] shadow-brutal-sm'
              : 'bg-[#FFF8E1] text-[#2D2424] border-[#2D2424]/30 hover:bg-[#FFE082]'
          }`}
        >
          <TrendingUp className="h-4 w-4 text-[#E53935]" />
          <span>TOP SURGE HOTSPOTS ({trendingHotspots.length})</span>
        </button>
        <button
          id="fomo-tab-feed"
          onClick={() => setActiveTab('liveFeed')}
          className={`rounded-xl px-3.5 py-2 font-black transition-all flex items-center gap-1.5 border-2 ${
            activeTab === 'liveFeed'
              ? 'bg-[#FFB300] text-[#2D2424] border-[#2D2424] shadow-brutal-sm'
              : 'bg-[#FFF8E1] text-[#2D2424] border-[#2D2424]/30 hover:bg-[#FFE082]'
          }`}
        >
          <Users className="h-4 w-4 text-[#E53935]" />
          <span>LIVE KAKIS FEED ({liveEvents.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'surging' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trendingHotspots.map((spot) => (
              <div
                key={spot.id}
                id={`hotspot-card-${spot.id}`}
                onClick={() => {
                  soundFx.playTick(550);
                  onSelectEatery(spot);
                }}
                className="group cursor-pointer rounded-2xl border-2 border-[#2D2424] bg-[#FFF8E1] p-3.5 transition-all shadow-brutal-sm hover:-translate-y-1 hover:shadow-brutal hover:bg-white"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{spot.faction === 'kolok' ? '🥢' : spot.faction === 'laksa' ? '🍤' : '🤝'}</span>
                    <span className="text-xs font-black text-[#2D2424] line-clamp-1">
                      {spot.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 rounded-lg bg-[#2D2424] px-2 py-0.5 text-[10px] font-mono font-black text-[#FFB300]">
                    <Zap className="h-3 w-3" />
                    <span>{spot.fomoIndex}%</span>
                  </div>
                </div>

                <p className="mt-1.5 text-xs font-bold text-[#2D2424]/70 line-clamp-1">
                  {spot.area} • ~{spot.queueWaitMin}m queue
                </p>

                {/* Weather Craving Notice */}
                {spot.weatherNotice && (
                  <div className={`mt-1.5 rounded-lg px-2 py-0.5 text-[10px] font-black border border-[#2D2424] line-clamp-1 ${
                    (spot.weatherCravingBoost || 0) > 0
                      ? spot.faction === 'laksa'
                        ? 'bg-[#E53935] text-white'
                        : 'bg-[#FFB300] text-[#2D2424]'
                      : 'bg-white text-[#2D2424]'
                  }`}>
                    {spot.weatherNotice}
                  </div>
                )}

                {/* Stock note warning if available */}
                {spot.stockNote && (
                  <div className="mt-1.5 rounded-lg bg-[#2D2424] border border-[#2D2424] px-2 py-1 text-[10px] font-black text-white line-clamp-1">
                    {spot.stockNote}
                  </div>
                )}

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#2D2424]/60 pt-2 border-t border-[#2D2424]/10 font-bold">
                  <span>{spot.checkinVelocityPerHr} check-ins/hr</span>
                  <span className="font-black text-[#2D2424] flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    Inspect <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {liveEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex items-start gap-3 rounded-2xl border-2 border-[#2D2424] bg-[#FFF8E1] p-3.5 shadow-brutal-sm transition-all hover:bg-white"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-2xs border-2 border-[#2D2424]">
                  {evt.photoEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#2D2424]">{evt.userName}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase border border-[#2D2424] ${
                          evt.userFaction === 'kolok'
                            ? 'bg-[#FFB300] text-[#2D2424]'
                            : 'bg-[#E53935] text-white'
                        }`}
                      >
                        {evt.userFaction === 'kolok' ? 'Kolok' : 'Laksa'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#2D2424]/60 font-mono font-bold">{evt.timestamp}</span>
                  </div>

                  <p className="text-xs text-[#2D2424] font-bold mt-1">
                    Checked into <strong className="font-black">{evt.eateryName}</strong> for{' '}
                    <span className="text-[#E53935] underline decoration-[#FFB300] font-black">{evt.dishName}</span>
                  </p>

                  <p className="text-xs italic text-[#2D2424]/70 mt-1">"{evt.comment}"</p>
                </div>

                <div className="flex flex-col items-end">
                  <span className="rounded-lg bg-[#2D2424] px-2 py-0.5 text-[10px] font-black text-[#FFB300]">
                    +{evt.fomoImpact} PTS
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
