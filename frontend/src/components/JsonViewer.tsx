import React from 'react';

const JsonViewer: React.FC<{ data: any }> = ({ data }) => {
  return (
    <details className="glass-card-solid rounded-3xl p-6 group">
      <summary className="cursor-pointer select-none text-xl font-bold gradient-text flex items-center gap-3 hover:text-blue-600 transition-colors">
        <svg className="w-6 h-6 text-blue-500 group-open:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Raw JSON Data
      </summary>
      <div className="mt-6 p-6 bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">API Response</h4>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Live Data
          </div>
        </div>
        <pre className="text-xs text-gray-100 overflow-auto max-h-96 leading-relaxed font-mono">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </details>
  );
};

export default JsonViewer;