import React from 'react';
import { Trophy, Target, Star, Users, CheckCircle, ArrowRight } from 'lucide-react';

const HowToPlay = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 sm:p-8 border border-purple-500/20">
          <div className="flex items-center mb-6">
            <Trophy className="h-8 w-8 text-yellow-400 mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">How to Play</h1>
          </div>

          <div className="space-y-8">
            {/* Overview */}
            <div className="bg-white/5 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                <Star className="h-6 w-6 text-yellow-400 mr-2" />
                Game Overview
              </h2>
              <p className="text-purple-200 leading-relaxed">
                Pick5 is an exciting cricket prediction game where you select 5 players from a match and win ₹10,000 if all your players beat their target scores!
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Target className="h-5 w-5 text-green-400 mr-2" />
                  Step 1: Pick Your Match
                </h3>
                <ul className="text-purple-200 space-y-2">
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 mt-0.5 text-purple-400" />
                    Choose from upcoming cricket matches displayed on your dashboard
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 mt-0.5 text-purple-400" />
                    Each match has specific player targets based on their recent form
                  </li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Users className="h-5 w-5 text-blue-400 mr-2" />
                  Step 2: Select Your Team
                </h3>
                <ul className="text-purple-200 space-y-2">
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 mt-0.5 text-purple-400" />
                    Pick exactly 5 players from either team
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 mt-0.5 text-purple-400" />
                    Each player has a target score (runs or wickets)
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 mt-0.5 text-purple-400" />
                    You can update your team until the match starts
                  </li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  Step 3: Win Big!
                </h3>
                <ul className="text-purple-200 space-y-2">
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 mt-0.5 text-purple-400" />
                    If all 5 players beat their targets, you win ₹10,000!
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 mt-0.5 text-purple-400" />
                    Track your selections live during the match
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 mt-0.5 text-purple-400" />
                    Results are updated immediately after the match
                  </li>
                </ul>
              </div>
            </div>

            {/* Example */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
              <h2 className="text-xl font-semibold text-white mb-4">Example</h2>
              <div className="space-y-4">
                <p className="text-purple-200">
                  Let's say you pick Virat Kohli with a target of 30 runs:
                </p>
                <ul className="text-purple-200 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-400" />
                    If Kohli scores 35 runs, you get one pick right!
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-400" />
                    Do this with all 5 picks to win ₹10,000
                  </li>
                </ul>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white/5 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Pro Tips</h2>
              <ul className="text-purple-200 space-y-2">
                <li className="flex items-start">
                  <Star className="h-5 w-5 mr-2 mt-0.5 text-yellow-400" />
                  Consider player form and match conditions
                </li>
                <li className="flex items-start">
                  <Star className="h-5 w-5 mr-2 mt-0.5 text-yellow-400" />
                  Mix batsmen and bowlers for better chances
                </li>
                <li className="flex items-start">
                  <Star className="h-5 w-5 mr-2 mt-0.5 text-yellow-400" />
                  Check the leaderboard to see winning strategies
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToPlay;