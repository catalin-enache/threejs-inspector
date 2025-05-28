/// <reference types="vite/client" />

let injected = false;

const fontLinks = [
  {
    id: 'threejs-inspector-material-symbols',
    href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0',
    rel: 'stylesheet'
  },
  {
    id: 'threejs-inspector-roboto-mono',
    href: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap',
    rel: 'stylesheet'
  }
];

export async function injectMainCss() {
  // 1) Don’t run on the server or twice
  if (typeof document === 'undefined' || injected) return;

  for (const { id, href, rel } of fontLinks) {
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = rel;
      link.href = href;
      document.head.appendChild(link);
    }
  }

  // 2) Skip manual injection in dev, since Vite already inlines your CSS imports
  if (import.meta.env.DEV) return;

  injected = true;
  const mod = await import('threejs-inspector/threejs-inspector.css?raw');
  const cssText: string = mod.default;
  const style = document.createElement('style');
  style.setAttribute('data-threejs-inspector', 'true');
  style.innerHTML = cssText;
  document.head.appendChild(style);
  console.log('threejs-inspector.css injected');
}
