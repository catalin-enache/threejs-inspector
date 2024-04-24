// @ts-ignore
import { InputNumber } from 'old_src/components/InputNumber';
import * as THREE from 'three';
import { UserData } from 'old_src/types';

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
  const userData = selectedObject.userData as UserData;
  return (
    <>
      <div className="controlRow">
        <div className="rowTitle">Translate</div>
        <InputNumber
          className="rowEntry"
          label="X"
          value={userData.translationDistance?.x || 0}
          onChange={changeTranslationDistance('x')}
        />
        <InputNumber
          className="rowEntry"
          label="Y"
          value={userData.translationDistance?.y || 0}
          onChange={changeTranslationDistance('y')}
        />
        <InputNumber
          className="rowEntry"
          label="Z"
          value={userData.translationDistance?.z || 0}
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
