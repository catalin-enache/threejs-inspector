import { useEffect } from 'react';
import { injectStats } from 'lib/utils/injectStats';

interface useStatsProps {
  enabled?: boolean;
}

export const useStats = ({ enabled = true }: useStatsProps = {}) => {
  useEffect(() => {
    if (!enabled) return;
    return injectStats();
  }, [enabled]);
};
