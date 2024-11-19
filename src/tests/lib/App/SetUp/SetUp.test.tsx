import { expect, describe, it, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-react';
import { TestApp, initDOM, clearDOM } from 'testutils/testApp';
import { defaultScene, defaultPerspectiveCamera } from 'lib/App/SetUp/patchThree';
import { OrbitControls as InternalOrbitControls } from 'lib/third_party/OrbitControls';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { SETUP_EFFECT, SetUpProps } from 'lib/App/SetUp/SetUp';

describe('SetUp', () => {
  beforeEach(() => {
    initDOM();
  });

  afterEach(() => {
    clearDOM();
  });

  it('Can be used with defaultScene and default(Perspective/Orthographic)Camera', { timeout: 1000 }, async () => {
    return new Promise<void>((done) => {
      const handleThreeChange: SetUpProps['onThreeChange'] = (changed, three) => {
        if (changed === 'scene') {
          const { scene } = three;
          expect(scene).toBe(defaultScene);
          expect(scene.__inspectorData.currentCamera).toBe(defaultPerspectiveCamera);
          res.unmount();
          done();
        }
      };
      const res = render(
        <TestApp
          useDreiOrbitControls={false}
          onThreeChange={handleThreeChange}
          useDefaultPerspectiveCamera={true}
          useDefaultScene={true}
        ></TestApp>,
        {
          container: document.getElementById('main')!
        }
      );
    });
  });

  it('Can be used with custom scene and camera', { timeout: 1000 }, async () => {
    return new Promise<void>((done) => {
      const handleThreeChange: SetUpProps['onThreeChange'] = (changed, three) => {
        if (changed === 'scene') {
          const { scene } = three;
          expect(scene).not.toBe(defaultScene);
          expect(scene.__inspectorData.currentCamera).not.toBe(defaultPerspectiveCamera);
          res.unmount();
          done();
        }
      };
      const res = render(<TestApp useDreiOrbitControls={false} onThreeChange={handleThreeChange}></TestApp>, {
        container: document.getElementById('main')!
      });
    });
  });

  it('Does not require OrbitControls', { timeout: 1000 }, async () => {
    return new Promise<void>((done) => {
      const handleSetupEffect: SetUpProps['onSetupEffect'] = (effect, data) => {
        if (effect === SETUP_EFFECT.ORBIT_CONTROLS) {
          expect(data.orbitControlsInUse).toBe(null);
          res.unmount();
          done();
        }
      };

      const res = render(
        <TestApp useDreiOrbitControls={false} autoNavControls={false} onSetupEffect={handleSetupEffect}></TestApp>,
        {
          container: document.getElementById('main')!
        }
      );
    });
  });

  it('Can use internal OrbitControls when autoNavControls is true', { timeout: 1000 }, async () => {
    return new Promise<void>((done) => {
      const handleSetupEffect: SetUpProps['onSetupEffect'] = (effect, data) => {
        if (effect === SETUP_EFFECT.ORBIT_CONTROLS) {
          expect(data.orbitControlsInUse).toBeInstanceOf(InternalOrbitControls);
          res.unmount();
          done();
        }
      };

      const res = render(
        <TestApp useDreiOrbitControls={false} autoNavControls={true} onSetupEffect={handleSetupEffect}></TestApp>,
        {
          container: document.getElementById('main')!
        }
      );
    });
  });

  it('Can be used with external OrbitControls', { timeout: 1000 }, async () => {
    return new Promise<void>((done) => {
      let calls = 0;
      const handleSetupEffect: SetUpProps['onSetupEffect'] = (effect, data) => {
        if (effect === SETUP_EFFECT.ORBIT_CONTROLS) {
          if (calls === 0) {
            expect(data.orbitControlsInUse).toBe(null);
          } else if (calls === 1) {
            expect(data.orbitControlsInUse).toBeInstanceOf(OrbitControlsImpl);
            res.unmount();
            done();
          }
          calls += 1;
        }
      };

      const res = render(
        <TestApp useDreiOrbitControls={true} autoNavControls={false} onSetupEffect={handleSetupEffect}></TestApp>,
        {
          container: document.getElementById('main')!
        }
      );
    });
  });

  it('Can be used with external OrbitControls even when autoNavControls is true', { timeout: 1000 }, async () => {
    return new Promise<void>((done) => {
      let calls = 0;
      const handleSetupEffect: SetUpProps['onSetupEffect'] = (effect, data) => {
        if (effect === SETUP_EFFECT.ORBIT_CONTROLS) {
          if (calls === 0) {
            expect(data.orbitControlsInUse).toBeInstanceOf(InternalOrbitControls);
          } else if (calls === 1) {
            expect(data.orbitControlsInUse).toBeInstanceOf(OrbitControlsImpl);
            res.unmount();
            done();
          }
          calls += 1;
        }
      };

      const res = render(
        <TestApp useDreiOrbitControls={true} autoNavControls={true} onSetupEffect={handleSetupEffect}></TestApp>,
        {
          container: document.getElementById('main')!
        }
      );
    });
  });
});
