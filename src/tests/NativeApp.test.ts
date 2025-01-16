import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/dom';
import { defaultOrthographicCamera, defaultPerspectiveCamera, defaultScene } from 'lib/patchThree';
import { useAppStore } from 'src/store';
import { CPanelProps } from 'components/CPanel/CPanel';
import { initNativeApp } from 'testutils/testNativeApp';
import { SETUP_EFFECT, SetUpProps } from 'components/SetUp/SetUp';

describe('injectInspector', () => {
  beforeEach(() => {});

  afterEach(() => {
    defaultScene.clear();
    useAppStore.getState().reset();
  });

  it('injects Inspector and provides updateInspector and unmountInspector', { timeout: 1000 }, async () => {
    return new Promise<void>((done) => {
      const handleSetupEffect: SetUpProps['onSetupEffect'] = async (effect, data) => {
        if (effect === SETUP_EFFECT.VERSION_CHANGED) {
          if (data.version === 1) {
            setTimeout(() => {
              updateInspector({
                camera: defaultOrthographicCamera
              });
            }, 0);
            await waitFor(() => expect(scene.__inspectorData.currentCamera).toBe(defaultOrthographicCamera));
          } else if (data.version === 2) {
            setTimeout(() => {
              updateInspector({
                camera: defaultPerspectiveCamera
              });
            }, 0);
            await waitFor(() => expect(scene.__inspectorData.currentCamera).toBe(defaultPerspectiveCamera));
          } else if (data.version === 3) {
            setTimeout(() => {
              unmountInspector();
            }, 0);
          }
        }
      };

      const handleCPanelUnmounted: CPanelProps['onCPanelUnmounted'] = () => {
        cleanUp();
        done();
      };

      const { cleanUp, updateInspector, unmountInspector, scene } = initNativeApp({
        autoNavControls: true,
        onCPanelUnmounted: handleCPanelUnmounted,
        onSetupEffect: handleSetupEffect
      });
    });
  });
});
