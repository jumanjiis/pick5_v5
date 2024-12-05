import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, collection, getDocs, query, where, setDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AlertCircle, Trophy, X, ArrowLeft, CheckCircle, Plus, Users, Clock, Filter } from 'lucide-react';
import type { Match, Player, PlayerTarget } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import PlayerCard from '../components/PlayerCard';

const PlayMatch: React.FC = () => {
  const { matchId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<(Player | null)[]>(Array(5).fill(null));
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [existingPredictionId, setExistingPredictionId] = useState<string | null>(null);
  const [matchStarted, setMatchStarted] = useState(false);
  const [correctPredictions, setCorrectPredictions] = useState(0);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!matchId || !user) {
          throw new Error('Match ID and user are required');
        }

        const matchDoc = await getDoc(doc(db, 'matches', matchId));
        if (!matchDoc.exists()) {
          throw new Error('Match not found');
        }
        
        const matchData = { 
          id: matchDoc.id, 
          ...matchDoc.data(),
          timestamp: matchDoc.data().timestamp instanceof Timestamp 
            ? matchDoc.data().timestamp.toDate() 
            : new Date(matchDoc.data().timestamp)
        } as Match;

        const hasStarted = new Date() >= matchData.timestamp;
        setMatchStarted(hasStarted);
        setMatch(matchData);

        const playersQuery = query(collection(db, 'players'));
        const playersSnapshot = await getDocs(playersQuery);
        const allPlayers = playersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Player[];

        const playersWithTargets = allPlayers.filter(
          player => player.matchTargets && player.matchTargets[matchId]
        );

        const predictionsQuery = query(
          collection(db, 'predictions'),
          where('userId', '==', user.uid),
          where('matchId', '==', matchId)
        );
        const predictionsSnapshot = await getDocs(predictionsQuery);
        
        if (!predictionsSnapshot.empty) {
          const prediction = predictionsSnapshot.docs[0];
          setExistingPredictionId(prediction.id);
          
          const selectedPlayerIds = prediction.data().selectedPlayers;
          const selectedPlayersList = Array(5).fill(null);
          
          selectedPlayerIds.forEach((playerId: string, index: number) => {
            const player = playersWithTargets.find(p => p.id === playerId);
            if (player) {
              selectedPlayersList[index] = player;
            }
          });
          
          setSelectedPlayers(selectedPlayersList);
          setAvailablePlayers(playersWithTargets.filter(p => 
            !selectedPlayersList.some(sp => sp && sp.id === p.id)
          ));

          if (hasStarted) {
            const correct = selectedPlayersList.reduce((acc, player) => {
              if (!player) return acc;
              const target = player.matchTargets[matchId];
              if (target.actualPoints !== undefined) {
                return acc + (target.actualPoints >= target.target ? 1 : 0);
              }
              return acc;
            }, 0);
            setCorrectPredictions(correct);
          }
        } else {
          setAvailablePlayers(playersWithTargets);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load match data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matchId, user]);

  const handlePlayerSelect = (player: Player, slotIndex: number) => {
    if (matchStarted) return;
    
    const newSelectedPlayers = [...selectedPlayers];
    newSelectedPlayers[slotIndex] = player;
    setSelectedPlayers(newSelectedPlayers);
    
    setAvailablePlayers(prev => prev.filter(p => p.id !== player.id));
  };

  const handlePlayerRemove = (slotIndex: number) => {
    if (matchStarted) return;
    
    const removedPlayer = selectedPlayers[slotIndex];
    if (removedPlayer) {
      const newSelectedPlayers = [...selectedPlayers];
      newSelectedPlayers[slotIndex] = null;
      setSelectedPlayers(newSelectedPlayers);
      setAvailablePlayers(prev => [...prev, removedPlayer]);
    }
  };

  const getPlayerTarget = (player: Player): PlayerTarget => {
    return player.matchTargets[matchId!];
  };

  const handleSubmit = async () => {
    if (!match || selectedPlayers.filter(Boolean).length !== 5 || !user || submitting || matchStarted) return;
    setSubmitting(true);

    try {
      const predictionData = {
        userId: user.uid,
        userEmail: user.email,
        matchId: match.id,
        selectedPlayers: selectedPlayers.filter(Boolean).map(player => player!.id),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending'
      };

      if (existingPredictionId) {
        await setDoc(doc(db, 'predictions', existingPredictionId), predictionData);
      } else {
        await addDoc(collection(db, 'predictions'), predictionData);
      }

      navigate('/dashboard', {
        state: {
          showCelebration: true,
          isUpdate: !!existingPredictionId,
          selectedPlayers: selectedPlayers.filter(Boolean).map(player => ({
            name: player!.name,
            team: player!.team,
            ...getPlayerTarget(player!)
          }))
        }
      });
    } catch (err) {
      console.error('Error saving prediction:', err);
      setError('Failed to save prediction');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAvailablePlayers = availablePlayers.filter(player => 
    selectedTeamFilter === 'all' || player.team === selectedTeamFilter
  );

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 max-w-md w-full text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Error</h2>
        <p className="text-purple-200">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  if (!match) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-4 px-3 sm:py-8 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-purple-200 hover:text-white transition-gpu"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>

          {!matchStarted && (
            <button
              onClick={handleSubmit}
              disabled={selectedPlayers.filter(Boolean).length !== 5 || submitting}
              className={`flex items-center px-6 py-3 text-base font-semibold rounded-xl transition-gpu ${
                selectedPlayers.filter(Boolean).length === 5 && !submitting
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-700 transform hover:translate-y-[-2px]'
                  : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
              }`}
            >
              <Trophy className="h-5 w-5 mr-2" />
              {submitting ? 'Saving...' : existingPredictionId ? 'Update Team' : 'Lock Team'}
            </button>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{match.team1} vs {match.team2}</h2>
              <p className="text-purple-200">
                {format(match.timestamp, 'PPp')} • {match.venue}
              </p>
              {match.description && (
                <p className="mt-3 text-purple-200">{match.description}</p>
              )}
            </div>
            {matchStarted && (
              <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                <span>Match Started • {correctPredictions}/5 Correct</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center mb-4">
              <Users className="h-6 w-6 mr-2 text-yellow-400" />
              Your Squad ({selectedPlayers.filter(Boolean).length}/5)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {selectedPlayers.map((player, index) => (
                <div key={index} className="relative">
                  <div 
                    className={`bg-white/10 backdrop-blur-lg rounded-xl p-3 sm:p-4 border-2
                      ${player ? 'border-green-500/50' : 'border-purple-500/30'}
                      relative transition-gpu hover:bg-white/20 cursor-pointer
                      ${activeSlot === index ? 'ring-2 ring-purple-500' : ''}`}
                    onClick={() => !matchStarted && setActiveSlot(activeSlot === index ? null : index)}
                  >
                    {player ? (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          {!matchStarted && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayerRemove(index);
                              }}
                              className="p-1.5 sm:p-2 rounded-full hover:bg-red-500/20 transition-colors"
                            >
                              <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                            </button>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-sm sm:text-base">{player.name}</h4>
                          <p className="text-xs sm:text-sm text-green-200">{player.team}</p>
                        </div>
                        <div className="bg-green-500/20 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-center">
                          <span className="text-green-400 font-semibold text-sm">
                            Target: {getPlayerTarget(player).target} {getPlayerTarget(player).type}
                          </span>
                        </div>
                        {matchStarted && getPlayerTarget(player).actualPoints !== undefined && (
                          <div className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-center ${
                            getPlayerTarget(player).actualPoints >= getPlayerTarget(player).target
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            <span className="font-semibold text-sm">
                              Actual: {getPlayerTarget(player).actualPoints}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[120px] sm:h-[160px] space-y-2">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-purple-300" />
                        </div>
                        <span className="text-purple-300 text-sm text-center">
                          {matchStarted ? 'Empty Slot' : 'Tap to add player'}
                        </span>
                      </div>
                    )}
                    
                    {/* Status Indicator */}
                    {player && (
                      <div className="absolute -top-2 -right-2 z-10">
                        {!matchStarted ? (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                        ) : getPlayerTarget(player).actualPoints !== undefined && (
                          getPlayerTarget(player).actualPoints >= getPlayerTarget(player).target ? (
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                              <X className="h-4 w-4 text-white" />
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {!matchStarted && activeSlot === index && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
                      <div className="bg-indigo-900/95 backdrop-blur-lg rounded-xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-purple-500/20">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg sm:text-xl font-semibold text-white">Select Player for Slot {index + 1}</h3>
                          <button 
                            onClick={() => setActiveSlot(null)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </button>
                        </div>

                        {/* Team Filter */}
                        <div className="mb-4 flex items-center space-x-2">
                          <Filter className="h-5 w-5 text-purple-200" />
                          <select
                            value={selectedTeamFilter}
                            onChange={(e) => setSelectedTeamFilter(e.target.value)}
                            className="bg-white/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                          >
                            <option value="all">All Teams</option>
                            <option value={match.team1}>{match.team1}</option>
                            <option value={match.team2}>{match.team2}</option>
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {filteredAvailablePlayers.map(player => (
                            <PlayerCard
                              key={player.id}
                              player={player}
                              onSelect={() => {
                                handlePlayerSelect(player, index);
                                setActiveSlot(null);
                              }}
                              disabled={selectedPlayers.filter(Boolean).length >= 5 && !selectedPlayers[index]}
                              matchId={matchId!}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayMatch;
