import React, { useState, useEffect, useRef } from 'react';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

declare global {
  interface Window {
    arweaveWallet: {
      connect: (permissions: string[]) => Promise<void>;
      disconnect: () => Promise<void>;
      getActiveAddress: () => Promise<string>;
    };
  }
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect, onDisconnect }) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const truncateAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const copyAddress = async () => {
    if (wallet) {
      try {
        await navigator.clipboard.writeText(wallet);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
    setShowDropdown(false);
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.arweaveWallet) {
      setConnecting(true);
      try {
        await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION']);
        const address = await window.arweaveWallet.getActiveAddress();
        setWallet(address);
        setConnected(true);
        onConnect?.(address);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      } finally {
        setConnecting(false);
      }
    } else {
      alert('Please install ArConnect or another Arweave wallet extension');
    }
  };

  const disconnectWallet = async () => {
    try {
      setConnecting(true);
      await window.arweaveWallet.disconnect();
      setWallet(null);
      setConnected(false);
      setShowDropdown(false);
      onDisconnect?.();
      setConnecting(false);
    } catch (error: any) {
      setConnecting(false);
    }
  };

  const checkConnection = async () => {
    try {
      const addr = await window.arweaveWallet.getActiveAddress();
      setWallet(addr);
      setConnected(true);
      onConnect?.(addr);
    } catch (error: any) {
      setWallet(null);
      setConnected(false);
    }
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="wallet-connect" ref={dropdownRef}>
      {!connected ? (
        <button 
          onClick={connectWallet} 
          disabled={connecting}
          className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {connecting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="relative">
          {/* Wallet Address Button */}
          <button 
            onClick={toggleDropdown} 
            className="flex items-center gap-3 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl text-gray-300 font-medium transition-all duration-200"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm">{truncateAddress(wallet)}</span>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-auto bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-50">
              <div className="p-4">
                {/* Wallet Info */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {wallet?.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Connected Wallet</p>
                      <p className="text-xs text-gray-400">{truncateAddress(wallet)}</p>
                    </div>
                  </div>
                </div>

                {/* Copy Address */}
                <button 
                  onClick={copyAddress} 
                  className="w-full flex items-center text-left text-sm gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Address
                </button>

                {/* Disconnect */}
                <button 
                  onClick={disconnectWallet} 
                  disabled={connecting}
                  className="w-full flex items-center text-left text-sm gap-3 px-3 py-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {connecting ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  )}
                  {connecting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
