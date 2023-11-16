import React, { useEffect, useState, useCallback } from 'react';
import ControlPanel from 'components/ControlPanel/index.ts';
import { config } from 'src/config.ts';
import { init, SceneObjects } from 'src/scene.ts';
import './ControlPanel.css';

import basic, { setConfig as basicSetConfig } from 'scenarios/basic/basic.ts';
import second, {
  setConfig as secondSetConfig
} from 'scenarios/second/second.ts';

const scenarioMap = {
  basic: {
    config: basicSetConfig,
    run: basic
  },
  second: {
    config: secondSetConfig,
    run: second
  }
};

export const ScenarioSelect = () => {
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [sceneObjects, setSceneObjects] = useState<SceneObjects | null>(null);
  const searchParams = new URLSearchParams(window.location.search);
  const scenario = (searchParams.get('scenario') ||
    'basic') as keyof typeof scenarioMap;

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
    const sceneObjects: SceneObjects = init(updatedConfig);
    scenarioMap[scenario].run(sceneObjects);
    setSceneObjects(sceneObjects);
  }, [scenario]);

  return (
    <>
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
