import { SceneObjects } from 'src/scene';
import './ScreenInfo.css';

export interface ScreenInfoProps {
  scene: SceneObjects;
}

export const ScreenInfo = (props: ScreenInfoProps) => {
  const { scene } = props;
  const { getScreenInfos } = scene;
  const screenInfos = getScreenInfos();

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
