import './ScreenInfo.css';
import { useCallback, useEffect, useState } from 'react';
import { EVENT_TYPE, SCREEN_INFO_EVENT_TYPE } from 'src/constants.ts';
import { SceneObjects } from 'src/scene.ts';

export interface ScreenInfoProps {
  scene: SceneObjects;
}

export const ScreenInfo = (props: ScreenInfoProps) => {
  const { scene } = props;
  const { getScreenInfos } = scene;
  const screenInfos = getScreenInfos();

  const [, setUpdateNow] = useState(0);
  const forceUpdate = useCallback(
    () =>
      setUpdateNow((state) => {
        return (state + 1) % 3;
      }),
    []
  );

  // const continuousUpdate = useCallback(() => {
  //   forceUpdate();
  //   requestAnimationFrame(continuousUpdate);
  // }, []);

  useEffect(() => {
    window.addEventListener(EVENT_TYPE.SCREEN_INFO, (e: any) => {
      if (e.detail.type === SCREEN_INFO_EVENT_TYPE.REFRESH_POSITION) {
        forceUpdate();
      } else if (e.detail.type === SCREEN_INFO_EVENT_TYPE.VALUE_CHANGED) {
        forceUpdate();
      }
    });
  }, []);

  return (
    <>
      {Object.keys(screenInfos).map((key) => {
        const {
          position,
          color,
          value,
          size = { width: undefined, height: undefined }
        } = screenInfos[key];
        return (
          <div
            key={key}
            style={{
              fontSize: '10px',
              pointerEvents: 'none',
              display: 'flex',
              placeContent: 'center',
              flexFlow: 'column',
              userSelect: 'none',
              position: 'fixed',
              transform: `translate(calc(${position.x}px - 50%), calc(${position.y}px - 50%))`,
              top: 0,
              left: 0,
              width: size.width || 'auto',
              height: size.height || 'auto',
              backgroundColor: color.bg,
              color: color.fg
            }}
          >
            <pre style={{ display: 'inline', margin: 'auto' }}>{value}</pre>
          </div>
        );
      })}
    </>
  );
};
