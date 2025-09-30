import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { AOClient } from '../lib/aoconnect';

interface PointsDisplayProps {
  aoClient: AOClient;
  onRefresh?: () => void;
}

export interface PointsDisplayRef {
  fetchPoints: () => void;
}

const PointsDisplay = forwardRef<PointsDisplayRef, PointsDisplayProps>(({ aoClient, onRefresh }, ref) => {
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPoints = async () => {
    if (!aoClient) return;

    setLoading(true);
    try {
      const res = await aoClient.getPoints();
      if (res.success && res.data && res.data.points) setPoints(res.data.points);
    } catch (err) {
      console.error('Failed to fetch points:', err);
    } finally {
      setLoading(false);
    }
  };

  // Expose fetchPoints to parent component
  useImperativeHandle(ref, () => ({
    fetchPoints
  }));

  // Auto-refresh when aoClient changes (only once)
  useEffect(() => {
    if (aoClient) {
      fetchPoints();
    }
  }, [aoClient]);

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 p-4 sm:p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-white">Points</h3>
      </div>

      <div className="text-center mb-6">
        {loading ? (
          <div className="flex items-center justify-center mb-2">
            <div className="w-6 h-6 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {points.toLocaleString()}
          </div>
        )}
        <p className="text-gray-400 text-sm">
          {loading ? 'Loading points...' : 'Total points earned'}
        </p>
      </div>
    </div>
  );
});

export default React.memo(PointsDisplay);

