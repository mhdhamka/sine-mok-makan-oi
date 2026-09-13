import React from 'react';
import { Clock } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface NavigationTabsProps {
  activeTab: 'radar' | 'map' | 'wheel' | 'fomo';
  setActiveTab: (tab: 'radar' | 'map' | 'wheel' | 'fomo') => void;
  mytTimeString: string;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  setActiveTab,
  mytTimeString,
}) => {
  const tabs = [
    { id: 'radar', label: 'Radar', soundPitch: 500 },
    { id: 'map', label: 'Map & Heatmap', soundPitch: 550 },
    { id: 'wheel', label: 'Spin Wheel', soundPitch: 600 },
    { id: 'fomo', label: 'FOMO Feed', soundPitch: 650 },
  ] as const;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[#2D2424] bg-white p-2.5 shadow-brutal-sm">
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`view-tab-${tab.id}`}
            onClick={() => {
              soundFx.playTick(tab.soundPitch);
              setActiveTab(tab.id);
            }}
            className={`px-4 py-2 text-xs font-black rounded-xl border-2 transition-all ${
              activeTab === tab.id
                ? 'bg-[#2D2424] text-white border-[#2D2424] shadow-brutal-sm'
                : 'bg-white text-[#2D2424] border-[#2D2424] hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-xl border border-amber-300 text-xs font-mono font-black text-amber-900">
        <Clock className="h-3.5 w-3.5 text-amber-700 animate-pulse" />
        <span>MYT: {mytTimeString || 'Loading...'}</span>
      </div>
    </div>
  );
};