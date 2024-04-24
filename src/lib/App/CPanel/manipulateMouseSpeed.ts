const lerp = (start: number, end: number, t: number) =>
  start + (end - start) * t;

let initialPivotX = 0;
let currentPivotX = 0;
let clientX = 0;
let newClientX = 0;
let cumulatedDistanceX = 0;
let isMetaKey = false;

const commonOpsOnMetaKey = () => {
  currentPivotX = clientX;
  cumulatedDistanceX = newClientX - initialPivotX;
};

document.addEventListener('keydown', (e) => {
  // prettier-ignore
  if ([e.code].some((code) => code.startsWith('Control') || code.startsWith('Shift')) && !isMetaKey) {
    isMetaKey = true;
    commonOpsOnMetaKey();
  }
});
document.addEventListener('keyup', (e) => {
  // prettier-ignore
  if ([e.code].some((code) => code.startsWith('Control') || code.startsWith('Shift')) && isMetaKey) {
    isMetaKey = false;
    commonOpsOnMetaKey();
  }
});

const handleMouseMove = (e: MouseEvent) => {
  if (!e.isTrusted) return e;
  e.stopPropagation();

  const distanceToCurrentPivotX = e.clientX - currentPivotX;
  const biggerDistanceToCurrentPivotX = lerp(0, 2, distanceToCurrentPivotX);
  const smallerDistanceToCurrentPivotX = lerp(0, 0.25, distanceToCurrentPivotX);
  const newDistanceToCurrentPivotX = e.ctrlKey
    ? biggerDistanceToCurrentPivotX
    : e.shiftKey
      ? smallerDistanceToCurrentPivotX
      : distanceToCurrentPivotX;

  newClientX = initialPivotX + cumulatedDistanceX + newDistanceToCurrentPivotX;
  clientX = e.clientX;

  const event = new MouseEvent('mousemove', {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: newClientX,
    clientY: e.clientY
  });

  e.target?.dispatchEvent(event);
};

const handleMouseUp = (e: MouseEvent) => {
  if (!e.isTrusted) return e;
  e.stopPropagation();

  document.removeEventListener('mousemove', handleMouseMove, true);
  document.removeEventListener('mouseup', handleMouseUp, true);
  const event = new MouseEvent('mouseup', {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: newClientX,
    clientY: e.clientY
  });
  e.target?.dispatchEvent(event);
  // Reset
  initialPivotX = 0;
  currentPivotX = 0;
  clientX = 0;
  newClientX = 0;
  cumulatedDistanceX = 0;
};

const handleMouseDown = (e: MouseEvent) => {
  if (!e.isTrusted) return e;
  e.stopPropagation();
  if (e.button !== 0) return;

  document.addEventListener('mousemove', handleMouseMove, true);
  document.addEventListener('mouseup', handleMouseUp, true);
  initialPivotX = e.clientX;
  clientX = initialPivotX;
  newClientX = initialPivotX;
  currentPivotX = initialPivotX;
  const event = new MouseEvent('mousedown', {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: e.clientX,
    clientY: e.clientY
  });
  e.target?.dispatchEvent(event);
};

// prettier-ignore
// @ts-ignore
document.querySelector('#controlPanelContent')?.addEventListener('mousedown', handleMouseDown, true);
