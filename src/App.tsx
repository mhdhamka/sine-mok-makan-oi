import React, { useState, useEffect, useMemo } from 'react';
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
  WeatherCondition
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
import { WeatherRadarWidget } from './components/WeatherRadarWidget';

// Newly Modularized Components
import { Header } from './components/common/Header';
import { NavigationTabs } from './components/common/NavigationTabs';
import { Footer } from './components/common/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'radar' | 'map' | 'wheel' | 'fomo'>('radar');
  const [mytTimeString, setMytTimeString] = useState<string>('');

  useEffect(() => {
    const updateMytTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kuala_Lumpur',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setMytTimeString(new Intl.DateTimeFormat('en-US', options).format(new Date()));
    };

    updateMytTime();
    const timer = setInterval(updateMytTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const [weather, setWeather] = useState<WeatherData>(() => weatherApi.getCurrentWeatherData());
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = weatherApi.subscribe((newWeather) => {
      setWeather(newWeather);
    });
    return unsubscribe;
  }, []);

  // Compute impact summary safely inside App.tsx (Fixed missing function error)
  const impactSummary = useMemo(() => {
    return {
      laksaAvgFomo: weather.condition === 'rainy' ? 88 : 45,
      kolokAvgFomo: weather.condition === 'sunny' ? 85 : 52,
    };
  }, [weather]);

  const handleSelectCondition = (condition: WeatherCondition) => {
    weatherApi.setCondition(condition);
  };

  const handleToggleAutoSim = () => {
    const nextState = !isSimulating;
    setIsSimulating(nextState);
    weatherApi.toggleAutoSimulation(); // Fixed: Removed nextState argument to match toggleAutoSimulation signature
  };

  const [eateries, setEateries] = useState<Eatery[]>(() => {
    const saved = localStorage.getItem('sine_eateries');
    return saved ? JSON.parse(saved) : INITIAL_EATERIES;
  });

  const activeEateries = useMemo(() => {
    return weatherApi.applyWeatherToEateries(eateries, weather);
  }, [eateries, weather]);

  const [selectedEatery, setSelectedEatery] = useState<Eatery | null>(INITIAL_EATERIES[0]);

  const currentSelectedEatery = useMemo(() => {
    if (!selectedEatery) return activeEateries[0] || null;
    return activeEateries.find((e) => e.id === selectedEatery.id) || activeEateries[0] || null;
  }, [selectedEatery, activeEateries]);

  const [kolokScore, setKolokScore] = useState<number>(() => {
    const saved = localStorage.getItem('sine_kolok_score');
    return saved ? parseInt(saved, 10) : 58;
  });

  const [laksaScore, setLaksaScore] = useState<number>(() => {
    const saved = localStorage.getItem('sine_laksa_score');
    return saved ? parseInt(saved, 10) : 42;
  });

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

  const [badges] = useState<Badge[]>(INITIAL_BADGES);
  const [liveEvents, setLiveEvents] = useState<LiveCheckinEvent[]>(() => {
    const saved = localStorage.getItem('sine_live_events');
    return saved ? JSON.parse(saved) : INITIAL_LIVE_EVENTS;
  });

  const [activeQuest, setActiveQuest] = useState<ActiveQuest | null>(() => {
    const saved = localStorage.getItem('sine_active_quest');
    return saved ? JSON.parse(saved) : null;
  });

  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);

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
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 } });
    } catch {}
  };

  const handleCompleteCheckin = (
    eateryId: string,
    dish: string,
    comment: string,
    photoEmoji: string
  ) => {
    const target = eateries.find((e) => e.id === eateryId) || eateries[0];

    if (profile.faction === 'kolok') {
      setKolokScore((s) => s + 25);
    } else {
      setLaksaScore((s) => s + 25);
    }

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

    if (activeQuest && activeQuest.eateryId === eateryId) {
      setActiveQuest(null);
    }

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#d97706', '#1b4d3e', '#b45309'],
      });
    } catch {}
  };

  const handleUpdateFaction = (faction: 'kolok' | 'laksa', style?: KolokStyle) => {
    setProfile((prev) => ({
      ...prev,
      faction,
      favoriteKolokStyle: style || prev.favoriteKolokStyle,
      avatarEmoji: faction === 'kolok' ? '🥢' : '🍤',
      tierTitle: faction === 'kolok' ? 'Mee Kolok Merah Knight' : 'Prawn Broth High Priest',
    }));
  };

  const handleRedeemCoupon = (couponId: string) => {
    setProfile((prev) => ({
      ...prev,
      savedCoupons: prev.savedCoupons.map((c) =>
        c.id === couponId ? { ...c, claimed: true } : c
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#3E2723] selection:bg-[#1B4D3E] selection:text-white transition-colors duration-700">
      {/* Top Kopitiam Jade Ambient Glow */}
      <div className="pointer-events-none fixed top-0 left-0 right-0 h-72 opacity-20 blur-3xl bg-[#1B4D3E]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
        {/* Extracted Header Component */}
        <Header
          weather={weather}
          profile={profile}
          onOpenSquadModal={() => setIsSquadModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenCheckinModal={() => setIsCheckinModalOpen(true)}
        />

        <WeatherRadarWidget
          weather={weather}
          impactSummary={impactSummary}
          onSelectCondition={handleSelectCondition}
          onToggleAutoSim={handleToggleAutoSim}
          isSimulating={isSimulating}
        />

        <TurfWarBanner
          kolokScore={kolokScore}
          laksaScore={laksaScore}
          userFaction={profile.faction}
          kolokStyle={profile.favoriteKolokStyle}
          onToggleFactionModal={() => setIsProfileModalOpen(true)}
        />

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

        {/* Extracted Navigation Tabs Component */}
        <NavigationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mytTimeString={mytTimeString}
        />

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
              {currentSelectedEatery && (
                <div className="rounded-2xl border-4 border-[#3E2723] bg-white p-4 shadow-brutal-sm flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {currentSelectedEatery.faction === 'kolok' ? '🥢' : currentSelectedEatery.faction === 'laksa' ? '🍤' : '🤝'}
                      </span>
                      <h3 className="text-base font-black text-[#3E2723]">{currentSelectedEatery.name}</h3>
                      <span className="rounded-lg bg-[#1B4D3E] px-2 py-0.5 text-[10px] font-mono font-black text-[#FFC107]">
                        FOMO {currentSelectedEatery.fomoIndex}%
                      </span>
                    </div>
                    <p className="text-xs text-[#3E2723]/80 font-bold mt-1">
                      {currentSelectedEatery.area} • <strong>Target Dish:</strong> {currentSelectedEatery.specialtyDish} • ~{currentSelectedEatery.queueWaitMin}m queue
                    </p>
                  </div>
                  <button
                    onClick={() => handleLockSquadQuest(currentSelectedEatery)}
                    className="rounded-xl bg-[#1B4D3E] px-4 py-2 text-xs font-black text-white hover:bg-[#12352b] shadow-brutal-sm border-2 border-[#3E2723] active:scale-95 transition-transform"
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

        {/* Extracted Footer Component */}
        <Footer />
      </div>

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