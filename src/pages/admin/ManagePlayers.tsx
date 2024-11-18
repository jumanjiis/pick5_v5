import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Trash2, Edit2, Save, ArrowLeft, Target, CheckCircle, XCircle, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Player, PlayerTarget, Match } from '../../types';

const ManagePlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    team: '',
    role: 'batsman' as Player['role']
  });
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editingTargets, setEditingTargets] = useState<{ [key: string]: PlayerTarget }>({});
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [matches, setMatches] = useState<(Match & { id: string })[]>([]);

  useEffect(() => {
    fetchPlayers();
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const matchesSnapshot = await getDocs(collection(db, 'matches'));
      const matchesData = matchesSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        })) as (Match & { id: string })[];

      const sortedMatches = matchesData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      setMatches(sortedMatches);
      
      if (sortedMatches.length > 0) {
        setSelectedMatch(sortedMatches[0].id);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const playersSnapshot = await getDocs(collection(db, 'players'));
      const playersData = playersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Player[];
      setPlayers(playersData);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'players'), {
        ...newPlayer,
        matchTargets: {}
      });
      setNewPlayer({ name: '', team: '', role: 'batsman' });
      fetchPlayers();
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;
    try {
      await deleteDoc(doc(db, 'players', playerId));
      fetchPlayers();
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  const handleUpdatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    try {
      const updatedMatchTargets = {
        ...editingPlayer.matchTargets,
        [selectedMatch]: {
          ...editingTargets[editingPlayer.id],
          isSelected: true
        }
      };

      await updateDoc(doc(db, 'players', editingPlayer.id), {
        name: editingPlayer.name,
        team: editingPlayer.team,
        role: editingPlayer.role,
        matchTargets: updatedMatchTargets
      });
      
      setEditingPlayer(null);
      setEditingTargets({});
      fetchPlayers();
    } catch (error) {
      console.error('Error updating player:', error);
    }
  };

  const handleEditClick = (player: Player) => {
    setEditingPlayer(player);
    setEditingTargets({
      [player.id]: player.matchTargets?.[selectedMatch] || {
        type: player.role === 'bowler' ? 'wickets' : player.role === 'auction' ? 'Cr' : 'runs',
        target: 0,
        actualPoints: undefined,
        isSelected: false
      }
    });
  };

  const filteredPlayers = selectedTeam === 'all' 
    ? players 
    : players.filter(player => player.team === selectedTeam);

  const uniqueTeams = [...new Set(players.map(player => player.team))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center text-purple-200 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Admin Dashboard
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Player Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-bold text-white mb-4">Add New Player</h2>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div>
                <label className="block text-purple-200 mb-2">Name</label>
                <input
                  type="text"
                  value={newPlayer.name}
                  onChange={e => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-white/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Enter player name"
                />
              </div>
              <div>
                <label className="block text-purple-200 mb-2">Team</label>
                <input
                  type="text"
                  value={newPlayer.team}
                  onChange={e => setNewPlayer(prev => ({ ...prev, team: e.target.value }))}
                  required
                  className="w-full bg-white/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <label className="block text-purple-200 mb-2">Role</label>
                <select
                  value={newPlayer.role}
                  onChange={e => setNewPlayer(prev => ({ ...prev, role: e.target.value as Player['role'] }))}
                  required
                  className="w-full bg-white/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="batsman">Batsman</option>
                  <option value="bowler">Bowler</option>
                  <option value="all-rounder">All-Rounder</option>
                  <option value="wicket-keeper">Wicket Keeper</option>
                  <option value="auction">Auction</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Player
              </button>
            </form>
          </div>

          {/* Players List */}
          <div className="md:col-span-2 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-white">Manage Players</h2>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Filter className="h-5 w-5 text-purple-200 flex-shrink-0" />
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full sm:w-auto"
                  >
                    <option value="all">All Teams</option>
                    {uniqueTeams.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>

                <select
                  value={selectedMatch}
                  onChange={(e) => setSelectedMatch(e.target.value)}
                  className="w-full sm:w-auto long-text"
                >
                  {matches.map(match => (
                    <option key={match.id} value={match.id}>
                      {match.description || `${match.team1} vs ${match.team2}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-4 text-purple-200">Loading players...</div>
            ) : filteredPlayers.length === 0 ? (
              <div className="text-center py-4 text-yellow-400">No players found</div>
            ) : (
              <div className="space-y-4">
                {filteredPlayers.map(player => (
                  <div
                    key={player.id}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-white">{player.name}</h3>
                      <p className="text-purple-200">{player.team}</p>
                      <p className="text-purple-200">{player.role}</p>
                      
                      {player.matchTargets?.[selectedMatch] ? (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-green-400" />
                            <span className="text-green-400">
                              {player.role === 'auction' ? 'Price: ' : 'Target: '}
                              {player.matchTargets[selectedMatch].target} 
                              {player.matchTargets[selectedMatch].type === 'price' ? ' Crores' : player.matchTargets[selectedMatch].type}
                            </span>
                          </div>
                          {player.matchTargets[selectedMatch].actualPoints !== undefined && (
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-blue-400" />
                              <span className="text-blue-400">
                                {player.role === 'auction' ? 'Actual Price: ' : 'Actual: '}
                                {player.matchTargets[selectedMatch].actualPoints} 
                                {player.matchTargets[selectedMatch].type === 'price' ? ' Crores' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-yellow-400">No target set for selected match</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditClick(player)}
                        className="text-blue-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        className="text-red-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {editingPlayer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 max-w-lg w-full border border-purple-500/20">
            <h2 className="text-xl font-bold text-white mb-4">Edit Player</h2>
            <form onSubmit={handleUpdatePlayer} className="space-y-4">
              <div>
                <label className="block text-purple-200 mb-2">Name</label>
                <input
                  type="text"
                  value={editingPlayer.name}
                  onChange={e => setEditingPlayer(prev => prev && ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-white/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Enter player name"
                />
              </div>
              <div>
                <label className="block text-purple-200 mb-2">Team</label>
                <input
                  type="text"
                  value={editingPlayer.team}
                  onChange={e => setEditingPlayer(prev => prev && ({ ...prev, team: e.target.value }))}
                  required
                  className="w-full bg-white/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <label className="block text-purple-200 mb-2">Role</label>
                <select
                  value={editingPlayer.role}
                  onChange={e => setEditingPlayer(prev => prev && ({ ...prev, role: e.target.value as Player['role'] }))}
                  required
                  className="w-full bg-white/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="batsman">Batsman</option>
                  <option value="bowler">Bowler</option>
                  <option value="all-rounder">All-Rounder</option>
                  <option value="wicket-keeper">Wicket Keeper</option>
                  <option value="auction">Auction</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-purple-200 mb-2">
                    {editingPlayer.role === 'auction' ? 'Cr' : 'Target'}
                  </label>
                  <input
                    type="number"
                    value={editingTargets[editingPlayer.id]?.target || 0}
                    onChange={e => setEditingTargets(prev => ({
                      ...prev,
                      [editingPlayer.id]: { ...prev[editingPlayer.id], target: parseInt(e.target.value) }
                    }))}
                    className="w-full bg-white/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 mb-2">
                    Actual {editingPlayer.role === 'auction' ? 'Price' : 'Points'}
                  </label>
                  <input
                    type="number"
                    value={editingTargets[editingPlayer.id]?.actualPoints ?? ''}
                    onChange={e => setEditingTargets(prev => ({
                      ...prev,
                      [editingPlayer.id]: { ...prev[editingPlayer.id], actualPoints: parseInt(e.target.value) }
                    }))}
                    className="w-full bg-white/10 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                    min="0"
                    placeholder="Leave empty if match not started"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setEditingPlayer(null)}
                  className="text-red-400 hover:text-red-500 transition-colors"
                >
                  <XCircle className="h-5 w-5 inline-block mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePlayers;
