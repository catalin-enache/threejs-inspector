import React, { useEffect, useState } from 'react';

// import basic from 'scenarios/basic/basic';

const sceneMap = {
  one: () => {
    console.log('one');
  },
  two: () => {
    console.log('two');
  }
  // basic
};

export const SceneSelect = () => {
  const [scene, setScene] = useState('one');
  const handleSceneChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    setScene(evt.target.value);
  };

  useEffect(() => {
    console.log('scene', scene);
    sceneMap[scene as keyof typeof sceneMap]();
  }, [scene]);

  return (
    <div>
      <div>Scene Select</div>
      <select value={scene} onChange={handleSceneChange}>
        {Object.keys(sceneMap).map((scene) => (
          <option key={scene}>{scene}</option>
        ))}
      </select>
    </div>
  );
};
