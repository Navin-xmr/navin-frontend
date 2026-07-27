import React from 'react';
import { useWallet } from '../../context/WalletContext';

const NetworkBadge: React.FC = () => {
  const { network } = useWallet();

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
        network === 'mainnet'
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
      }`}
      title={`Connected to Stellar ${network}`}
    >
      {network}
    </span>
  );
};

export default NetworkBadge;
