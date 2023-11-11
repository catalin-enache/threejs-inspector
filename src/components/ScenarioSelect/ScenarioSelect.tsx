import React, { useEffect, useState } from 'react';

// import basic from 'scenarios/basic/basic';

const scenarioMap = {
  one: () => {
    console.log('one');
  },
  two: () => {
    console.log('two');
  }
  // basic
};

export const ScenarioSelect = () => {
  const [scenario, setScenario] = useState('one');
  const handleSceneChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    setScenario(evt.target.value);
  };

  useEffect(() => {
    console.log('scenario', scenario);
    scenarioMap[scenario as keyof typeof scenarioMap]();
  }, [scenario]);

  return (
    <div>
      <div>Scene Select</div>
      <select value={scenario} onChange={handleSceneChange}>
        {Object.keys(scenarioMap).map((scene) => (
          <option key={scene}>{scene}</option>
        ))}
      </select>
    </div>
  );
};
