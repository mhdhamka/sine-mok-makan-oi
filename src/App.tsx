import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Map as MapIcon,
  RotateCw,
  Flame,
  Users,
  Award,
  Sparkles,
  Shield,
  Volume2,
  VolumeX,
  Compass,
  PlusCircle,
  Clock,
  Car,
  CloudRain,
  Sun,
  CloudLightning
} from 'lucide-react';
import confetti from 'canvas-confetti';

import {
  Eatery,
  UserProfile,
  Badge,
  LiveCheckinEvent,
  ActiveQuest,
  KolokStyle,
  SavedCoupon,
  WeatherData,
  WeatherImpactSummary
} from './types';
import {
  INITIAL_EATERIES,
  INITIAL_BADGES,
  SAMPLE_SAVED_COUPONS,
  INITIAL_LIVE_EVENTS
} from './data/kuchingEateries';
import { soundFx } from './utils/audio';
import { weatherApi } from './services/weatherApi';

import { TurfWarBanner } from './components/TurfWarBanner';
import { RadarScanner } from './components/RadarScanner';
import { KuchingInteractiveMap } from './components/KuchingInteractiveMap';
import { BailoutWheel } from './components/BailoutWheel';
import { FomoHeatmapFeed } from './components/FomoHeatmapFeed';
import { SquadRoomModal } from './components/SquadRoomModal';
import { ProfileModal } from './components/ProfileModal';
import { CheckinModal } from './components/CheckinModal';
import { ActiveQuestBanner } from './components/ActiveQuestBanner';
import { KuchingWeatherRadarWidget } from './components/KuchingWeatherRadarWidget';

