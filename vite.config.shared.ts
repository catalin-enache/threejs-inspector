/// <reference types="vitest" />
import path from 'path';

export const alias = {
  src: path.resolve(__dirname, './src'),
  components: path.resolve(__dirname, './src/components'),
  lib: path.resolve(__dirname, './src/lib'),
  testutils: path.resolve(__dirname, './src/tests/testutils')
};
export const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
