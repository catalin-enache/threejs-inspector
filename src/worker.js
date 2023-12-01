import * as THREE from 'three';
// self.importScripts('three.js');
console.log('Worker is running', THREE);
onmessage = (e) => {
  const [command, data] = e.data;
  console.log('Message received from main script', command, data);
  postMessage([command, 'ok']);
};