export default function App() {
  // App view modes
  const [activeTab, setActiveTab] = useState<'radar' | 'map' | 'wheel' | 'fomo'>('radar');

  // Weather simulation state
  const [weather, setWeather] = useState<WeatherData>(() => weatherApi.getCurrentWeatherData());

  useEffect(() => {
    const unsubscribe = weatherApi.subscribe((newWeather) => {
      setWeather(newWeather);
    });
    return unsubscribe;
  }, []);

  // Eateries state
  const [eateries, setEateries] = useState<Eatery[]>(() => {
    const saved = localStorage.getItem('sine_eateries');
    return saved ? JSON.parse(saved) : INITIAL_EATERIES;
  });

  // Calculate dynamic weather-impacted eateries
  const activeEateries = useMemo(() => {
    return weatherApi.applyWeatherToEateries(eateries, weather);
  }, [eateries, weather]);

  const [selectedEatery, setSelectedEatery] = useState<Eatery | null>(INITIAL_EATERIES[0]);

  const currentSelectedEatery = useMemo(() => {
    if (!selectedEatery) return activeEateries[0] || null;
    return activeEateries.find((e) => e.id === selectedEatery.id) || activeEateries[0] || null;
  }, [selectedEatery, activeEateries]);

  // Live weather impact summary
  const weatherImpact = useMemo(() => {
    return weatherApi.calculateImpactSummary(activeEateries, weather);
  }, [activeEateries, weather]);

  // Turf War Scores
  const [kolokScore, setKolokScore] = useState<number>(() => {
    const saved = localStorage.getItem('sine_kolok_score');
    return saved ? parseInt(saved, 10) : 58;
  });

  const [laksaScore, setLaksaScore] = useState<number>(() => {
    const saved = localStorage.getItem('sine_laksa_score');
    return saved ? parseInt(saved, 10) : 42;
  });

  // User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('sine_profile');
    if (saved) return JSON.parse(saved);
    return {
      id: 'usr-kuching-foodie-1',
      name: 'Kuching Food Hunter',
      avatarEmoji: '🥢',
      faction: 'kolok',
      tierTitle: 'Mee Kolok Merah Knight',
      level: 4,
      xp: 240,
      nextLevelXp: 350,
      checkinCount: 14,
      unlockedBadgeIds: ['badge-allegiance', 'badge-merah-disciple', 'badge-peace-maker'],
      savedCoupons: SAMPLE_SAVED_COUPONS,
      favoriteKolokStyle: 'merah',
    };
  });

  // Badges
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);

  // Live feed
  const [liveEvents, setLiveEvents] = useState<LiveCheckinEvent[]>(() => {
    const saved = localStorage.getItem('sine_live_events');
    return saved ? JSON.parse(saved) : INITIAL_LIVE_EVENTS;
  });

  // Active Squad Quest
  const [activeQuest, setActiveQuest] = useState<ActiveQuest | null>(() => {
    const saved = localStorage.getItem('sine_active_quest');
    return saved ? JSON.parse(saved) : null;
  });

  // Modals
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('sine_eateries', JSON.stringify(eateries));
  }, [eateries]);

  useEffect(() => {
    localStorage.setItem('sine_kolok_score', kolokScore.toString());
    localStorage.setItem('sine_laksa_score', laksaScore.toString());
  }, [kolokScore, laksaScore]);

  useEffect(() => {
    localStorage.setItem('sine_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('sine_live_events', JSON.stringify(liveEvents));
  }, [liveEvents]);

  useEffect(() => {
    if (activeQuest) {
      localStorage.setItem('sine_active_quest', JSON.stringify(activeQuest));
    } else {
      localStorage.removeItem('sine_active_quest');
    }
  }, [activeQuest]);

  // City-wide atmospheric tint calculation
  const totalVotes = kolokScore + laksaScore;
  const isKolokLeading = kolokScore >= laksaScore;

  // Lock in Squad Quest handler
  const handleLockSquadQuest = (eatery: Eatery) => {
    const newQuest: ActiveQuest = {
      eateryId: eatery.id,
      eateryName: eatery.name,
      questTitle: `Operation: ${eatery.name.split(' ')[0]} Feast`,
      targetDish: eatery.specialtyDish,
      factionBonus: eatery.faction,
      xpReward: 80,
      couponReward:
        eatery.faction === 'kolok'
          ? 'Free Crispy Lard + Teh C Peng'
          : eatery.faction === 'laksa'
          ? 'Priority Table + Extra Calamansi Sambal'
          : 'Free Teh C Peng Special & Sio Bee Voucher',
      minutesRemaining: 30,
    };
    setActiveQuest(newQuest);

    // Also add to saved coupons
    const newCoupon: SavedCoupon = {
      id: `c-${Date.now()}`,
      eateryId: eatery.id,
      eateryName: eatery.name,
      title: `${eatery.name} VIP Perk`,
      code: `SINE-${Math.floor(1000 + Math.random() * 9000)}`,
      discountText: newQuest.couponReward,
      expiresInMinutes: 45,
      claimed: false,
    };

    setProfile((prev) => ({
      ...prev,
      savedCoupons: [newCoupon, ...prev.savedCoupons],
    }));

    soundFx.playFanfare();
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.5 },
      });
    } catch {}
  };

  // Complete Check-in Handler
  const handleCompleteCheckin = (
    eateryId: string,
    dish: string,
    comment: string,
    photoEmoji: string
  ) => {
    const target = eateries.find((e) => e.id === eateryId) || eateries[0];

    // Push faction scores
    if (profile.faction === 'kolok') {
      setKolokScore((s) => s + 25);
    } else {
      setLaksaScore((s) => s + 25);
    }

    // Update eatery checkin count and FOMO index
    setEateries((prev) =>
      prev.map((e) => {
        if (e.id === eateryId) {
          const newFomo = Math.min(100, e.fomoIndex + 3);
          return {
            ...e,
            fomoIndex: newFomo,
            checkinVelocityPerHr: e.checkinVelocityPerHr + 2,
            totalCheckinsToday: e.totalCheckinsToday + 1,
          };
        }
        return e;
      })
    );

    // Add to live events feed
    const newEvt: LiveCheckinEvent = {
      id: `evt-${Date.now()}`,
      userName: `${profile.name} (You)`,
      userFaction: profile.faction,
      eateryId: target.id,
      eateryName: target.name,
      dishName: dish,
      timestamp: 'Just now',
      fomoImpact: profile.faction === 'kolok' ? 25 : 30,
      photoEmoji: photoEmoji,
      comment: comment,
    };
    setLiveEvents([newEvt, ...liveEvents.slice(0, 15)]);

    // Update user profile XP & level
    setProfile((prev) => {
      const newXp = prev.xp + 50;
      let newLevel = prev.level;
      let nextXp = prev.nextLevelXp;
      let newTier = prev.tierTitle;

      if (newXp >= prev.nextLevelXp) {
        newLevel += 1;
        nextXp += 200;
        newTier =
          prev.faction === 'kolok'
            ? 'Legendary Mee Kolok Connoisseur'
            : 'Archbishop of Sarawak Laksa';
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        nextLevelXp: nextXp,
        tierTitle: newTier,
        checkinCount: prev.checkinCount + 1,
      };
    });

    // Check if active quest matched
    if (activeQuest && activeQuest.eateryId === eateryId) {
      setActiveQuest(null);
    }

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ef4444', '#10b981'],
      });
    } catch {}
  };

  // Update Faction handler
  const handleUpdateFaction = (faction: 'kolok' | 'laksa', style?: KolokStyle) => {
    setProfile((prev) => ({
      ...prev,
      faction,
      favoriteKolokStyle: style || prev.favoriteKolokStyle,
      avatarEmoji: faction === 'kolok' ? '🥢' : '🍤',
      tierTitle:
        faction === 'kolok'
          ? 'Mee Kolok Merah Knight'
          : 'Prawn Broth High Priest',
    }));
  };

  // Redeem coupon
  const handleRedeemCoupon = (couponId: string) => {
    setProfile((prev) => ({
      ...prev,
      savedCoupons: prev.savedCoupons.map((c) =>
        c.id === couponId ? { ...c, claimed: true } : c
      ),
    }));
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-700 ${
        isKolokLeading
          ? 'bg-[#fdfaf3] text-stone-900' // Savory golden-oil warm tint
          : 'bg-[#fdf5f5] text-stone-900' // Spicy sambal-red warm tint
      }`}
    >
      {/* Top Ambient Turf Glow */}
      <div
        className={`pointer-events-none fixed top-0 left-0 right-0 h-64 opacity-25 blur-3xl transition-all duration-1000 ${
          isKolokLeading ? 'bg-amber-400' : 'bg-red-500'
        }`}
      />

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
        {/* Navigation Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-white/90 p-3.5 shadow-xs backdrop-blur-md sm:p-4">
          {/* Logo & Culture Tagline */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-2xl text-white shadow-sm">
              🍜
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg font-bold tracking-tight text-stone-900 sm:text-xl">
                  Sine Mok Makan Oi?
                </h1>
                <span className="hidden sm:inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-900 border border-amber-300">
                  Kuching Food Hunt
                </span>
              </div>
              <p className="text-xs text-stone-500">
                The FOMO Radar, Turf War &amp; Indecision Bailout Game
              </p>
            </div>
          </div>

          {/* Quick Actions & Profile Pills */}
          <div className="flex items-center gap-2">
            {/* Live Weather Status Pill */}
            <div
              id="header-weather-status-pill"
              className={`hidden md:flex items-center gap-1.5 rounded-xl border-2 border-[#2D2424] px-3 py-1.5 text-xs font-black shadow-brutal-sm ${
                weather.condition === 'rainy'
                  ? 'bg-[#E53935] text-white'
                  : weather.condition === 'sunny'
                  ? 'bg-[#FFB300] text-[#2D2424]'
                  : 'bg-white text-[#2D2424]'
              }`}
            >
              {weather.condition === 'rainy' ? (
                <CloudRain className="h-3.5 w-3.5 animate-bounce" />
              ) : weather.condition === 'sunny' ? (
                <Sun className="h-3.5 w-3.5 text-amber-900 animate-spin-slow" />
              ) : (
                <CloudLightning className="h-3.5 w-3.5" />
              )}
              <span>
                {weather.temperature}°C {weather.condition === 'rainy' ? '🌧️ Laksa Craving' : '☀️ Kolok Rush'}
              </span>
            </div>

            {/* Squad Room Trigger Button */}
            <button
              id="open-squad-room-btn"
              onClick={() => {
                soundFx.playTick(550);
                setIsSquadModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-bold text-stone-800 transition-all hover:bg-stone-100 active:scale-95 shadow-2xs"
            >
              <Car className="h-3.5 w-3.5 text-amber-600" />
              <span>Car Squad (4)</span>
            </button>

            {/* Profile & Badges Trigger Button */}
            <button
              id="open-profile-btn"
              onClick={() => {
                soundFx.playTick(600);
                setIsProfileModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 transition-all hover:bg-stone-50 active:scale-95 shadow-2xs"
            >
              <span className="text-base">{profile.avatarEmoji}</span>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="font-bold text-stone-900">{profile.tierTitle}</span>
                <span className="text-[10px] text-stone-400">Lvl {profile.level} • {profile.savedCoupons.length} Perks</span>
              </div>
            </button>

            {/* Quick Check-in Button */}
            <button
              id="header-checkin-btn"
              onClick={() => {
                soundFx.playTick(650);
                setIsCheckinModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-stone-800 active:scale-95"
            >
              <PlusCircle className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Check In Here</span>
              <span className="sm:hidden">Check In</span>
            </button>
          </div>
        </header>

        {/* Hyper-Local Kuching Weather & Craving Impact Radar Widget */}
        <KuchingWeatherRadarWidget />

        {/* The Daily Turf War Banner */}
        <TurfWarBanner
          kolokScore={kolokScore}
          laksaScore={laksaScore}
          userFaction={profile.faction}
          kolokStyle={profile.favoriteKolokStyle}
          onToggleFactionModal={() => setIsProfileModalOpen(true)}
        />

        {/* Active Squad Quest Banner if running */}
        {activeQuest && (
          <ActiveQuestBanner
            quest={activeQuest}
            onCompleteQuest={() => {
              const target = eateries.find((e) => e.id === activeQuest.eateryId);
              if (target) {
                handleCompleteCheckin(
                  target.id,
                  target.specialtyDish,
                  'Squad Quest fulfilled! Peace preserved across the city.',
                  '🏆'
                );
              }
            }}
            onAbandonQuest={() => setActiveQuest(null)}
          />
        )}

        {/* Feature View Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              id="view-tab-radar"
              onClick={() => {
                soundFx.playTick(500);
                setActiveTab('radar');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'radar'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/60'
              }`}
            >
              <Radio className="h-3.5 w-3.5 text-emerald-400" />
              <span>"Sine Mok Makan" Radar</span>
            </button>

            <button
              id="view-tab-map"
              onClick={() => {
                soundFx.playTick(550);
                setActiveTab('map');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'map'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/60'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5 text-sky-400" />
              <span>Kuching Map &amp; Crowd Heatmap</span>
            </button>

            <button
              id="view-tab-wheel"
              onClick={() => {
                soundFx.playTick(600);
                setActiveTab('wheel');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'wheel'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/60'
              }`}
            >
              <RotateCw className="h-3.5 w-3.5 text-amber-400" />
              <span>"Bailout" Spin-the-Wheel</span>
            </button>

            <button
              id="view-tab-fomo"
              onClick={() => {
                soundFx.playTick(650);
                setActiveTab('fomo');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'fomo'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/60'
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-rose-500" />
              <span>FOMO Engine &amp; Live Feed</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500 font-mono">
            <Clock className="h-3.5 w-3.5" />
            <span>KUCHING LOCAL TIME: 10:45 AM (LAKSA PEAK HOURS)</span>
          </div>
        </div>

        {/* Dynamic Primary View Content */}
        <main className="space-y-6">
          {activeTab === 'radar' && (
            <div className="space-y-6">
              <RadarScanner
                eateries={activeEateries}
                selectedEatery={currentSelectedEatery}
                onSelectEatery={(e) => setSelectedEatery(e)}
                onLockSquadQuest={handleLockSquadQuest}
                userFaction={profile.faction}
                weather={weather}
              />
              <FomoHeatmapFeed
                eateries={activeEateries}
                liveEvents={liveEvents}
                onOpenCheckinModal={() => setIsCheckinModalOpen(true)}
                onSelectEatery={(e) => setSelectedEatery(e)}
                userFaction={profile.faction}
              />
            </div>
          )}

          {activeTab === 'map' && (
            <div className="space-y-6">
              <KuchingInteractiveMap
                eateries={activeEateries}
                selectedEatery={currentSelectedEatery}
                onSelectEatery={(e) => setSelectedEatery(e)}
                userFaction={profile.faction}
                weather={weather}
              />
              {/* Quick inspect card */}
              {currentSelectedEatery && (
                <div className="rounded-2xl border-2 border-[#2D2424] bg-white p-4 shadow-brutal-sm flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {currentSelectedEatery.faction === 'kolok' ? '🥢' : currentSelectedEatery.faction === 'laksa' ? '🍤' : '🤝'}
                      </span>
                      <h3 className="text-base font-black text-[#2D2424]">{currentSelectedEatery.name}</h3>
                      <span className="rounded-lg bg-[#2D2424] px-2 py-0.5 text-[10px] font-mono font-black text-[#FFB300]">
                        FOMO {currentSelectedEatery.fomoIndex}%
                      </span>
                      {currentSelectedEatery.weatherNotice && (
                        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black border border-[#2D2424] ${
                          (currentSelectedEatery.weatherCravingBoost || 0) > 0
                            ? currentSelectedEatery.faction === 'laksa'
                              ? 'bg-[#E53935] text-white'
                              : 'bg-[#FFB300] text-[#2D2424]'
                            : 'bg-stone-100 text-[#2D2424]'
                        }`}>
                          {currentSelectedEatery.weatherNotice}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#2D2424]/80 font-bold mt-1">
                      {currentSelectedEatery.area} • <strong>Target Dish:</strong> {currentSelectedEatery.specialtyDish} • ~{currentSelectedEatery.queueWaitMin}m queue
                    </p>
                  </div>
                  <button
                    onClick={() => handleLockSquadQuest(currentSelectedEatery)}
                    className="rounded-xl bg-[#2D2424] px-4 py-2 text-xs font-black text-white hover:bg-black shadow-brutal-sm border border-[#2D2424] active:scale-95 transition-transform"
                  >
                    Lock as Squad Quest
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wheel' && (
            <div className="space-y-6">
              <BailoutWheel
                eateries={activeEateries}
                onLockQuest={handleLockSquadQuest}
                userFaction={profile.faction}
                weather={weather}
              />
            </div>
          )}

          {activeTab === 'fomo' && (
            <div className="space-y-6">
              <FomoHeatmapFeed
                eateries={activeEateries}
                liveEvents={liveEvents}
                onOpenCheckinModal={() => setIsCheckinModalOpen(true)}
                onSelectEatery={(e) => {
                  setSelectedEatery(e);
                  setActiveTab('radar');
                }}
                userFaction={profile.faction}
              />
            </div>
          )}
        </main>

        {/* Footer Cultural Notes */}
        <footer className="mt-8 border-t border-stone-200/80 pt-4 text-center text-xs text-stone-400">
          <p className="font-serif italic text-stone-600">
            “Sine mok makan oi?” — The eternal Sarawakian dilemma solved by location radar, brotherhood allegiances, and the sacred compromise of Lau Ya Keng.
          </p>
          <div className="mt-1 flex flex-wrap justify-center gap-3 text-[11px] text-stone-400">
            <span>Carpenter Street</span>
            <span>•</span>
            <span>Jalan Ban Hock</span>
            <span>•</span>
            <span>Padungan</span>
            <span>•</span>
            <span>Matang Jaya</span>
            <span>•</span>
            <span>Satok</span>
            <span>•</span>
            <span>Tabuan Jaya</span>
            <span>•</span>
            <span>Hui Sing</span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <SquadRoomModal
        isOpen={isSquadModalOpen}
        onClose={() => setIsSquadModalOpen(false)}
        eateries={eateries}
        onLockQuest={handleLockSquadQuest}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        badges={badges}
        onUpdateFaction={handleUpdateFaction}
        onRedeemCoupon={handleRedeemCoupon}
      />

      <CheckinModal
        isOpen={isCheckinModalOpen}
        onClose={() => setIsCheckinModalOpen(false)}
        eateries={eateries}
        targetEatery={selectedEatery}
        userFaction={profile.faction}
        onCompleteCheckin={handleCompleteCheckin}
      />
    </div>
  );
}
