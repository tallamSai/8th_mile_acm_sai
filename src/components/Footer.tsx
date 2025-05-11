
import React from 'react';

export function Footer() {
  return (
    <footer className="p-4 text-center text-sm text-muted-foreground border-t border-squid-red">
      <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row justify-between items-center">
        <p>© 2025 Squid Game Challenge</p>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <div className="w-3 h-3 rounded-full bg-squid-red"></div>
          <div className="w-3 h-3 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <polygon 
                points="6,1 1,11 11,11" 
                fill="#ea384c"
              />
            </svg>
          </div>
          <div className="w-3 h-3 bg-squid-red"></div>
        </div>
      </div>
    </footer>
  );
}
