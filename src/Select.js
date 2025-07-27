import './Option.js';
import DataSource from './DataSource.js';

export default class Select extends HTMLElement {

    static getStyles() {
        return `
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            :host {
                --s-select-option-padding: 4px 4px;
                --s-select-option-hover-bg: #f0f0f0;
                --s-select-option-color: inherit;
                --s-select-padding: 2px 4px;
                --s-select-arrow-color: #333;
                position: relative !important;
                display: inline-block !important;
                padding: 0 !important;
                box-sizing: border-box;
                border: 1px solid #ccc;
                border-radius: .2rem;
                background: #fff;
                color: #333;
            }
            .input-wrapper {
                display: flex;
                align-items: stretch;
                overflow: hidden;
                font-family: inherit;
                font-size: inherit;
                font-weight: inherit;
                font-style: inherit;
                background: inherit;
                color: inherit;
                border: none;
                border-radius: inherit;         
            }
            :host([multi-select]) .input-wrapper {
                flex-wrap: wrap;               
            }
            input[type="text"] {
                border-radius: inherit;
                color: inherit;
                font-family: inherit;
                font-size: inherit;
                font-weight: inherit;
                font-style: inherit;
                flex: 1;
                border: none;
                outline: none;
                padding: var(--s-select-padding);
                background: transparent;
            }
            .toggle-btn {
                background: transparent;
                color: inherit;
                border: none;
                cursor: pointer;
                padding: 0 6px;
                display: flex;
                align-items: center;
            }
            .toggle-btn svg {
                width: 16px;
                height: 16px;
                fill: var(--s-select-arrow-color);
            }
            .dropdown {
                border: inherit;
                border-radius: inherit;
                background: inherit;               
                color: inherit;
                max-height: 150px;
                overflow-y: auto;
                width: 100%;
                position: absolute;
                top: 100%;
                left: -1px;          
                z-index: 10;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                opacity: 0;
                pointer-events: none;
                transform: translateY(-8px);
                transition: opacity 0.2s, transform 0.2s;
            }
            :host([open]) .dropdown {
                opacity: 1;
                pointer-events: auto;
                transform: translateY(0);
            }
            .option {
                padding: var(--s-select-option-padding);
                cursor: pointer;
                color: var(--s-select-option-color);
            }    
            :host([multi-select]) .option:before {
                content: '';
                display: inline-block;
                width: 16px;
            }
            :host([multi-select]) .option.selected:before {
                content: '\\2713';
            }
            .option:hover, 
            .option.highlighted {
                background: var(--s-select-option-hover-bg, #f0f0f0);
            }
            .loading-box {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px;
                font-size: .8rem;
            }
            .spinner {
                width: 16px;
                height: 16px;
                border: 2px solid #ccc;
                border-top: 2px solid #333;
                border-radius: 50%;
                display: inline-block;
                animation: spin 1s linear infinite;
            }
            .error-box {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px;
                color: #c00;
                font-size: .8rem;
            }
            .error-icon {
                width: 16px;
                height: 16px;
                display: inline-block;
                background: url('data:image/svg+xml;utf8,<svg fill="%23c00" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"/><rect x="7" y="4" width="2" height="6" fill="white"/><rect x="7" y="11" width="2" height="2" fill="white"/></svg>') no-repeat center/contain;
            }
            .empty-box {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 8px;
                color: #888;
                font-size: .8rem;
            }
            .empty-icon {
                width: 24px;
                height: 24px;
                display: inline-block;
                background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="%23888" class="bi bi-inbox" viewBox="0 0 16 16"><path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4zm9.954 5H10.45a2.5 2.5 0 0 1-4.9 0H1.066l.32 2.562a.5.5 0 0 0 .497.438h12.234a.5.5 0 0 0 .496-.438zM3.809 3.563A1.5 1.5 0 0 1 4.981 3h6.038a1.5 1.5 0 0 1 1.172.563l3.7 4.625a.5.5 0 0 1 .105.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374z"/></svg>') no-repeat center/contain;
            }

            .chip {
                display:flex;
                align-items: center;
                background:#e0e0e0;
                border-radius:inherit;
                padding:0 3px;
                margin:1px 2px;
                font-size:.95em;
                vertical-align:middle;
            }
            .chip-remove {
                margin-left:4px;
                cursor:pointer;
            }
            .chip:hover .chip-remove {
                color: #000;
            }

            /* Mobil görünüm için */
            @media (max-width: 600px) {
                :host {
                    font-size: 1.1rem;
                }
                .input-wrapper {
                    font-size: 1.1rem;
                }
                .dropdown {
                    position: fixed !important;
                    left: 50% !important;
                    top: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    width: 92vw !important;
                    max-width: 420px;
                    max-height: 60vh !important;
                    border-radius: 1rem;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
                    z-index: 9999;
                }
                .option {
                    font-size: 1.1rem;
                    padding: 18px 16px;
                }
                .loading-box, .error-box, .empty-box {
                    font-size: 1rem;
                    padding: 18px 16px;
                }
            }
        </style>`;
    }

