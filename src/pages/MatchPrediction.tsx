import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, collection, getDocs, query, where, setDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AlertCircle, Save, Trophy, X, Star, ArrowLeft, CheckCircle, Filter, Edit2, Users } from 'lucide-react';
import type { Match, Player, PlayerTarget } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// Rename to PlayMatch or similar
const PlayMatch = () => {
  // ... [previous state declarations remain the same]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4">
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
              disabled={selectedPlayers.length !== 5 || submitting}
              className={`flex items-center px-6 py-3 text-base font-semibold rounded-xl transition-gpu ${
                selectedPlayers.length === 5 && !submitting
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-700 transform hover:translate-y-[-2px]'
                  : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
              }`}
            >
              <Trophy className="h-5 w-5 mr-2" />
              {submitting ? 'Saving...' : existingPredictionId ? 'Update Team' : 'Lock Team'}
            </button>
          )}
        </div>

        {/* Match Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{match.team1} vs {match.team2}</h2>
              <p className="text-purple-200">
                {format(match.timestamp, 'PPP p')} • {match.venue}
              </p>
              {match.description && (
                <p className="mt-3 text-purple-200">{match.description}</p>
              )}
            </div>
            {existingPredictionId && !matchStarted && (
              <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg flex items-center">
                <Edit2 className="h-5 w-5 mr-2" />
                <span>Editing Team</span>
              </div>
            )}
            {matchStarted && (
              <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                <span>Match Started • {correctPredictions}/5 Correct</span>
              </div>
            )}
          </div>
        </div>

        {/* Selected Players */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Users className="h-6 w-6 mr-2 text-yellow-400" />
            Your Team ({selectedPlayers.length}/5)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => {
              const player = selectedPlayers[index];
              return (
                <div 
                  key={index} 
                  className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border-2 
                    ${player ? 'border-green-500/50' : 'border-purple-500/30'} 
                    relative transition-gpu hover:bg-white/20
                    ${!player && !matchStarted ? 'cursor-pointer animate-pulse' : ''}`}
                  onClick={() => !player && !matchStarted && window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: 'smooth'
                  })}
                >
                  {player ? (
                    <>
                      {!matchStarted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayerRemove(player);
                          }}
                          className="absolute top-2 right-2 p-1 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                        >
                          <X className="h-4 w-4 text-red-400" />
                        </button>
                      )}
                      <div className="flex flex-col items-center text-center">
                        {matchStarted && (
                          <div className="absolute -top-3 -right-3">
                            {getPlayerTarget(player).actualPoints !== undefined && (
                              getPlayerTarget(player).actualPoints >= getPlayerTarget(player).target ? (
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                  <X className="h-5 w-5 text-white" />
                                </div>
                              )
                            )}
                          </div>
                        )}
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-3">
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-white">{player.name}</h4>
                        <p className="text-sm text-green-200">{player.team}</p>
                        <div className="mt-2 space-y-1">
                          <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-200 text-sm">
                            Target: {getPlayerTarget(player).target} {getPlayerTarget(player).type}
                          </div>
                          {matchStarted && getPlayerTarget(player).actualPoints !== undefined && (
                            <div className={`px-3 py-1 rounded-full text-sm ${
                              getPlayerTarget(player).actualPoints >= getPlayerTarget(player).target
                                ? 'bg-green-500/20 text-green-200'
                                : 'bg-red-500/20 text-red-200'
                            }`}>
                              Scored: {getPlayerTarget(player).actualPoints}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-[200px] flex flex-col items-center justify-center text-purple-300 space-y-2">
                      <Users className="h-8 w-8 text-purple-400/50" />
                      <span className="text-center">
                        {matchStarted ? 'Empty Slot' : 'Click to add player'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!matchStarted && (
          <>
            {/* Available Players */}
            <div className="mb-8">
              <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 py-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Users className="h-6 w-6 mr-2" />
                    Available Players
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-purple-200" />
                    <select
                      value={selectedTeamFilter}
                      onChange={(e) => setSelectedTeamFilter(e.target.value)}
                      className="bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="all">All Teams</option>
                      {uniqueTeams.map(team => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAvailablePlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => handlePlayerSelect(player)}
                    disabled={selectedPlayers.length >= 5}
                    className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 text-left 
                      hover:bg-white/20 transition-gpu transform hover:translate-y-[-2px]
                      ${selectedPlayers.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-purple-500/20'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{player.name}</h4>
                        <p className="text-sm text-purple-200">{player.team}</p>
                        <div className="mt-1 text-xs text-purple-300">
                          Target: {getPlayerTarget(player).target} {getPlayerTarget(player).type}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlayMatch;