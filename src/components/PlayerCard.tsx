import React from 'react';
import { Trophy } from 'lucide-react';
import type { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  onSelect: () => void;
  disabled: boolean;
  matchId: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onSelect, disabled, matchId }) => {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`w-full bg-white/10 backdrop-blur-lg rounded-xl p-3 sm:p-4 text-left 
        transition-gpu transform hover:scale-105
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'}`}
    >
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm sm:text-base">{player.name}</h4>
            <p className="text-xs sm:text-sm text-purple-200">{player.team}</p>
          </div>
        </div>
        <div className="bg-green-500/20 px-3 py-2 rounded-lg text-center">
          <span className="text-green-400 font-semibold text-sm">
            Target: {player.matchTargets?.[matchId]?.target} {player.matchTargets?.[matchId]?.type}
          </span>
        </div>
      </div>
    </button>
  );
};

export default PlayerCard;