export const setFullScreen = (isFullScreen: boolean) => {
  const fullScreenOn = document.documentElement;
  const fullscreenElement =
    // @ts-ignore
    document.fullscreenElement || document.webkitFullscreenElement;

  const requestFullscreen =
    // prettier-ignore
    // @ts-ignore
    (fullScreenOn.requestFullscreen || fullScreenOn.webkitRequestFullscreen).bind(fullScreenOn);
  const exitFullscreen =
    // prettier-ignore
    // @ts-ignore
    (document.exitFullscreen || document.webkitExitFullscreen).bind(document);

  if (!fullscreenElement && isFullScreen) {
    requestFullscreen();
  } else {
    fullscreenElement && exitFullscreen();
  }
};
