import React, { useEffect, useState } from 'react';
import { Trophy, Clock, CheckCircle2, Gift, X, Sparkles } from 'lucide-react';
import { ActiveQuest } from '../types';
import { soundFx } from '../utils/audio';

interface ActiveQuestBannerProps {
  quest: ActiveQuest | null;
  onCompleteQuest: () => void;
  onAbandonQuest: () => void;
}

export const ActiveQuestBanner: React.FC<ActiveQuestBannerProps> = ({
  quest,
  onCompleteQuest,
  onAbandonQuest,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(quest ? quest.minutesRemaining * 60 : 1800);

  useEffect(() => {
    if (!quest) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [quest]);

  if (!quest) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div
      id="active-squad-quest-banner"
      className="relative overflow-hidden rounded-[28px] border-4 border-[#2D2424] bg-[#FFF8E1] p-4 text-[#2D2424] shadow-brutal"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFB300] text-2xl shadow-brutal-sm text-[#2D2424] font-bold border-2 border-[#2D2424]">
            ⚔️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#FFB300] px-2.5 py-0.5 text-[10px] font-black tracking-wider text-[#2D2424] border border-[#2D2424]">
                ACTIVE SQUAD QUEST
              </span>
              <span className="flex items-center gap-1 text-xs font-mono font-black text-[#E53935]">
                <Clock className="h-3.5 w-3.5" />
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>
            <h4 className="text-base font-black text-[#2D2424] sm:text-lg mt-0.5">
              {quest.questTitle}: {quest.eateryName}
            </h4>
            <p className="text-xs text-[#2D2424]/80 flex items-center gap-1.5 mt-0.5 font-bold">
              <Gift className="h-3.5 w-3.5 text-[#E53935]" />
              <span>Perk Reward: <strong className="text-[#E53935]">{quest.couponReward}</strong> (+{quest.xpReward} XP)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="claim-quest-arrival-btn"
            onClick={() => {
              soundFx.playCheckinChime();
              onCompleteQuest();
            }}
            className="flex items-center gap-2 rounded-2xl bg-[#E53935] hover:bg-[#D32F2F] px-5 py-2.5 text-xs font-black text-white border-2 border-[#2D2424] shadow-brutal-sm transition-all active:scale-95"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>WE ARRIVED! CLAIM PERK &amp; CHECK IN</span>
          </button>

          <button
            onClick={onAbandonQuest}
            className="rounded-xl border-2 border-[#2D2424] p-2 text-[#2D2424] hover:bg-[#2D2424] hover:text-white transition-colors"
            title="Cancel Quest"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
