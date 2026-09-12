import React, { useState } from 'react';
import { Users, Sparkles, X, Check, Award, Clock, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Eatery, SquadMember } from '../types';
import { soundFx } from '../utils/audio';

interface SquadRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  eateries: Eatery[];
  onLockQuest: (eatery: Eatery) => void;
}

export const SquadRoomModal: React.FC<SquadRoomModalProps> = ({
  isOpen,
  onClose,
  eateries,
  onLockQuest,
}) => {
  const [squad, setSquad] = useState<SquadMember[]>([
    { id: 'm1', name: 'You (Driver)', faction: 'kolok', avatarEmoji: '🚗', isLeader: true, status: 'hungry' },
    { id: 'm2', name: 'Aaron', faction: 'kolok', avatarEmoji: '🥢', status: 'paralyzed' },
    { id: 'm3', name: 'Dayang', faction: 'laksa', avatarEmoji: '🍤', status: 'paralyzed' },
    { id: 'm4', name: 'Kenny', faction: 'laksa', avatarEmoji: '🌶️', status: 'hungry' },
  ]);

  const [recommendedSpot, setRecommendedSpot] = useState<Eatery | null>(null);
  const [votingLocked, setVotingLocked] = useState(false);

  if (!isOpen) return null;

  const kolokCount = squad.filter((m) => m.faction === 'kolok').length;
  const laksaCount = squad.filter((m) => m.faction === 'laksa').length;

  const runAlgorithm = () => {
    soundFx.playTick(600);
    // Find holy compromise spot (Lau Ya Keng or Kubah Ria)
    const holySpot =
      eateries.find((e) => e.id === 'lau-ya-keng') ||
      eateries.find((e) => e.faction === 'compromise') ||
      eateries[0];

    setRecommendedSpot(holySpot);
    soundFx.playFanfare();
  };

  const addSquadMember = (name: string, faction: 'kolok' | 'laksa') => {
    const newMember: SquadMember = {
      id: `m-${Date.now()}`,
      name,
      faction,
      avatarEmoji: faction === 'kolok' ? '🥢' : '🍤',
      status: 'hungry',
    };
    setSquad([...squad, newMember]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div
        id="squad-room-modal"
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-y-auto rounded-[32px] border-4 border-[#2D2424] bg-[#FFF8E1] p-5 shadow-brutal-lg sm:p-6"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full border-2 border-[#2D2424] bg-white p-1.5 text-[#2D2424] hover:bg-stone-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 border-b-2 border-[#2D2424]/20 pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFB300] text-[#2D2424] shadow-brutal-sm border-2 border-[#2D2424]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#2D2424]">
              THE CAR SQUAD: INDECISION RECOVERY ROOM
            </h3>
            <p className="text-xs font-bold text-[#2D2424]/70">
              Sitting at the red light in Padungan? Settle the Kolok vs. Laksa deadlock without table flipping.
            </p>
          </div>
        </div>

        {/* Live Faction Tension Balance */}
        <div className="mt-4 rounded-2xl border-2 border-[#2D2424] bg-white p-4 shadow-brutal-sm">
          <div className="flex items-center justify-between text-xs font-black text-[#2D2424]">
            <span className="flex items-center gap-1.5 text-[#FFB300]">
              <span>🥢</span> {kolokCount} Kolok Lovers
            </span>
            <span className="rounded-full bg-[#2D2424] px-2.5 py-0.5 text-[9px] font-black text-[#FFB300]">
              FACTION TENSION: {kolokCount === laksaCount ? '50/50 DEADLOCK' : 'TENSION BUILDING'}
            </span>
            <span className="flex items-center gap-1.5 text-[#E53935]">
              <span>🍤</span> {laksaCount} Laksa Disciples
            </span>
          </div>

          <div className="mt-2.5 flex h-4 w-full overflow-hidden rounded-full bg-stone-200 border-2 border-[#2D2424]">
            <div
              className="bg-[#FFB300] transition-all border-r border-[#2D2424]"
              style={{ width: `${(kolokCount / squad.length) * 100}%` }}
            />
            <div
              className="bg-[#E53935] transition-all"
              style={{ width: `${(laksaCount / squad.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Squad Members List */}
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#2D2424]">
            Squad in the Car ({squad.length})
          </h4>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {squad.map((m) => (
              <div
                key={m.id}
                className="flex flex-col items-center rounded-2xl border-2 border-[#2D2424] bg-white p-3 text-center shadow-brutal-sm"
              >
                <div className="text-2xl">{m.avatarEmoji}</div>
                <span className="mt-1 font-black text-xs text-[#2D2424]">{m.name}</span>
                <span
                  className={`mt-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase border border-[#2D2424] ${
                    m.faction === 'kolok' ? 'bg-[#FFB300] text-[#2D2424]' : 'bg-[#E53935] text-white'
                  }`}
                >
                  {m.faction === 'kolok' ? 'Team Kolok' : 'Team Laksa'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Add Friend Button */}
        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            onClick={() => addSquadMember(`Kaki #${squad.length + 1}`, 'kolok')}
            className="rounded-xl bg-[#FFB300] px-3 py-1.5 text-xs font-black text-[#2D2424] border-2 border-[#2D2424] shadow-brutal-sm hover:bg-[#FFA000] active:scale-95"
          >
            + Add Kolok Kaki
          </button>
          <button
            onClick={() => addSquadMember(`Kaki #${squad.length + 1}`, 'laksa')}
            className="rounded-xl bg-[#E53935] px-3 py-1.5 text-xs font-black text-white border-2 border-[#2D2424] shadow-brutal-sm hover:bg-[#D32F2F] active:scale-95"
          >
            + Add Laksa Kaki
          </button>
        </div>

        {/* Run Compromise Algorithm Callout */}
        <div className="mt-4 flex flex-col items-center rounded-2xl border-2 border-[#2D2424] bg-white p-4 text-center shadow-brutal-sm">
          <HeartHandshake className="h-8 w-8 text-[#FFB300] mb-1" />
          <h4 className="text-sm font-black text-[#2D2424]">
            ACTIVATE THE "COMPROMISE" ALGORITHM
          </h4>
          <p className="mt-1 text-xs font-bold text-[#2D2424]/70 max-w-sm">
            Analyzes your car's coordinates, queue wait velocities, and culinary harmony to find a legendary spot where
            both dishes score 10/10.
          </p>

          <button
            id="calculate-compromise-btn"
            onClick={runAlgorithm}
            className="mt-3 flex items-center gap-2 rounded-xl bg-[#FFB300] hover:bg-[#FFA000] px-5 py-2.5 text-xs font-black text-[#2D2424] border-2 border-[#2D2424] shadow-brutal-sm transition-all active:scale-95"
          >
            <Sparkles className="h-4 w-4 text-[#2D2424]" />
            <span>CALCULATE NEUTRAL SANCTUARY</span>
          </button>
        </div>

        {/* Recommendation Result */}
        {recommendedSpot && (
          <div className="mt-4 rounded-[28px] border-4 border-[#2D2424] bg-white p-4 shadow-brutal sm:p-5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#E53935] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                PEACE TREATY IDENTIFIED
              </span>
              <span className="rounded-full bg-[#2D2424] px-2 py-0.5 text-[10px] font-mono font-black text-[#FFB300]">
                FOMO {recommendedSpot.fomoIndex}%
              </span>
            </div>

            <h3 className="mt-1.5 text-base font-black text-[#2D2424]">
              {recommendedSpot.name} ({recommendedSpot.area})
            </h3>
            <p className="mt-1 text-xs font-bold text-[#2D2424]/70">
              <strong>The Compromise:</strong> {recommendedSpot.specialtyDish}
            </p>

            <div className="mt-3.5 flex items-center justify-between gap-3 pt-2.5 border-t border-[#2D2424]/20">
              <span className="text-[11px] font-bold text-[#2D2424]/60 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Queue ~{recommendedSpot.queueWaitMin}m
              </span>

              <button
                id="lock-squad-quest-confirm-btn"
                onClick={() => {
                  soundFx.playFanfare();
                  onLockQuest(recommendedSpot);
                  onClose();
                }}
                className="flex items-center gap-2 rounded-2xl bg-[#E53935] hover:bg-[#D32F2F] px-5 py-2.5 text-xs font-black text-white border-2 border-[#2D2424] shadow-brutal-sm"
              >
                <Award className="h-4 w-4 text-[#FFB300]" />
                <span>LOCK IN SQUAD QUEST &amp; UNLOCK PERKS</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
