import React, { useState } from 'react';
import { UserProfile, SchemeMatch, Category } from './types';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { QuestionnairePage } from './pages/QuestionnairePage';
import { MatchingLoader } from './pages/MatchingLoader';
import { ResultsPage } from './pages/ResultsPage';
import { ExplorePage } from './pages/ExplorePage';
import { checkEligibility } from './services/api';

type ViewMode = 'home' | 'questionnaire' | 'matching' | 'results' | 'explore';

const initialEmptyProfile: UserProfile = {
  age: undefined,
  gender: undefined,
  province: '',
  district: '',
  occupation: '',
  education: '',
  incomeRange: undefined,
  isFarmer: false,
  ownsFarmLand: false,
  isStudent: false,
  isDisability: false,
  isSingleWoman: false,
  isForeignReturnee: false,
  isDalitOrMarginalized: false,
};

const MainApp: React.FC = () => {
  const { language } = useLanguage();
  const [view, setView] = useState<ViewMode>('home');
  const [profile, setProfile] = useState<UserProfile>(initialEmptyProfile);
  const [matches, setMatches] = useState<SchemeMatch[]>([]);
  const [exploreCategory, setExploreCategory] = useState<Category | undefined>(undefined);

  // Transition to questionnaire / home wizard
  const handleStartQuestionnaire = () => {
    if (view !== 'home') {
      setView('home');
      setTimeout(() => {
        const el = document.getElementById('wizard');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 150);
    } else {
      const el = document.getElementById('wizard');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Submit from questionnaire -> go to short matching animation
  const handleQuestionnaireSubmit = async (userProfile: UserProfile) => {
    setProfile(userProfile);
    setView('matching');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Calculate matches (via API with automatic client fallback)
    const result = await checkEligibility(userProfile, language);
    setMatches(result.matches);
  };

  // When short matching animation finishes
  const handleMatchingComplete = () => {
    setView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Go to explore benefits directory
  const handleExploreCategory = (category?: Category) => {
    setExploreCategory(category);
    setView('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Go Home
  const handleGoHome = () => {
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-crimson-100 selection:text-crimson-900">
      <Navbar
        onStartQuestionnaire={handleStartQuestionnaire}
        onExploreBenefits={() => handleExploreCategory()}
        onGoHome={handleGoHome}
        currentView={view}
      />

      <main className="flex-1">
        {view === 'home' && (
          <LandingPage
            onStartQuestionnaire={handleStartQuestionnaire}
            onExploreCategory={handleExploreCategory}
            onSubmitProfile={handleQuestionnaireSubmit}
            currentProfile={profile}
          />
        )}

        {view === 'questionnaire' && (
          <QuestionnairePage
            initialProfile={profile}
            onSubmit={handleQuestionnaireSubmit}
            onCancel={handleGoHome}
          />
        )}

        {view === 'matching' && <MatchingLoader onComplete={handleMatchingComplete} />}

        {view === 'results' && (
          <ResultsPage
            profile={profile}
            matches={matches}
            onEditProfile={handleStartQuestionnaire}
            onExploreAll={() => handleExploreCategory()}
          />
        )}

        {view === 'explore' && (
          <ExplorePage
            initialCategory={exploreCategory}
            onStartQuestionnaire={handleStartQuestionnaire}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
