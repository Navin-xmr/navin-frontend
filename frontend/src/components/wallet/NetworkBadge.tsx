import React from 'react';
import { useWallet } from '../../context/WalletContext';
import Tag from '../ui/Tag';

const NetworkBadge: React.FC = () => {
  const { network } = useWallet();
  const variant = network === 'mainnet' ? 'success' : 'warning';

  return (
    <Tag
      label={network}
      variant={variant}
      size="sm"
      dot
      className="uppercase tracking-wide"
    />
  );
};

export default NetworkBadge;
