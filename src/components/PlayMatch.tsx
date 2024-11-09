{/* Previous imports remain the same */}

const PlayMatch = () => {
  // Previous state and functions remain the same

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-4 px-3 sm:py-8 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Previous header sections remain the same */}

        <div className="space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Users className="h-6 w-6 mr-2 text-yellow-400" />
                Your Squad ({filledSlots}/5)
              </h3>
              {!matchStarted && (
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full sm:w-auto bg-white/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="all">All Teams</option>
                  <option value={match.team1}>{match.team1}</option>
                  <option value={match.team2}>{match.team2}</option>
                </select>
              )}
            </div>

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
                  </div>

                  {/* Player Selection Grid Overlay */}
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
                        
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {filteredPlayers.map(player => (
                            <PlayerCard
                              key={player.id}
                              player={player}
                              onSelect={() => {
                                handlePlayerSelect(player, index);
                                setActiveSlot(null);
                              }}
                              disabled={filledSlots >= 5 && !selectedPlayers[index]}
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