import * as THREE from 'three';
import patchThree from 'lib/patchThree';
import { useEffect, useMemo, memo } from 'react';

export const SceneSizeHelper = memo(() => {
  const { sceneBBox, currentScene } = patchThree;
  const boxHelper = useMemo(() => {
    return new THREE.Box3Helper(sceneBBox, new THREE.Color().setHex(0xffff00));
  }, [sceneBBox]);
  boxHelper.name = 'SceneSizeHelper';

  useEffect(() => {
    currentScene.add(boxHelper);
    return () => {
      boxHelper.removeFromParent();
      boxHelper.dispose();
    };
  }, [boxHelper, currentScene]);
  return null;
});

SceneSizeHelper.displayName = 'SceneSizeHelper';
