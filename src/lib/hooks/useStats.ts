// @ts-ignore
import Stats from 'three/addons/libs/stats.module.js';
import { useFrame } from '@react-three/fiber';
import { useEffect } from 'react';

const stats = new Stats();
const noop = () => {};
const updateStats = stats.update.bind(stats);

interface useStatsProps {
  enabled?: boolean;
}
export const useStats = ({ enabled = true }: useStatsProps = {}) => {
  useFrame(enabled ? updateStats : noop);

  useEffect(() => {
    if (enabled && !stats.dom.parentElement) {
      document.body.appendChild(stats.dom);
      return () => {
        document.body.removeChild(stats.dom);
      };
    }
  }, [enabled]);
};