    static getTemplate() {
        return `
        <div class="input-wrapper">
            <input 
                type="text" 
                name="filterValue" 
                placeholder="Seçiniz..." 
                autoComplete="off"
                aria-autocomplete="list" 
                aria-haspopup="listbox" 
                aria-expanded="false" 
                aria-controls="dropdown-list" />
            <button class="toggle-btn" tabindex="-1" aria-label="Aç/Kapat">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
</svg>    
            </button>
        </div>
        <div class="dropdown" id="dropdown-list" role="listbox" tabindex="-1"></div>`;
    }

    static getOptionsTemplate(opt, highlightedIndex, idx, isSelected) {
        return `
        <div 
            class="option${idx === highlightedIndex ? ' highlighted' : ''}${isSelected ? ' selected' : ''}" 
            role="option" id="option-${idx}" 
            aria-selected="${isSelected}" 
            data-value="${opt.value}">
                ${opt.content ?? opt.label}
        </div>`;
    }

    static getChipTemplate(value, label) {
        return `
        <span class="chip" data-value="${value}">${label}
            <span class="chip-remove">&times;</span>
        </span>`;
    }

    static get observedAttributes() {
        return ['api-url', 'api-config'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open', delegatesFocus: true });
        this.options = [];
        this.filteredOptions = [];
        this.highlightedIndex = -1;
        this.loading = false;
        this.error = false;
        this.firsLoaded = false;

        this.selectedValues = [];
        this.isMulti = this.hasAttribute('multi-select');

        this.dataSource = new DataSource();
        if (this.hasAttribute('api-config')) {
            const configName = this.getAttribute('api-config');
            const config = window[configName];
            if (config) {
                this.dataSource.setConfig(config);
            }
        }

        this.shadowRoot.innerHTML = `${Select.getStyles()}${Select.getTemplate()}`;
    }

    connectedCallback() {
        this.input = this.shadowRoot.querySelector('input');
        this.toggleBtn = this.shadowRoot.querySelector('.toggle-btn');
        this.dropdown = this.shadowRoot.querySelector('.dropdown');

        window.addEventListener('select-input-opened', this.handleOtherOpened);
        document.addEventListener('click', this.handleDocumentClick);
        this.addEventListener('focusout', this.handleFocusOut);

        this.input.addEventListener('focus', () => {
            if (!this.hasAttribute('api-url'))
                this.showDropdown();
        });
        this.input.addEventListener('input', (e) => {
            this.filterOptions(e.target.value);
        });
        this.input.addEventListener('keydown', this.handleKeyDown);

        this.toggleBtn.addEventListener('click', this.handleToggleClick.bind(this));

        this.loadOptions();
        this.renderOptions();

        var form = this.closest('form');
        if (form && this.getAttribute('name')) {
            form.addEventListener('formdata', (e) => {
                const name = this.getAttribute('name');

                if (this.isMulti) {
                    const values = this.selectedValues.map(v => v.value);
                    values.forEach(val => e.formData.append(`${name}[]`, val));
                } else {
                    const value = this.selectedValues[0]?.value || '';
                    e.formData.append(name, value);
                }
            });
        }
    }

    disconnectedCallback() {
        window.removeEventListener('select-input-opened', this.handleOtherOpened);
        document.removeEventListener('click', this.handleDocumentClick);
        this.removeEventListener('focusout', this.handleFocusOut);

        this.input.removeEventListener('keydown', this.handleKeyDown);
        this.toggleBtn.removeEventListener('click', this.handleToggleClick);
    }

    async fetchOptionsFromApi(searchValue = '') {
        try {
            this.options = await this.dataSource.fetchJson(
                this.getAttribute('api-url'),
                searchValue,
                {},
                () => {
                    this.loading = true;
                    this.error = false;
                    this.filteredOptions = [];
                    this.renderOptions();
                    this.showDropdown();
                });
            this.firsLoaded = true;
            this.filteredOptions = [...this.options];
        } catch (err) {
            this.error = true;
        } finally {
            this.loading = false;
            this.renderOptions();
        }
    }

    handleOtherOpened = (e) => {
        if (e.detail && e.detail.sender !== this) {
            this.hideDropdown();
        }
    }

    handleDocumentClick = (e) => {
        if (!this.contains(e.target) && !this.shadowRoot.contains(e.target)) {
            this.hideDropdown();
        }
    };

    handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.showDropdown();
            this.highlightedIndex++;
            if (this.highlightedIndex === this.filteredOptions.length) {
                this.highlightedIndex = 0;
            }
            this.renderOptions();
            this.scrollHighlightedIntoView();
            this.input.setAttribute('aria-activedescendant', `option-${this.highlightedIndex}`);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.showDropdown();
            this.highlightedIndex--;
            if (this.highlightedIndex === -1) {
                this.highlightedIndex = this.filteredOptions.length - 1;
            }
            this.renderOptions();
            this.scrollHighlightedIntoView();
            this.input.setAttribute('aria-activedescendant', `option-${this.highlightedIndex}`);
        } else if (e.key === 'Enter') {
            if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredOptions.length) {
                const selected = this.filteredOptions[this.highlightedIndex];
                const exists = this.selectedValues.find(v => v.value == selected.value);
                if (this.isMulti) {
                    const optionEl = this.dropdown.querySelector(`.option[data-value="${selected.value}"]`);

                    if (exists) {
                        this.selectedValues = this.selectedValues.filter(v => v.value != selected.value);
                        optionEl?.classList.remove('selected');
                    } else {
                        this.selectedValues.push(selected);
                        optionEl.classList.add('selected');
                    }
                    this.updateInputDisplay();
                    this.dispatchChange();
                } else {
                    this.selectedValues = [selected];
                    this.input.value = selected.label;
                    this.hideDropdown();
                    this.dispatchChange();
                }
            }
        } else if (e.key === 'Escape') {
            this.hideDropdown();
        } else if (e.key === 'Backspace') {
            if (this.isMulti && this.input.value === '' && this.selectedValues.length > 0) {
                var removingOption = this.selectedValues.pop();
                const optionEl = this.dropdown.querySelector(`.option[data-value="${removingOption.value}"]`);
                if (optionEl)
                    optionEl.classList.remove('selected');
                this.updateInputDisplay();
                this.dispatchChange();
            }
        }
    };

    showDropdown() {
        window.dispatchEvent(new CustomEvent('select-input-opened', { detail: { sender: this } }));
        this.setAttribute('open', '');
        this.input.setAttribute('aria-expanded', 'true');
        if (this.highlightedIndex >= 0) {
            this.input.setAttribute('aria-activedescendant', `option-${this.highlightedIndex}`);
        } else {
            this.input.removeAttribute('aria-activedescendant');
        }

        if (window.innerWidth <= 600 && !this._backdrop) {
            this._backdrop = document.createElement('div');
            this._backdrop.className = 'modal-backdrop';
            Object.assign(this._backdrop.style, {
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.2)',
                zIndex: 9998
            });
            this._backdrop.addEventListener('click', () => this.hideDropdown());
            document.body.appendChild(this._backdrop);
        }
    }

    hideDropdown() {
        this.removeAttribute('open');
        this.input.setAttribute('aria-expanded', 'false');
        this.input.removeAttribute('aria-activedescendant');

        if (this._backdrop) {
            this._backdrop.remove();
            this._backdrop = null;
        }
    }

    scrollHighlightedIntoView() {
        const optionEls = this.dropdown.querySelectorAll('.option');
        if (this.highlightedIndex >= 0 && optionEls[this.highlightedIndex]) {
            optionEls[this.highlightedIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    loadOptions() {
        const optionElements = Array.from(this.querySelectorAll('s-option'));
        if (optionElements.length > 0) {
            this.options = optionElements.map(opt => ({
                value: opt.value,
                label: opt.label,
                content: opt.content
            }));
        }
        this.filteredOptions = [...this.options];
    }

    filterOptions(value) {
        if (this.hasAttribute('api-url')) {
            this.fetchOptionsFromApi(value);
        } else {
            this.filteredOptions = this.options.filter(opt =>
                opt.label.toLowerCase().includes(value.toLowerCase())
            );
            this.renderOptions();
            this.showDropdown();
        }
    }

    renderOptions() {
        if (this.loading) {
            this.dropdown.innerHTML = '<div class="loading-box"><span class="spinner"></span>Yükleniyor...</div>';
            return;
        }
        if (this.error) {
            this.dropdown.innerHTML = '<div class="error-box"><span class="error-icon"></span>Seçenekler yüklenmedi</div>';
            return;
        }
        if (this.filteredOptions.length === 0) {
            if (this.firsLoaded)
                this.dropdown.innerHTML = '<div class="empty-box"><span class="empty-icon"></span>Sonuç yok</div>';
            return;
        }

        this.dropdown.innerHTML = this.filteredOptions
            .map((opt, idx) => {
                const isSelected = this.selectedValues.some(v => v.value === opt.value);
                return Select.getOptionsTemplate(opt, this.highlightedIndex, idx, isSelected);
            })
            .join('');

        this.dropdown.querySelectorAll('.option').forEach((el, idx) => {
            el.addEventListener('click', () => {
                const selected = this.filteredOptions[idx];
                const exists = this.selectedValues.find(v => v.value == selected.value);
                if (this.isMulti) {
                    if (exists) {
                        this.selectedValues = this.selectedValues.filter(v => v.value != selected.value);
                        el.classList.remove('selected');
                    } else {
                        this.selectedValues.push(selected);
                        el.classList.add('selected');
                    }
                    this.updateInputDisplay();
                    this.dispatchChange();
                } else {
                    this.selectedValues = [selected];
                    this.input.value = selected.label;
                    this.hideDropdown();
                    this.dispatchChange();
                }
            });
        });
    }

    updateInputDisplay() {
        if (!this.isMulti) {
            if (this.selectedValues.length > 0) {
                this.input.value = this.selectedValues[0].label;
            } else {
                this.input.value = '';
            }
            this.input.parentNode.querySelectorAll('.chip').forEach(chip => chip.remove());
            return;
        }

        const chips = this.selectedValues.map(v => Select.getChipTemplate(v.value, v.label)).join('');
        this.input.value = '';
        this.input.style.display = 'inline-block';
        this.input.parentNode.querySelectorAll('.chip').forEach(chip => chip.remove());
        this.input.insertAdjacentHTML('beforebegin', chips);
        this.input.parentNode.querySelectorAll('.chip-remove').forEach(el => {
            el.onclick = (e) => {
                const chipEl = el.parentElement;
                const val = chipEl.getAttribute('data-value');
                this.selectedValues = this.selectedValues.filter(v => v.value != val);
                const optionEl = this.dropdown.querySelector(`.option[data-value="${val}"]`);
                if (optionEl)
                    optionEl.classList.remove('selected');
                this.updateInputDisplay();
                this.dispatchChange();
            };
        });
    }

    dispatchChange() {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                selectedOptions: this.selectedValues
            }
        }));
    }

    handleToggleClick(e) {
        e.stopPropagation();
        if (!this.hasAttribute('open')) {
            if (this.hasAttribute('api-url') && this.options.length === 0)
                this.fetchOptionsFromApi();

            this.showDropdown();
            this.input.focus();
        } else {
            this.hideDropdown();
        }
    }

    handleFocusOut = () => {
        setTimeout(() => {
            if (this.hasAttribute('open') &&
                !this.contains(this.shadowRoot.activeElement) && !this.shadowRoot.contains(this.shadowRoot.activeElement)) {
                this.hideDropdown();
            }
        }, 0);
    }
}

customElements.define('s-select', Select);