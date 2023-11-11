/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-ignore
import { InputNumber } from 'components/InputNumber';
import * as THREE from 'three';

interface TranslateProps {
  selectedObject: THREE.Object3D<THREE.Object3DEventMap>;
  changeTranslationDistance: (
    coordinate: 'x' | 'y' | 'z'
  ) => (value: number) => void;
  translate: () => void;
}
export const Translate = ({
  selectedObject,
  changeTranslationDistance,
  translate
}: TranslateProps) => {
  return (
    <>
      <div className="controlRow">
        <div className="rowTitle">Translate</div>
        <InputNumber
          className="rowEntry"
          label="X"
          value={selectedObject.userData.translationDistance?.x || 0}
          onChange={changeTranslationDistance('x')}
        />
        <InputNumber
          className="rowEntry"
          label="Y"
          value={selectedObject.userData.translationDistance?.y || 0}
          onChange={changeTranslationDistance('y')}
        />
        <InputNumber
          className="rowEntry"
          label="Z"
          value={selectedObject.userData.translationDistance?.z || 0}
          onChange={changeTranslationDistance('z')}
        />
      </div>
      <div className="controlRow">
        <div className="rowEntry controlButton" onClick={translate}>
          Apply
        </div>
      </div>
    </>
  );
};
