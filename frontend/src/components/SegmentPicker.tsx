import React from 'react';
import type { Segment } from '../types';

type Props = {
  segments: Segment[];
  selectedIndex: number | null;
  setSelectedIndex: (idx: number | null) => void;
};

const SegmentPicker: React.FC<Props> = ({ segments, selectedIndex, setSelectedIndex }) => {
  return (
    <div className="glass-card-solid rounded-3xl p-6 space-y-5">
      <h2 className="text-2xl font-bold gradient-text flex items-center gap-3">
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Segment Selection
      </h2>
      
      <div className="flex flex-col md:flex-row md:items-end gap-6">
        <div className="flex-1 space-y-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Choose a segment to inspect
          </label>
          <select
            value={selectedIndex !== null ? String(selectedIndex) : ''}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedIndex(v === '' ? null : parseInt(v, 10));
            }}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
          >
            <option value="">— Select a segment —</option>
            {segments.map((seg, i) => {
              const tag = seg.mapped_label || seg.label || '—';
              return (
                <option key={i} value={String(i)}>
                  {`Segment #${i + 1}`} • {tag}
                </option>
              );
            })}
          </select>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-blue-800">
            Available: <span className="font-bold text-lg">{segments.length}</span> segments
          </span>
        </div>
      </div>
      
      {selectedIndex !== null && (
        <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-200">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-green-800">
              Selected: <span className="font-bold">Segment #{selectedIndex + 1}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SegmentPicker;