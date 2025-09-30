import React, { useState, useEffect } from 'react';
import { AOClient } from '../lib/aoconnect';

interface LeaderboardEntry {
  userId: string;
  points: number;
}

interface LeaderboardProps {
  aoClient: AOClient;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ aoClient }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const fetchLeaderboard = async () => {
    if (!aoClient) return;
    
    setLoading(true);
    try {
      const res = await aoClient.getLeaderboard();
      if (res.success && res.data && res.data.leaderboard) {
        setLeaderboard(res.data.leaderboard);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh when aoClient changes (only once)
  useEffect(() => {
    if (aoClient) {
      fetchLeaderboard();
    }
  }, [aoClient]);

  return (
    <div className="leaderboard">
      <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-gray-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">Leaderboard</h2>
              <p className="text-sm text-gray-400">Top performers by points</p>
            </div>
          </div>
          <button 
            onClick={fetchLeaderboard} 
            disabled={loading}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors self-start sm:self-auto"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-2">No leaderboard data yet</p>
            <p className="text-sm text-gray-500">Start creating and completing tasks to see rankings!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div 
                key={entry.userId}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                  index === 0 ? 'bg-yellow-500/10 border-yellow-500/30' : 
                  index === 1 ? 'bg-gray-400/10 border-gray-400/30' :
                  index === 2 ? 'bg-orange-500/10 border-orange-500/30' :
                  'bg-gray-800/30 border-gray-700/50'
                }`}
              >
                
                {/* Rank and Medal (Mobile: Full width, Desktop: Left side) */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    index === 0 ? 'bg-yellow-500 text-yellow-900' :
                    index === 1 ? 'bg-gray-400 text-gray-900' :
                    index === 2 ? 'bg-orange-500 text-orange-900' :
                    'bg-gray-600 text-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* Medal for top 3 */}
                  {index < 3 && (
                    <div className="text-2xl flex-shrink-0">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                  )}
                </div>

                {/* User Info (Mobile: Full width, Desktop: Flexible) */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        {entry.userId.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {formatAddress(entry.userId)}
                      </p>
                      <p className="text-xs text-gray-400 truncate hidden sm:block">
                        {entry.userId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Points (Mobile: Right aligned, Desktop: Right side) */}
                <div className="text-right sm:text-right flex-shrink-0">
                  <div className="text-lg font-bold text-white">
                    {entry.points.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {entry.points === 1 ? 'point' : 'points'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {leaderboard.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{leaderboard.length}</div>
                <div className="text-sm text-gray-400">Total Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {leaderboard.length > 0 && leaderboard[0]?.points ? leaderboard[0].points.toLocaleString() : '0'}
                </div>
                <div className="text-sm text-gray-400">Highest Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {leaderboard.length > 0 ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.points, 0) / leaderboard.length).toLocaleString() : '0'}
                </div>
                <div className="text-sm text-gray-400">Average Score</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Leaderboard);

