export default class Option extends HTMLElement {
  constructor() {
    super();
  }

  get value() {
    return this.getAttribute('value');
  }

  get label() {
    return this.getAttribute('label') || this.textContent;
  }

  get content() {
    return this.textContent || this.getAttribute('label') || '';
  }
}

customElements.define('s-option', Option); 