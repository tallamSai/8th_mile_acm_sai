
import React from 'react';

export function Logo() {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 rounded-full border-2 border-squid-red"></div>
        <div className="w-6 h-6 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <polygon 
              points="12,2 2,22 22,22" 
              fill="none"
              stroke="#ea384c"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="w-6 h-6 border-2 border-squid-red"></div>
      </div>
      <h1 className="text-2xl font-bold">Squid Game Challenge</h1>
    </div>
  );
}
