import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [cameraOn, setCameraOn] = useState(false);
  const handleCameraChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCameraOn(event.target.checked);
  };

  useEffect(() => {
    if (cameraOn) {
      window.config.switchCamera();
    } else {
      window.config.switchCamera();
    }
  });

  return (
    <div>
      <label>
        Switch Camera
        <input type="checkbox" onChange={handleCameraChange} />
      </label>
    </div>
  );
}

export default App;
