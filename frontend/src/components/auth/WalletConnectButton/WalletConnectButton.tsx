import React, { useState, useEffect } from 'react';
import {
    isConnected,
    getAddress,
    requestAccess,
} from '@stellar/freighter-api';
import { Wallet, LogOut, Download } from 'lucide-react';

export interface WalletConnectButtonProps {
    className?: string;
    onConnect?: (address: string) => void;
    onDisconnect?: () => void;
}

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
    className = '',
    onConnect,
    onDisconnect,
}) => {
    const [hasFreighter, setHasFreighter] = useState<boolean>(false);
    const [address, setAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState<boolean>(false);

    useEffect(() => {
        let mounted = true;
        const checkFreighter = async () => {
            try {
                const isFreighterInstalled = await isConnected();
                if (mounted) {
                    if (isFreighterInstalled.isConnected) {
                        setHasFreighter(true);
                        const response = await getAddress();
                        if (response.address) {
                            setAddress(response.address);
                            if (onConnect) onConnect(response.address);
                        }
                    } else {
                        setHasFreighter(false);
                    }
                }
            } catch (error) {
                console.error('Error checking Freighter status:', error);
            }
        };
        checkFreighter();
        return () => { mounted = false; };
    }, [onConnect]);

    const handleConnect = async () => {
        if (!hasFreighter) {
            window.open('https://www.freighter.app/', '_blank');
            return;
        }
        try {
            setIsConnecting(true);
            const access = await requestAccess();
            if (access && access.address) {
                setAddress(access.address);
                if (onConnect) onConnect(access.address);
            }
        } catch (error) {
            console.error('Error connecting to Freighter:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = () => {
        setAddress(null);
        if (onDisconnect) onDisconnect();
    };

    const truncateAddress = (addr: string) => {
        if (!addr) return '';
        return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
    };

    // State 1: Connected
    if (address) {
        return (
            <div className={`flex items-center gap-2 font-sans ${className}`}>
                <button
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[0.95rem] font-semibold cursor-default transition-all border border-gray-200 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                    disabled
                >
                    <Wallet size={18} className="shrink-0" />
                    <span className="font-mono tracking-wide">{truncateAddress(address)}</span>
                </button>
                <button
                    className="flex items-center justify-center p-2.5 rounded-xl cursor-pointer transition-all border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 hover:-translate-y-px active:translate-y-px dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/20"
                    onClick={handleDisconnect}
                    title="Disconnect wallet"
                    aria-label="Disconnect wallet"
                >
                    <LogOut size={16} className="shrink-0" />
                </button>
            </div>
        );
    }

    // State 2: Not Installed
    if (!hasFreighter) {
        return (
            <button
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[0.95rem] font-semibold cursor-pointer transition-all border-none bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_4px_6px_-1px_rgba(59,130,246,0.2),0_2px_4px_-1px_rgba(59,130,246,0.1)] hover:from-blue-600 hover:to-blue-700 hover:-translate-y-px hover:shadow-[0_6px_8px_-1px_rgba(59,130,246,0.3)] active:translate-y-px ${className}`}
                onClick={handleConnect}
            >
                <Download size={18} className="shrink-0" />
                <span>Install Freighter</span>
            </button>
        );
    }

    // State 3: Installed, Not Connected
    return (
        <button
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[0.95rem] font-semibold cursor-pointer transition-all border-none bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_4px_6px_-1px_rgba(16,185,129,0.2),0_2px_4px_-1px_rgba(16,185,129,0.1)] hover:from-emerald-600 hover:to-emerald-700 hover:-translate-y-px hover:shadow-[0_6px_8px_-1px_rgba(16,185,129,0.3)] active:translate-y-px disabled:cursor-default ${className}`}
            onClick={handleConnect}
            disabled={isConnecting}
        >
            <Wallet size={18} className="shrink-0" />
            <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
        </button>
    );
};
