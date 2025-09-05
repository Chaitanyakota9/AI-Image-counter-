import React, { useEffect, useState } from 'react';
import { health } from '../api/backend';

const HealthDot: React.FC<{ ok: boolean | null }> = ({ ok }) => {
  const color = ok ? 'bg-green-400' : ok === false ? 'bg-red-400' : 'bg-gray-400';
  const label = ok ? 'Healthy' : ok === false ? 'Unhealthy' : 'Unknown';
  const bgColor = ok ? 'bg-green-500/20' : ok === false ? 'bg-red-500/20' : 'bg-gray-500/20';
  
  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${bgColor} backdrop-blur-sm border border-white/20`} title={`Backend health: ${label}`}>
      <span className={`inline-block w-3 h-3 rounded-full ${color} animate-pulse`} />
      <span className="text-white font-medium text-sm">{label}</span>
    </div>
  );
};

const Header: React.FC = () => {
  const [ok, setOk] = useState<boolean | null>(null);
  
  useEffect(() => {
    (async () => {
      try {
        const res = await health();
        setOk(res.status === 'ok');
      } catch {
        setOk(false);
      }
    })();
  }, []);
  
  return (
    <header className="glass-card sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <h1 className="text-3xl font-bold gradient-text">Vision Pipeline</h1>
        </div>
        <HealthDot ok={ok} />
      </div>
    </header>
  );
};

export default Header;