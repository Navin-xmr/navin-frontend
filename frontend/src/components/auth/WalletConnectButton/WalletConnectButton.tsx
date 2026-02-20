import React, { useState, useEffect } from 'react';
import {
    isConnected,
    getAddress,
    requestAccess,
} from '@stellar/freighter-api';
import { Wallet, LogOut, Download } from 'lucide-react';
import './WalletConnectButton.css';

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

    // Check if Freighter is installed and if we're already connected on mount
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

        return () => {
            mounted = false;
        };
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
        // Freighter doesn't have an explicit disconnect method in the API that clears permissions.
        // However, we clear our local state to effectively "log out" the user from our app's perspective.
        setAddress(null);
        if (onDisconnect) onDisconnect();
    };

    const truncateAddress = (addr: string) => {
        if (!addr) return '';
        return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
    };

    const buttonClasses = `wallet-connect-btn ${address ? 'connected' : 'disconnected'
        } ${className}`.trim();

    // State 1: Connected
    if (address) {
        return (
            <div className="wallet-connect-container">
                <button className={buttonClasses} disabled>
                    <Wallet size={18} className="icon wallet-icon" />
                    <span className="address-text">{truncateAddress(address)}</span>
                </button>
                <button
                    className="wallet-disconnect-btn"
                    onClick={handleDisconnect}
                    title="Disconnect wallet"
                    aria-label="Disconnect wallet"
                >
                    <LogOut size={16} className="icon disconnect-icon" />
                </button>
            </div>
        );
    }

    // State 2: Not Installed
    if (!hasFreighter) {
        return (
            <button className={`${buttonClasses} install-prompt`} onClick={handleConnect}>
                <Download size={18} className="icon install-icon" />
                <span>Install Freighter</span>
            </button>
        );
    }

    // State 3: Installed, Not Connected
    return (
        <button
            className={buttonClasses}
            onClick={handleConnect}
            disabled={isConnecting}
        >
            <Wallet size={18} className="icon wallet-icon" />
            <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
        </button>
    );
};
