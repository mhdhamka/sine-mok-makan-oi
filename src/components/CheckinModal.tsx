import React, { useState } from 'react';
import { X, Check, Camera, Plus, MapPin, Sparkles, Flame } from 'lucide-react';
import { Eatery, Faction } from '../types';
import { soundFx } from '../utils/audio';

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  eateries: Eatery[];
  targetEatery?: Eatery | null;
  userFaction: 'kolok' | 'laksa';
  onCompleteCheckin: (eateryId: string, dish: string, comment: string, photoEmoji: string) => void;
}

export const CheckinModal: React.FC<CheckinModalProps> = ({
  isOpen,
  onClose,
  eateries,
  targetEatery,
  userFaction,
  onCompleteCheckin,
}) => {
  const [selectedEateryId, setSelectedEateryId] = useState(targetEatery?.id || eateries[0]?.id || '');
  const [customDish, setCustomDish] = useState('');
  const [comment, setComment] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(userFaction === 'kolok' ? '🥢' : '🍤');

  if (!isOpen) return null;

  const currentEatery = eateries.find((e) => e.id === selectedEateryId) || eateries[0];

  const handleCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playCheckinChime();
    const finalDish = customDish.trim() || currentEatery?.specialtyDish || 'Delicious Meal';
    const finalComment = comment.trim() || 'So shiok! True Kuching comfort food.';
    onCompleteCheckin(selectedEateryId, finalDish, finalComment, selectedEmoji);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div
        id="checkin-modal"
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-[32px] border-4 border-[#2D2424] bg-[#FFF8E1] p-5 shadow-brutal-lg sm:p-6"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full border-2 border-[#2D2424] bg-white p-1.5 text-[#2D2424] hover:bg-stone-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 border-b-2 border-[#2D2424]/20 pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFB300] text-[#2D2424] shadow-brutal-sm text-xl border-2 border-[#2D2424]">
            🥢
          </div>
          <div>
            <h3 className="text-lg font-black text-[#2D2424]">
              FOODIE CHECK-IN &amp; FACTION BOOST
            </h3>
            <p className="text-xs font-bold text-[#2D2424]/70">
              Check in to fuel your faction in the City Turf War and warn others of queue wait times.
            </p>
          </div>
        </div>

        <form onSubmit={handleCheckin} className="mt-4 space-y-4">
          {/* Select Eatery */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-[#2D2424]">
              Select Eatery / Stall
            </label>
            <select
              value={selectedEateryId}
              onChange={(e) => setSelectedEateryId(e.target.value)}
              className="w-full rounded-xl border-2 border-[#2D2424] bg-white px-3 py-2 text-xs font-bold text-[#2D2424] shadow-brutal-sm focus:border-[#E53935] focus:outline-none"
            >
              {eateries.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.area}) • {e.faction === 'kolok' ? '🥢 Kolok' : e.faction === 'laksa' ? '🍤 Laksa' : '🤝 Both'}
                </option>
              ))}
            </select>
          </div>

          {/* Dish */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-[#2D2424]">
              What are you ordering?
            </label>
            <input
              type="text"
              placeholder={`e.g. ${currentEatery?.specialtyDish || 'Mee Kolok Merah or Extra Sambal Laksa'}`}
              value={customDish}
              onChange={(e) => setCustomDish(e.target.value)}
              className="w-full rounded-xl border-2 border-[#2D2424] bg-white px-3 py-2 text-xs font-bold text-[#2D2424] shadow-brutal-sm placeholder:text-[#2D2424]/40 focus:border-[#E53935] focus:outline-none"
            />
          </div>

          {/* Food Snapshot Emoji */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-[#2D2424]">
              Snapshot Reaction
            </label>
            <div className="flex gap-2">
              {['🥢', '🍤', '🍲', '🍜', '🌶️', '🥩', '🍋', '🍧'].map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all border-2 border-[#2D2424] ${
                    selectedEmoji === emoji
                      ? 'bg-[#FFB300] shadow-brutal-sm scale-105'
                      : 'bg-white hover:bg-[#FFE082]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Comment / Queue notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-[#2D2424]">
              Intel for the Kakis (Queue wait, broth status, crispy lard?)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 15 mins wait, fresh batch of crispy lard just ladled! Broth is super rich today."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border-2 border-[#2D2424] bg-white px-3 py-2 text-xs font-bold text-[#2D2424] shadow-brutal-sm placeholder:text-[#2D2424]/40 focus:border-[#E53935] focus:outline-none"
            />
          </div>

          {/* Faction XP reward badge */}
          <div className="flex items-center justify-between rounded-xl bg-white p-3.5 border-2 border-[#2D2424] shadow-brutal-sm">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-[#FFB300]" />
              <div className="text-xs">
                <span className="font-black text-[#2D2424]">Check-in Rewards:</span>
                <span className="block text-[11px] font-bold text-[#2D2424]/80">
                  +25 Points to {userFaction === 'kolok' ? 'Team Kolok 🥢' : 'Team Laksa 🍤'} &amp; +50 Foodie XP
                </span>
              </div>
            </div>
            <Flame className="h-5 w-5 text-[#E53935] animate-pulse" />
          </div>

          {/* Submit */}
          <button
            id="submit-checkin-btn"
            type="submit"
            className="w-full rounded-2xl bg-[#E53935] hover:bg-[#D32F2F] py-3 text-xs font-black text-white border-2 border-[#2D2424] shadow-brutal transition-all active:scale-98"
          >
            CONFIRM CHECK-IN &amp; UPDATE LIVE HEATMAP
          </button>
        </form>
      </div>
    </div>
  );
};
