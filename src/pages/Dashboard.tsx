import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Match, Player } from '../types';
import { format } from 'date-fns';
import { Calendar, Star, Crown, Trophy, ArrowRight, AlertCircle, Clock, CheckCircle, X, PartyPopper } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Link, useLocation } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [matches, setMatches] = useState<(Match & { players: Player[] })[]>([]);
  const [selections, setSelections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'completed'>('upcoming');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);

  useEffect(() => {
    if (location.state?.showCelebration && location.state?.selectedPlayers) {
      setShowCelebration(true);
      setCelebrationData(location.state);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) {
          setLoading(false);
          return;
        }

        const matchesRef = collection(db, 'matches');
        const matchesQuery = query(matchesRef, orderBy('timestamp', 'desc'));
        const matchesSnapshot = await getDocs(matchesQuery);
        
        const matchesData = await Promise.all(
          matchesSnapshot.docs.map(async (doc) => {
            const matchData = { 
              id: doc.id, 
              ...doc.data(),
              timestamp: doc.data().timestamp instanceof Timestamp 
                ? doc.data().timestamp.toDate() 
                : new Date(doc.data().timestamp)
            } as Match;
            
            const playersRef = collection(db, 'players');
            const playersSnapshot = await getDocs(playersRef);
            const players = playersSnapshot.docs.map(playerDoc => ({
              id: playerDoc.id,
              ...playerDoc.data()
            })) as Player[];

            return {
              ...matchData,
              players
            };
          })
        );

        setMatches(matchesData);

        const selectionsRef = collection(db, 'predictions');
        const selectionsQuery = query(
          selectionsRef,
          where('userId', '==', user.uid)
        );
        const selectionsSnapshot = await getDocs(selectionsQuery);
        const selectionsData = selectionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSelections(selectionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getMatchStatus = (match: Match) => {
    const now = new Date();
    if (match.timestamp > now) return 'upcoming';
    if (match.status === 'completed') return 'completed';
    return 'live';
  };

  const getTimeStatus = (timestamp: Date) => {
    const now = new Date();
    const diff = timestamp.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 0) return 'Started';
    if (hours === 0) return 'Starting soon';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const getCorrectPredictions = (prediction: any) => {
    if (!prediction?.selectedPlayers) return 0;
    return prediction.selectedPlayers.reduce((acc: number, playerId: string) => {
      const match = matches.find(m => m.id === prediction.matchId);
      if (!match) return acc;
      const player = match.players.find(p => p.id === playerId);
      if (!player?.matchTargets?.[prediction.matchId]) return acc;
      const target = player.matchTargets[prediction.matchId];
      if (target.actualPoints !== undefined && target.actualPoints >= target.target) {
        return acc + 1;
      }
      return acc;
    }, 0);
  };

  const renderMatchCard = (match: Match & { players: Player[] }) => {
    const prediction = selections.find(p => p.matchId === match.id);
    const status = getMatchStatus(match);
    const timeStatus = getTimeStatus(match.timestamp);
    const correctPredictions = prediction ? getCorrectPredictions(prediction) : 0;

    return (
      <div key={match.id} className="bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/20 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-medium text-purple-200 truncate pr-2">
              {match.description || `${match.team1} vs ${match.team2}`}
            </h3>
            <span className="text-sm text-purple-200 whitespace-nowrap">{timeStatus}</span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <h2 className="text-lg font-bold text-white">{match.team1} vs {match.team2}</h2>
              </div>
              <div className="flex items-center text-sm text-purple-200">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="truncate">{format(match.timestamp, 'PPp')}</span>
              </div>
            </div>

            {status === 'upcoming' ? (
              <Link
                to={`/play/${match.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
              >
                {prediction ? 'Update Team' : 'Pick Team'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : prediction ? (
              <Link
                to={`/play/${match.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 transition-all duration-300"
              >
                <Trophy className="h-4 w-4 mr-2" />
                View Result ({correctPredictions}/5)
              </Link>
            ) : (
              <div className="inline-flex items-center text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>No selection</span>
              </div>
            )}
          </div>

          {prediction && prediction.selectedPlayers && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
              {prediction.selectedPlayers.map((playerId: string, index: number) => {
                const player = match.players.find(p => p.id === playerId);
                if (!player) return null;
                const target = player.matchTargets[match.id];
                
                return (
                  <div key={index} className="bg-white/5 rounded-lg p-2 relative text-sm">
                    {status !== 'upcoming' && target.actualPoints !== undefined && (
                      <div className="absolute -top-1 -right-1">
                        {target.actualPoints >= target.target ? (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <X className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-white font-medium truncate">{player.name}</p>
                    <p className="text-xs text-purple-200">Target: {target.target} {target.type}</p>
                    {status !== 'upcoming' && target.actualPoints !== undefined && (
                      <p className={`text-xs ${
                        target.actualPoints >= target.target ? 'text-green-400' : 'text-red-400'
                      }`}>
                        Actual: {target.actualPoints}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-4 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center space-x-4">
            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full flex items-center justify-center">
              <Crown className="h-6 sm:h-8 w-6 sm:w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white truncate">{user?.displayName}</h2>
              <div className="flex items-center space-x-4">
                <div className="text-purple-200">
                  <span className="text-xl font-bold text-yellow-400">{selections.length}</span>
                  <span className="text-sm ml-1">Selections</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex rounded-lg bg-white/5 p-1">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 text-sm font-medium rounded-md ${
              activeTab === 'upcoming'
                ? 'bg-white/10 text-white'
                : 'text-purple-200 hover:text-white'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 py-2 text-sm font-medium rounded-md ${
              activeTab === 'live'
                ? 'bg-white/10 text-white'
                : 'text-purple-200 hover:text-white'
            }`}
          >
            Live
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 text-sm font-medium rounded-md ${
              activeTab === 'completed'
                ? 'bg-white/10 text-white'
                : 'text-purple-200 hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === 'live' && matches.filter(match => getMatchStatus(match) === 'live').map(renderMatchCard)}

          {activeTab === 'upcoming' && (
            matches.filter(match => getMatchStatus(match) === 'upcoming').length > 0 ? (
              matches.filter(match => getMatchStatus(match) === 'upcoming').map(renderMatchCard)
            ) : (
              <EmptyState />
            )
          )}

          {activeTab === 'completed' && (
            matches.filter(match => getMatchStatus(match) === 'completed').length > 0 ? (
              matches.filter(match => getMatchStatus(match) === 'completed').map(renderMatchCard)
            ) : (
              <div className="text-center py-8 bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/20">
                <p className="text-purple-200">No completed matches yet</p>
              </div>
            )
          )}
        </div>
      </div>

      {showCelebration && celebrationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCelebration(false)} />
          <div className="relative bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/95 rounded-2xl p-6 sm:p-8 w-full max-w-2xl border border-purple-500/20 shadow-xl animate-celebration my-4">
            <div 
              className="absolute inset-0 rounded-2xl opacity-10 bg-cover bg-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1920&auto=format&fit=crop')"
              }}
            />

            <div className="relative">
              <div className="absolute -top-10 -left-10 hidden sm:block animate-float">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 w-20 h-20 rounded-full flex items-center justify-center">
                  <PartyPopper className="h-10 w-10 text-white" />
                </div>
              </div>
              <div className="absolute -top-8 -right-8 hidden sm:block animate-float-delayed">
                <div className="bg-gradient-to-r from-purple-400 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 mb-3">
                  Team {celebrationData.isUpdate ? 'Updated' : 'Created'} Successfully! 🎉
                </h3>
                <p className="text-base sm:text-lg text-purple-200">
                  Sit back and watch your picks perform. We'll update the scores once the match is completed.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {celebrationData.selectedPlayers.map((player: any, index: number) => (
                  <div 
                    key={index}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-purple-500/20 animate-pop"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                        <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-white text-sm sm:text-base mb-1">{player.name}</h4>
                      <p className="text-xs sm:text-sm text-purple-200 mb-2">{player.team}</p>
                      <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-500/20 rounded-full">
                        <span className="text-green-400 text-xs sm:text-sm font-medium">
                          Target: {player.target} {player.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowCelebration(false)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;