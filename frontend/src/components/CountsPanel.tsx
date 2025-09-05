import React from 'react';

type Props = {
  counts: { resnet: Record<string, number>; mapped: Record<string, number> };
  candidateLabels: string[];
};

const tableCls = "min-w-full divide-y divide-gray-200";
const thTd = "px-4 py-3 text-sm";

const renderTable = (data: Record<string, number>, title: string) => {
  const rows = Object.entries(data).sort((a,b) => b[1]-a[1]);
  if (!rows.length) return (
    <div className="text-center py-8">
      <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p className="text-sm text-gray-500">No {title} counts available</p>
    </div>
  );
  
  return (
    <div className="overflow-x-auto">
      <table className={tableCls}>
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className={`${thTd} text-left font-semibold text-gray-700 w-2/3`}>Label</th>
            <th className={`${thTd} text-right font-semibold text-gray-700 w-1/3`}>Count</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map(([k,v]) => (
            <tr key={k} className="hover:bg-gray-50 transition-colors">
              <td className={`${thTd} font-medium text-gray-800 break-words`}>
                <div className="max-w-xs">
                  {k}
                </div>
              </td>
              <td className={`${thTd} text-right`}>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {v}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CountsPanel: React.FC<Props> = ({ counts, candidateLabels }) => {
  const [selected, setSelected] = React.useState<string>('');
  const mappedCount = selected ? (counts.mapped[selected] ?? 0) : null;
  
  return (
    <div className="glass-card-solid rounded-3xl p-6 space-y-6">
      <h2 className="text-2xl font-bold gradient-text flex items-center gap-3">
        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Detection Counts
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            Mapped Labels
          </h3>
          <div className="border border-gray-200 rounded-2xl p-4 bg-white/50 backdrop-blur-sm">
            {renderTable(counts.mapped, 'mapped')}
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            ResNet Predictions
          </h3>
          <div className="border border-gray-200 rounded-2xl p-4 bg-white/50 backdrop-blur-sm">
            {renderTable(counts.resnet, 'ResNet')}
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Check Specific Label Count
        </label>
        <div className="flex items-center gap-4">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl min-w-[250px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">— Select a candidate label —</option>
            {candidateLabels.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          
          {selected && (
            <div className="flex items-center gap-3 px-4 py-2 bg-green-100 rounded-xl border border-green-200">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-green-800">
                Count: <span className="text-lg font-bold">{mappedCount}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountsPanel;