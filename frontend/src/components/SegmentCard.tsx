import React, { useMemo } from 'react';
import type { Segment } from '../types';
import { baseURL } from '../api/http';
import { formatPercent, resolveStaticUrl, round3 } from '../utils';

const Chip: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = "bg-blue-100 text-blue-800" }) => (
  <span className={`inline-block text-xs px-3 py-1.5 rounded-full font-medium ${color}`}>
    {children}
  </span>
);

function topN(obj: Record<string, number>, n: number) {
  return Object.entries(obj).sort((a,b) => b[1]-a[1]).slice(0, n);
}

const SegmentCard: React.FC<{ segment: Segment; index: number }> = ({ segment, index }) => {
  const src = useMemo(() => resolveStaticUrl(segment.mask_path, baseURL), [segment.mask_path]);
  const zsTop3 = topN(segment.zeroshot_scores || {}, 3);
  const rnTop5 = topN(segment.resnet_probs || {}, 5);

  return (
    <div className="glass-card-solid rounded-3xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            #{index}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Segment {index}</h3>
            <p className="text-sm text-gray-500">Detection confidence: {round3(segment.box.score)}</p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div>Box: ({segment.box.x1}, {segment.box.y1})</div>
          <div>to ({segment.box.x2}, {segment.box.y2})</div>
        </div>
      </div>

      {/* Segment Image */}
      <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200">
        <img src={src} className="max-w-full max-h-full object-contain" alt={`Segment ${index} mask`} />
      </div>

      {/* Labels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ResNet Label
          </h4>
          <div className="text-lg font-bold text-blue-800">
            {segment.label ?? '—'}
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-purple-700 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Mapped Label
          </h4>
          <div className="text-lg font-bold text-purple-800">
            {segment.mapped_label ?? '—'}
          </div>
        </div>
      </div>

      {/* Zero-shot Scores */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Zero-shot Top 3
        </h4>
        <div className="flex flex-wrap gap-2">
          {zsTop3.length ? zsTop3.map(([k,v], i) => (
            <Chip key={k} color={i === 0 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
              {k}: {formatPercent(v)}
            </Chip>
          )) : (
            <span className="text-sm text-gray-400 italic">No zero-shot scores available</span>
          )}
        </div>
      </div>

      {/* ResNet Probabilities */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          ResNet Top 5
        </h4>
        <div className="flex flex-wrap gap-2">
          {rnTop5.length ? rnTop5.map(([k,v], i) => (
            <Chip key={k} color={i === 0 ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}>
              {k}: {(v*100).toFixed(1)}%
            </Chip>
          )) : (
            <span className="text-sm text-gray-400 italic">No ResNet probabilities available</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SegmentCard;