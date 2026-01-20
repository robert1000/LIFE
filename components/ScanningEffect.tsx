
import React from 'react';

const ScanningEffect: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-lg">
      <div className="w-full h-0.5 bg-cyan-400 opacity-80 shadow-[0_0_15px_#22d3ee] scan-line absolute left-0" />
      <div className="absolute inset-0 border-2 border-cyan-500/30 animate-pulse" />
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400" />
    </div>
  );
};

export default ScanningEffect;
