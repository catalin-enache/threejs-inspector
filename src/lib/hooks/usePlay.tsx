import { useMemo, useRef } from 'react';
import { RootState, useFrame } from '@react-three/fiber';
import { type AppStore, useAppStore } from 'src/store';
// import { getCPanel } from 'lib/utils/lazyLoaders';

let lastState: RootState;
let lastXFrame: XRFrame | undefined;
const noop = (_playingState: AppStore['playingState'], _state: RootState, _delta: number, _xrFrame?: XRFrame) => {
  lastState = _state;
  lastXFrame = _xrFrame;
};

/**
 * usePlay hook allows to run a callback on every frame when the app is in 'playing' state.
 * It also provides the current playing state, which can be 'playing', 'paused', or 'stopped'.
 * The state can be set using the api.setPlayingState and read from api.getPlayingState.
 * api.registerDefaultPlayTriggers (space & backspace) is also provided for convenience.
 */
export const usePlay = (
  callback: (playingState: AppStore['playingState'], state: RootState, delta: number, xrFrame?: XRFrame) => void,
  renderPriority = 0,
  deps: any[] = []
) => {
  const playingState = useAppStore((state) => state.playingState);

  const depsRef = useRef(deps);
  const callbackRef = useRef(callback);
  const playingStateRef = useRef(playingState);

  // if deps changed update callback
  for (let i = 0; i < deps.length; i++) {
    if (deps[i] !== depsRef.current[i]) {
      callbackRef.current = callback;
      break;
    }
  }

  const playingStateChanged = playingState !== playingStateRef.current;

  depsRef.current = deps;
  playingStateRef.current = playingState;

  const boundCallback = useMemo(
    () => callbackRef.current.bind(null, playingState),
    [callbackRef.current, playingState]
  );
  const boundNoop = useMemo(() => noop.bind(null, playingState), [playingState]);

  if (playingStateChanged && ['paused', 'stopped'].includes(playingState) && lastState) {
    boundCallback(lastState, 0, lastXFrame);
  }

  useFrame(playingState === 'playing' ? boundCallback : boundNoop, renderPriority);

  // const boundCallbackRef = useRef(boundCallback);
  // const boundNoopRef = useRef(boundNoop);
  // const _cbRef = useRef((_state: RootState, _delta: number, _xrFrame?: _XRFrame) => {
  //   playingStateRef.current === 'playing'
  //     ? boundCallbackRef.current(_state, _delta, _xrFrame)
  //     : boundNoopRef.current(_state, _delta, _xrFrame);
  // });

  // useFrame(_cbRef.current, renderPriority);
};
