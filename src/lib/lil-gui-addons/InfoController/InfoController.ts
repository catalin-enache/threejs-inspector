import GUI, { Controller } from 'lil-gui';
import './InfoController.css';

declare module 'lil-gui' {
  interface GUI {
    addInfo(object: any, property: string): InfoController;
  }
}

GUI.prototype.addInfo = function (object, property) {
  return new InfoController(this, object, property);
};

export class InfoController extends Controller {
  $info: HTMLPreElement;
  constructor(parent: GUI, object: any, property: string) {
    super(parent, object, property, 'info');

    this.$info = document.createElement('pre');
    this.$info.setAttribute('aria-labelledby', this.$name.id);
    this.$widget.appendChild(this.$info);
    this.updateDisplay();
  }

  updateDisplay() {
    this.$info.innerText = this.getValue();
    return this;
  }
}
