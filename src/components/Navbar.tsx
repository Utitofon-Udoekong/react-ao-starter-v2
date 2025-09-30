import React from 'react';
import WalletConnect from './WalletConnect';

interface NavbarProps {
  handleWalletConnect: (connectedWallet: string) => void;
  handleWalletDisconnect: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ handleWalletConnect, handleWalletDisconnect }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
      <div className="container mx-auto px-4 py-3 sm:py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 flex-shrink-0">
              <span className="text-lg sm:text-xl">⚡</span>
            </div>
            <div className="hidden sm:block min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                TaskMaster
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                Decentralized task management
              </p>
            </div>
          </div>
          
          {/* Wallet Connect */}
          <div className="flex items-center flex-shrink-0 ml-2">
            <WalletConnect onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;