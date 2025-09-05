import React from 'react';

type Props = { 
  samDetected?: number; 
  returned?: number; 
};

const Badge: React.FC<{ 
  label: string; 
  value: number | undefined; 
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, icon, color }) => (
  <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl ${color} backdrop-blur-sm border border-white/20`}>
    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-white/80">{label}</p>
      <p className="text-2xl font-bold text-white">{value ?? 0}</p>
    </div>
  </div>
);

const TotalsBar: React.FC<Props> = ({ samDetected, returned }) => (
  <div className="glass-card-solid rounded-3xl p-6">
    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      Analysis Summary
    </h2>
    <div className="flex flex-wrap items-center gap-4">
      <Badge 
        label="SAM Detected" 
        value={samDetected} 
        icon={
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        color="bg-gradient-to-r from-blue-500 to-blue-600"
      />
      <Badge 
        label="Returned" 
        value={returned} 
        icon={
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
        color="bg-gradient-to-r from-purple-500 to-purple-600"
      />
    </div>
  </div>
);

export default TotalsBar;