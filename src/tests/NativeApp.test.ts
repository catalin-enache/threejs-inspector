import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/dom';
import patchThree, { defaultOrthographicCamera, defaultPerspectiveCamera, defaultScene } from 'lib/patchThree';
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
            updateInspector({
              camera: defaultOrthographicCamera
            });
          } else if (data.version === 2) {
            await waitFor(() => expect(patchThree.getCurrentCamera()).toBe(defaultOrthographicCamera));
            updateInspector({
              camera: defaultPerspectiveCamera
            });
          } else if (data.version === 3) {
            await waitFor(() => expect(patchThree.getCurrentCamera()).toBe(defaultPerspectiveCamera));
            unmountInspector();
          }
        }
      };

      const handleCPanelUnmounted: CPanelProps['onCPanelUnmounted'] = () => {
        cleanUp();
        done();
      };

      const { cleanUp, updateInspector, unmountInspector } = initNativeApp({
        autoNavControls: true,
        onCPanelUnmounted: handleCPanelUnmounted,
        onSetupEffect: handleSetupEffect
      });
    });
  });
});
