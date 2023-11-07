/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */

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
