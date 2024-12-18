import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Crown, Star } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import MatchCard from '../components/dashboard/MatchCard';
import { useMatches } from '../hooks/useMatches';
import { usePredictions } from '../hooks/usePredictions';
import type { Match } from '../types';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { matches, loading: matchesLoading, error: matchesError } = useMatches();
  const { predictions, loading: predictionsLoading, error: predictionsError } = usePredictions();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'completed'>('upcoming');

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

  if (matchesLoading || predictionsLoading) return <LoadingSpinner />;

  if (matchesError || predictionsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-purple-200">{matchesError || predictionsError}</p>
        </div>
      </div>
    );
  }

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
                  <span className="text-xl font-bold text-yellow-400">{predictions.length}</span>
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
          {matches
            .filter(match => getMatchStatus(match) === activeTab)
            .map(match => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={predictions.find(p => p.matchId === match.id)}
                status={getMatchStatus(match)}
                timeStatus={getTimeStatus(match.timestamp)}
                correctPredictions={getCorrectPredictions(predictions.find(p => p.matchId === match.id))}
              />
            ))}

          {activeTab === 'upcoming' && matches.filter(match => getMatchStatus(match) === 'upcoming').length === 0 && (
            <EmptyState />
          )}

          {activeTab === 'completed' && matches.filter(match => getMatchStatus(match) === 'completed').length === 0 && (
            <div className="text-center py-8 bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/20">
              <p className="text-purple-200">No completed matches yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
