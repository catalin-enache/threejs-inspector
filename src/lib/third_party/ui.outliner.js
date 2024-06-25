import { UIDiv } from './ui.js';
import { useAppStore } from 'src/store';

class UIOutliner extends UIDiv {
  constructor() {
    super();

    this.dom.className = 'Outliner';
    this.dom.tabIndex = 0; // keyup event is ignored without setting tabIndex

    const scope = this;

    // Prevent native scroll behavior
    this.dom.addEventListener('keydown', function (event) {
      switch (event.code) {
        case 'ArrowUp':
        case 'ArrowDown':
          event.preventDefault();
          event.stopPropagation();
          break;
      }
    });

    // Keybindings to support arrow navigation
    this.dom.addEventListener('keyup', function (event) {
      switch (event.code) {
        case 'ArrowUp':
          scope.selectIndex(scope.selectedIndex - 1);
          break;
        case 'ArrowDown':
          scope.selectIndex(scope.selectedIndex + 1);
          break;
      }
    });

    this.options = [];
    this.selectedIndex = -1;
    this.selectedValue = null;
  }

  selectIndex(index) {
    if (index >= 0 && index < this.options.length) {
      this.setValue(this.options[index].value);

      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      this.dom.dispatchEvent(changeEvent);
    }
  }

  setOptions(options) {
    const scope = this;

    while (scope.dom.children.length > 0) {
      scope.dom.removeChild(scope.dom.firstChild);
    }

    function onClick() {
      scope.setValue(this.value);

      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      scope.dom.dispatchEvent(changeEvent);
    }

    scope.options = [];

    for (let i = 0; i < options.length; i++) {
      const div = options[i];
      div.className = 'option';
      scope.dom.appendChild(div);

      scope.options.push(div);

      div.addEventListener('click', onClick);
    }

    return scope;
  }

  getValue() {
    return this.selectedValue;
  }

  setValue(value) {
    for (let i = 0; i < this.options.length; i++) {
      const element = this.options[i];

      if (element.value === value) {
        element.classList.add('active');

        // scroll into view
        const y = element.offsetTop - this.dom.offsetTop;
        const bottomY = y + element.clientHeight;
        const minScroll = bottomY - this.dom.clientHeight;

        if (this.dom.scrollTop > y) {
          this.dom.scrollTop = y;
        } else if (this.dom.scrollTop < minScroll) {
          this.dom.scrollTop = minScroll;
        }

        this.selectedIndex = i;
      } else {
        element.classList.remove('active');
      }
    }

    this.selectedValue = value;

    return this;
  }
}

const outliner = new UIOutliner();
outliner.setId('outliner');
outliner.onChange(function () {
  const selectedObject = outliner.scene?.getObjectById(parseInt(outliner.getValue(), 10)) || null;
  useAppStore.getState().setSelectedObject(selectedObject);
});

export { outliner };
