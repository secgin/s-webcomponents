export default class SelectInputOption extends HTMLElement {
  constructor() {
    super();
  }

  get value() {
    return this.getAttribute('value');
  }

  get label() {
    return this.getAttribute('label') || this.textContent;
  }
}

customElements.define('select-input-option', SelectInputOption); 