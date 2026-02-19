import React, { useState, useEffect } from 'react';
import { Signal, SignalSource, User } from './types';
import SignalDashboard from './components/SignalDashboard';
import SignalTable from './components/SignalTable';
import SignalDetail from './components/SignalDetail';
import SourceInput from './components/SourceInput';
import ProfilePage from './components/ProfilePage';
import AdminPanel from './components/AdminPanel';
import AuthPage from './components/AuthPage';
import HelpModal from './components/HelpModal';
import UpgradeModal from './components/UpgradeModal';
import { supabase, getProfilesCount, getSignals, createSignalSource, extractSignals, analyzeSignal, getMonthlySignalCount } from './services/supabase';

type AppTab = 'dashboard' | 'signals' | 'sources' | 'admin' | 'settings' | 'auth';

const ADMIN_SEED_EMAIL = 'mambwemwila1@gmail.com';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [signalSources, setSignalSources] = useState<SignalSource[]>([]);
  const [monthlySignalCount, setMonthlySignalCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<AppTab>('auth');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isInitialSetup, setIsInitialSetup] = useState(false);

  useEffect(() => {
    checkSystemStatus();

    const hash = window.location.hash;
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1));
      const errorDescription = params.get('error_description');
      const errorMsg = params.get('error');
      if (errorDescription || errorMsg) {
        setAuthError(decodeURIComponent((errorDescription || errorMsg || 'Authentication failed').replace(/\+/g, ' ')));
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id, session.user.email || '');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id, session.user.email || '');
      } else {
        setActiveTab('auth');
        checkSystemStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSystemStatus = async () => {
    const count = await getProfilesCount();
    setIsInitialSetup(count === 0);
  };

  const fetchProfile = async (userId: string, email: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const shouldBeAdmin = email === ADMIN_SEED_EMAIL;

    if (data) {
      const user: User = {
        id: data.id,
        email: email,
        role: shouldBeAdmin ? 'admin' : (data.role || 'free'),
        company_name: data.company_name || 'E-Place Entity',
        name: data.name || email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${data.name || userId}`,
      };

      setCurrentUser(user);
      if (user.role !== 'free') {
        setActiveTab('dashboard');
        fetchSignals();
        fetchMonthlyCount();
      }
    }
  };

  const fetchSignals = async () => {
    const data = await getSignals();
    setSignals(data);
  };

  const fetchMonthlyCount = async () => {
    const count = await getMonthlySignalCount();
    setMonthlySignalCount(count);
  };

  const handleAddSource = async (type: 'url' | 'pasted_text', value: string) => {
    setIsProcessing(true);
    try {
      const source = await createSignalSource(type, value);
      const result = await extractSignals(source.id);

      if (result.success) {
        await fetchSignals();
        await fetchMonthlyCount();
      }
    } catch (error) {
      console.error('Error processing source:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyzeSignal = async (signalId: string, analysisType: 'intent' | 'seniority' | 'outreach') => {
    try {
      await analyzeSignal(signalId, analysisType);
      await fetchSignals(); // Refresh to get updated analysis
    } catch (error) {
      console.error('Error analyzing signal:', error);
    }
  };

  const handleAuth = async (email: string, password: string, isSignUp: boolean, metadata?: any) => {
    setIsAuthLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata
          }
        });

        if (error) throw error;

        // For signup, we might need to handle email confirmation
        if (data.user && !data.user.email_confirmed_at) {
          setAuthError('Please check your email and click the confirmation link.');
        }

        // Create user profile after successful sign up
        if (data.user) {
          try {
            await supabase.from('profiles').insert({
              user_id: data.user.id,
              email: email,
              name: metadata?.name || null,
              company_name: metadata?.company_name || null,
            });
          } catch (insertError) {
            console.error('Error creating profile:', insertError);
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
      }
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed');
    } finally {
      setIsAuthLoading(false);
    }
  };

  if (activeTab === 'auth') {
    return (
      <AuthPage
        onAuth={handleAuth}
        error={authError}
        isLoading={isAuthLoading}
        isInitialSetup={isInitialSetup}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">E-Place Intel Engine</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {monthlySignalCount} signals this month
              </span>
              <button
                onClick={() => setShowHelp(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                Help
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className="text-gray-600 hover:text-gray-800"
              >
                {currentUser?.name || currentUser?.email}
              </button>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setActiveTab('auth');
                }}
                className="text-red-600 hover:text-red-800 ml-4"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'dashboard', label: 'Dashboard' },
              { key: 'signals', label: 'Signals' },
              { key: 'sources', label: 'Add Source' },
              ...(currentUser?.role === 'admin' ? [{ key: 'admin', label: 'Admin' }] : [])
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as AppTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <SignalDashboard
            signals={signals}
            monthlyCount={monthlySignalCount}
            userRole={currentUser?.role || 'free'}
          />
        )}

        {activeTab === 'signals' && (
          <SignalTable
            signals={signals}
            onSelectSignal={setSelectedSignal}
            onAnalyzeSignal={handleAnalyzeSignal}
            userRole={currentUser?.role || 'free'}
          />
        )}

        {activeTab === 'sources' && (
          <SourceInput
            onSubmit={handleAddSource}
            isProcessing={isProcessing}
            canCreateSignal={monthlySignalCount < (currentUser?.role === 'free' ? 10 : currentUser?.role === 'pro' ? 500 : 999999)}
          />
        )}

        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminPanel />
        )}

        {activeTab === 'settings' && (
          <ProfilePage user={currentUser} />
        )}
      </main>

      {/* Modals */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}

      {selectedSignal && (
        <SignalDetail
          signal={selectedSignal}
          onClose={() => setSelectedSignal(null)}
          onAnalyze={handleAnalyzeSignal}
          userRole={currentUser?.role || 'free'}
        />
      )}
    </div>
  );
};

export default App;