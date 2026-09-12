import React from 'react';
import { Award, Shield, Flame, X, Sparkles, Check, Gift, Ticket, ChevronRight } from 'lucide-react';
import { UserProfile, Badge, KolokStyle, SavedCoupon } from '../types';
import { soundFx } from '../utils/audio';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  badges: Badge[];
  onUpdateFaction: (faction: 'kolok' | 'laksa', style?: KolokStyle) => void;
  onRedeemCoupon: (couponId: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  badges,
  onUpdateFaction,
  onRedeemCoupon,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div
        id="profile-badges-modal"
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-[32px] border-4 border-[#2D2424] bg-[#FFF8E1] p-5 text-[#2D2424] shadow-brutal-lg sm:p-6"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full border-2 border-[#2D2424] bg-white p-1.5 text-[#2D2424] hover:bg-stone-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* User Profile Header */}
        <div className="flex flex-wrap items-center gap-4 border-b-2 border-[#2D2424]/20 pb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-brutal-sm border-2 border-[#2D2424]">
            {profile.avatarEmoji}
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-[#2D2424]">{profile.name}</h3>
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-black border-2 border-[#2D2424] ${
                  profile.faction === 'kolok'
                    ? 'bg-[#FFB300] text-[#2D2424]'
                    : 'bg-[#E53935] text-white'
                }`}
              >
                {profile.faction === 'kolok'
                  ? `Team Kolok (${profile.favoriteKolokStyle || 'merah'})`
                  : 'Team Laksa (Broth Side)'}
              </span>
            </div>
            <p className="font-black text-xs text-[#E53935] flex items-center gap-1 mt-0.5">
              <Sparkles className="h-3.5 w-3.5" /> {profile.tierTitle} • Level {profile.level}
            </p>

            {/* XP progress */}
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[11px] font-mono font-black text-[#2D2424]">
                <span>Foodie XP: {profile.xp} / {profile.nextLevelXp}</span>
                <span>{Math.round((profile.xp / profile.nextLevelXp) * 100)}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white border-2 border-[#2D2424]">
                <div
                  className="h-full bg-gradient-to-r from-[#FFB300] to-[#E53935] transition-all"
                  style={{ width: `${(profile.xp / profile.nextLevelXp) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Faction Allegiance Selector */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#2D2424]">
              DECLARE YOUR ETERNAL ALLEGIANCE
            </h4>
            <span className="text-[10px] font-bold text-[#2D2424]/60">Switches app turf atmosphere</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Team Kolok Box */}
            <div
              id="allegiance-option-kolok"
              onClick={() => {
                soundFx.playTick(600);
                onUpdateFaction('kolok', profile.favoriteKolokStyle || 'merah');
              }}
              className={`cursor-pointer rounded-2xl border-3 p-4 transition-all ${
                profile.faction === 'kolok'
                  ? 'border-[#2D2424] bg-[#FFB300]/30 shadow-brutal'
                  : 'border-[#2D2424]/40 bg-white hover:border-[#2D2424] shadow-brutal-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥢</span>
                  <div>
                    <h5 className="font-black text-sm text-[#2D2424]">Team Kolok</h5>
                    <span className="text-[10px] font-black text-[#FFB300] uppercase">The Dry Side</span>
                  </div>
                </div>
                {profile.faction === 'kolok' && (
                  <span className="rounded-full bg-[#2D2424] p-1 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs font-bold text-[#2D2424]/80">
                Fast, dependable, available on every corner. Rendered golden lard fragrance. Speed lunch check-in perks!
              </p>

              {/* Style selector if Kolok */}
              {profile.faction === 'kolok' && (
                <div className="mt-3 pt-2.5 border-t border-[#2D2424]/20">
                  <span className="text-[10px] font-black text-[#2D2424] block mb-1">
                    Signature Noodle Dressing:
                  </span>
                  <div className="flex gap-1.5">
                    {(['biasa', 'merah', 'kicap'] as KolokStyle[]).map((style) => (
                      <button
                        key={style}
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playTick(650);
                          onUpdateFaction('kolok', style);
                        }}
                        className={`flex-1 rounded-xl py-1 text-center text-[10px] font-black uppercase transition-all border border-[#2D2424] ${
                          profile.favoriteKolokStyle === style
                            ? 'bg-[#FFB300] text-[#2D2424] shadow-2xs'
                            : 'bg-white text-[#2D2424] hover:bg-[#FFE082]'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Team Laksa Box */}
            <div
              id="allegiance-option-laksa"
              onClick={() => {
                soundFx.playTick(650);
                onUpdateFaction('laksa');
              }}
              className={`cursor-pointer rounded-2xl border-3 p-4 transition-all ${
                profile.faction === 'laksa'
                  ? 'border-[#2D2424] bg-[#E53935]/20 shadow-brutal'
                  : 'border-[#2D2424]/40 bg-white hover:border-[#2D2424] shadow-brutal-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🍤</span>
                  <div>
                    <h5 className="font-black text-sm text-[#2D2424]">Team Laksa</h5>
                    <span className="text-[10px] font-black text-[#E53935] uppercase">The Broth Side</span>
                  </div>
                </div>
                {profile.faction === 'laksa' && (
                  <span className="rounded-full bg-[#E53935] p-1 text-white border border-[#2D2424]">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs font-bold text-[#2D2424]/80">
                Complex, deeply aromatic sambal belacan broth. High FOMO tracking &amp; rare sellout badge drops before 11 AM!
              </p>
            </div>
          </div>
        </div>

        {/* Saved Coupons & Perks Section */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#2D2424] flex items-center gap-1.5">
              <Ticket className="h-4 w-4 text-[#E53935]" />
              <span>PARTNER COUPONS &amp; SQUAD PERKS ({profile.savedCoupons.length})</span>
            </h4>
            <span className="text-[10px] font-bold text-[#2D2424]/60">Earned through Squad Quests</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {profile.savedCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="relative flex flex-col justify-between rounded-2xl border-2 border-dashed border-[#2D2424] bg-white p-3.5 shadow-brutal-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-[#2D2424]">{coupon.eateryName}</span>
                    <span className="rounded-full border border-[#2D2424] bg-[#FFB300] px-2 py-0.5 text-[9px] font-mono font-black text-[#2D2424]">
                      {coupon.code}
                    </span>
                  </div>
                  <h5 className="mt-1 font-black text-xs text-[#2D2424]">{coupon.title}</h5>
                  <p className="text-[11px] font-bold text-[#E53935] mt-0.5">{coupon.discountText}</p>
                </div>

                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[#2D2424]/20">
                  <span className="text-[10px] font-bold text-[#2D2424]/60">Expires in ~{coupon.expiresInMinutes}m</span>
                  <button
                    onClick={() => {
                      soundFx.playCheckinChime();
                      onRedeemCoupon(coupon.id);
                    }}
                    disabled={coupon.claimed}
                    className={`rounded-xl px-3 py-1.5 text-[10px] font-black transition-all border-2 border-[#2D2424] ${
                      coupon.claimed
                        ? 'bg-stone-200 text-stone-500 cursor-not-allowed border-stone-300'
                        : 'bg-[#FFB300] text-[#2D2424] hover:bg-[#FFA000] shadow-brutal-sm active:scale-95'
                    }`}
                  >
                    {coupon.claimed ? 'Redeemed ✓' : 'Redeem at Stall'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badge Vault Showcase */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#2D2424] flex items-center gap-1.5">
              <Award className="h-4 w-4 text-[#FFB300]" />
              <span>BADGE VAULT ({badges.filter((b) => b.unlocked).length} / {badges.length} UNLOCKED)</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`flex items-start gap-2.5 rounded-2xl border-2 p-3 transition-all ${
                  b.unlocked
                    ? 'border-[#2D2424] bg-white shadow-brutal-sm'
                    : 'border-[#2D2424]/30 bg-white/60 opacity-60'
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF8E1] text-2xl shadow-2xs border-2 border-[#2D2424]">
                  {b.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="font-black text-xs text-[#2D2424] truncate">{b.title}</h5>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-black border border-[#2D2424] ${
                        b.rarity === 'Legendary'
                          ? 'bg-[#FFB300] text-[#2D2424]'
                          : b.rarity === 'Rare'
                          ? 'bg-[#E53935] text-white'
                          : 'bg-white text-[#2D2424]'
                      }`}
                    >
                      {b.rarity}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-bold text-[#2D2424]/70">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
