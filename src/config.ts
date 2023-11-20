export type SceneSize = {
  width: number;
  height: number;
};

export type Config = {
  cameraType: 'perspective' | 'orthographic';
  orthographicCameraRatio: number;
  controlPanelExpanded: boolean;
};

export const config: Config = {
  cameraType: 'perspective',
  orthographicCameraRatio: 100,
  controlPanelExpanded: true
};
