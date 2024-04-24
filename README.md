# ThreeJS Inspector

## Running the project

- The app is running live at [https://catalin-enache.github.io/threejs-inspector/](https://catalin-enache.github.io/threejs-inspector/).
  <br /><br />
- To run the app locally, clone the repository and run `npm install` followed by `npm run dev`.
  <br /><br />
- The project will be available at `http://localhost:5173/`.
  <br /><br />


## Project status

- This project is currently an application that will be later extracted into a library.
  <br /><br />
- It uses `R3F` (React Three Fiber) and `Tweakpane` under the hood. `Drei` utilities will join soon.
  <br /><br />

  Using `R3F` should not prevent using this editor with a native `ThreeJs` application
  which could be instantiated in a `React` component inside `useEffect` hook (at least in the current project state).
  <br /><br />

## Objective

- The main goal of this project is to provide a simple way to interact with a given ThreeJS application (without interfering),
  easing the process of finding the right configurations for different objects before adjusting them in code.  
  This goal will be finalised when the project will be extracted into a library.  
  For now, it is a standalone application, and it is decoupled enough.
  <br /><br />
- Another goal is to be able to quickly prototype mini experiments to help in learning ThreeJS, Shaders and Math.
  <br /><br />

## Quick Guide

- The cPanel can be moved around by dragging the top bar and can be toggled by pressing Ctrl+Alt+Shift+P.
  <br /><br />

- `Helpers` can be toggled by pressing Ctrl+Alt+Shift+H. When `helpers` are off only the `pickers` are visible.
  <br /><br />

- `Gizmos` (which include `helpers` and `pickers`) can be toggled by pressing Ctrl+Alt+Shift+G.
  <br /><br />

- Play/Stop mode can be toggled by pressing Space (when `cPanel` or `Gizmos` are visible - which means `editor mode`)  
  or by pressing Ctrl+Alt+Shift+Space (when `cPanel` and `Gizmos` are hidden - which means `non editor mode`).
  <br /><br />

- The shortcuts will very likely change in the future to ensure we're not interfering at all with the main app.
  <br /><br />

- Objects that are not visible (e.g. lights, cameras) are injected with a picker such that they can be selected in the scene view.
  <br /><br />

- Objects that are visible (e.g. meshes) are not inspectable by default. They can be made inspectable by setting `isInspectable: true` in `userData` (in application code).
  <br /><br />

  This design choice was made in order to avoid looping through a very large list of objects when `Raycaster` looks for hits.
  <br /><br />

- To inspect an object `double click` on it in the scene view.
  <br /><br />

- All shortcuts are mentioned in cPanel labels which are constrained to a limited width to not consume space, but are revealed on mouse hover.
  <br /><br />

- The cPanel has 3 main tabs.
    - `Selected` tab is used to interact with the selected object.
    - `Custom` tab is used to interact with custom controls (added in code).
    - `Global` tab is used to config cPanel itself and interact with other global objects.
      <br /><br />

- `Orbit` and `Fly` camera controls are available in the scene view.
  <br /><br />
  In `Fly` mode, the camera can be moved with `WASDQE` while right mouse button is pressed (like in `Unreal` and `Unity`).
  <br /><br />
  In `Orbit` mode, the camera can be rotated around with left mouse button and panned with right mouse button.
  <br /><br />
  In both modes, the camera can be focused on selected object (or center of the stage) by pressing `F`.
  <br /><br />

- In play mode by default the current camera is reused.
  <br /><br />
  If a new camera is added to the scene, and it has `userData.useOnPlay = true` that one will be used instead in play mode.  
  Note: Only one camera having `useOnPlay = true` will be considered (the last one added).
  <br /><br />
  The provided `Orbit` and `Fly` camera controls are _opt-in_ in play mode (in cPanel checkbox and via `]` shortcut).  
  This allows us to create fully functional mini apps as well as preventing interfering with the main app.  
  It goes without saying that the main app should have its own camera controls when the default ones are not attached to the playing camera.
  <br /><br />

- To change a texture image, click on the texture image in the cPanel and select a new image from the opened file explorer.
  <br /><br />

- Any change to a texture will update the texture and if the texture is inside a material it will recompile the material  
  to accommodate (custom) shaders that would be looking for a specific thing in a texture.
  <br /><br />
  Any change in a material will recompile the material.  
  That is because some material changes (e.g. `magFilter`/`minFilter`) are not visible until the material is recompiled.
  <br /><br />
  Because of this, when adjusting some values in a texture or material (especially when using sliders) the cPanel controls might not be very responsive.
  <br /><br />

- Pressing `Ctrl` or `Shift` while dragging a cPanel slider will make the slider move faster or slower, respectively.
  <br /><br />
  Numbers in cPanel can also be adjusted using arrow keys.  
  While pressing `Alt`/`Option` or `Shift` the increment will be slower or faster, respectively.