export type SceneSize = {
  width: number;
  height: number;
};

export type Config = {
  cameraType: 'perspective' | 'orthographic';
  orthographicCameraRatio: number;
};

export const config: Config = {
  cameraType: 'perspective',
  orthographicCameraRatio: 300
};
