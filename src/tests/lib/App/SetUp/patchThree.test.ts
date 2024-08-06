import * as THREE from 'three';
import { expect, describe, it } from 'vitest';
import { withScene } from 'testutils/testScene';

describe('patchThree', () => {
  describe('__inspectorData', () => {
    describe('isInspectable', () => {
      it('is settable', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene: _ }) => {
            const mesh = new THREE.Mesh();
            mesh.__inspectorData.isInspectable = true;
            expect(mesh.__inspectorData.isInspectable).toBeTruthy();
            done();
          });
        }));

      it('is propagated to children', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene: _ }) => {
            const parent = new THREE.Object3D();
            const child = new THREE.Object3D();
            const grandchild = new THREE.Object3D();
            parent.add(child);
            child.add(grandchild);
            parent.__inspectorData.isInspectable = true;
            expect(child.__inspectorData.isInspectable).toBeTruthy();
            expect(grandchild.__inspectorData.isInspectable).toBeTruthy();
            done();
          });
        }));

      it('sets hitRedirect to parent if it was not set to something else', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene: _ }) => {
            const parent = new THREE.Object3D();
            const child = new THREE.Object3D();
            const grandchild = new THREE.Object3D();
            parent.add(child);
            child.add(grandchild);
            parent.__inspectorData.isInspectable = true;
            expect(child.__inspectorData.hitRedirect).toBe(parent);
            expect(grandchild.__inspectorData.hitRedirect).toBe(parent);
            done();
          });
        }));

      it('does not set hitRedirect if it was set to something else', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene: _ }) => {
            const hitRedirect = new THREE.Object3D();
            const parent = new THREE.Object3D();
            const child = new THREE.Object3D();
            const grandchild = new THREE.Object3D();
            parent.add(child);
            child.add(grandchild);
            child.__inspectorData.hitRedirect = hitRedirect;
            parent.__inspectorData.isInspectable = true;
            expect(child.__inspectorData.hitRedirect).toBe(hitRedirect);
            expect(grandchild.__inspectorData.hitRedirect).toBe(hitRedirect);
            done();
          });
        }));
    });

    describe('hitRedirect', () => {
      it('is settable', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene: _ }) => {
            const mesh = new THREE.Mesh();
            const hitRedirect = new THREE.Object3D();
            mesh.__inspectorData.hitRedirect = hitRedirect;
            expect(mesh.__inspectorData.hitRedirect).toBe(hitRedirect);
            done();
          });
        }));

      it('is propagated to children overriding prev value', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene: _ }) => {
            const hitRedirect = new THREE.Object3D();
            const otherHitRedirect = new THREE.Object3D();
            const parent = new THREE.Object3D();
            const child = new THREE.Object3D();
            const grandchild = new THREE.Object3D();
            parent.add(child);
            child.add(grandchild);
            grandchild.__inspectorData.hitRedirect = otherHitRedirect; // will be overridden by parent
            parent.__inspectorData.hitRedirect = hitRedirect;
            expect(child.__inspectorData.hitRedirect).toBe(hitRedirect);
            expect(grandchild.__inspectorData.hitRedirect).toBe(hitRedirect);
            done();
          });
        }));
    });

    describe('dependantObjects', () => {
      it('is an array already provided', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene: _ }) => {
            const mesh = new THREE.Mesh();
            const dependantObject = new THREE.Object3D();
            mesh.__inspectorData.dependantObjects!.push(dependantObject);
            expect(mesh.__inspectorData.dependantObjects).toContain(dependantObject);
            done();
          });
        }));

      it('is not settable', () => {
        withScene(
          0,
          true
        )(async ({ scene: _ }) => {
          const mesh = new THREE.Mesh();
          expect(() => {
            // @ts-expect-error
            mesh.__inspectorData['dependantObjects'] = [];
          }).toThrow();
        });
      });
    });
  });
});
