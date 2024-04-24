import { SceneObjects } from 'old_src/scene';
import { UserData } from 'old_src/types.ts';
import './ScreenInfo.css';

export interface ScreenInfoProps {
  scene: SceneObjects;
}

export const ScreenInfo = (props: ScreenInfoProps) => {
  const { scene } = props;
  const { getScreenInfos, getShowScreenInfo } = scene;
  const screenInfos = getScreenInfos();

  if (!getShowScreenInfo()) {
    return null;
  }

  return (
    <>
      {Object.keys(screenInfos).map((key) => {
        const {
          position,
          color,
          value,
          size = { width: undefined, height: undefined },
          linkObject
        } = screenInfos[key];
        const userData = linkObject?.userData as UserData;
        if (
          linkObject &&
          (!linkObject.visible ||
            !linkObject.parent ||
            !userData.isVisibleFromCamera)
        ) {
          return null;
        }

        return (
          <div
            className="screenInfo"
            key={key}
            style={{
              // less performant
              // left: 0,
              // top: 0,
              // transform: `translate(calc(${position.x}px - 50%), calc(${position.y}px - 50%))`,
              // more performant
              left: position.x,
              top: position.y,
              transform: `translate(-50%, -50%)`,
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
