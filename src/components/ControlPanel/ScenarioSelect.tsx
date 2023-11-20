import React, { useEffect, useState, useCallback } from 'react';
import ControlPanel from 'components/ControlPanel/index';
import { ScreenInfo } from 'components/ScreenInfo/ScreenInfo';
import { config } from 'src/config';
import { init, SceneObjects } from 'src/scene';
import './ControlPanel.css';

import Basic, { setConfig as BasicSetConfig } from 'scenarios/Basic/Basic';
import Project3DCoordOnCamera, {
  setConfig as Project3DCoordOnCameraSetConfig
} from 'scenarios/Project3DCoordOnCamera/Project3DCoordOnCamera';
import DotProduct, {
  setConfig as DotProductSetConfig
} from 'scenarios/DotProduct/DotProduct';

const scenarioMap = {
  Basic: {
    config: BasicSetConfig,
    run: Basic
  },
  Project3DCoordOnCamera: {
    config: Project3DCoordOnCameraSetConfig,
    run: Project3DCoordOnCamera
  },
  DotProduct: {
    config: DotProductSetConfig,
    run: DotProduct
  }
};

export const ScenarioSelect = () => {
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [sceneObjects, setSceneObjects] = useState<SceneObjects | null>(null);
  const searchParams = new URLSearchParams(window.location.search);
  const scenario = (searchParams.get('scenario') ||
    'Basic') as keyof typeof scenarioMap;

  useEffect(() => {
    if (!searchParams.get('scenario')) {
      searchParams.set('scenario', Object.keys(scenarioMap)[0]);
      window.location.search = searchParams.toString();
    }
  }, [searchParams]);

  const handleSceneChange = useCallback(
    (evt: React.ChangeEvent<HTMLSelectElement>) => {
      searchParams.set('scenario', evt.target.value);
      window.location.search = searchParams.toString();
    },
    [searchParams]
  );

  const toggleControlPanel = useCallback(() => {
    setShowControlPanel((state) => !state);
  }, []);

  useEffect(() => {
    console.log('scenario', scenario);
    const updatedConfig = scenarioMap[scenario].config({ ...config });
    setShowControlPanel(updatedConfig.controlPanelExpanded);
    const sceneObjects: SceneObjects = init(updatedConfig);
    scenarioMap[scenario].run(sceneObjects);
    setSceneObjects(sceneObjects);
  }, [scenario]);

  return (
    <>
      {sceneObjects && <ScreenInfo scene={sceneObjects} />}
      <div className="control">
        <div className="controlRow">
          <div
            className="rowTitle"
            style={{ cursor: 'pointer' }}
            onClick={toggleControlPanel}
          >
            {showControlPanel ? 'Collapse' : 'Expand'}
          </div>
          <div className="rowEntry">
            <select value={scenario} onChange={handleSceneChange}>
              {Object.keys(scenarioMap).map((scene) => (
                <option key={scene}>{scene}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {sceneObjects && showControlPanel && (
        <ControlPanel scene={sceneObjects} />
      )}
    </>
  );
};
