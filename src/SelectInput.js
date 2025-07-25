import SelectInputOption from './SelectInputOption.js';

export default class SelectInput extends HTMLElement {

    static getStyles() {
        return `
        <style>
            :host {
                --select-input-option-padding: 4px 4px;
                --select-input-option-hover-bg: #f0f0f0;
                --select-input-option-color: inherit;
                --select-input-padding: 2px 4px;
                
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
                padding: var(--select-input-padding);
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
            .dropdown {
                border: inherit;
                border-radius: inherit;
                background: inherit;
                color: inherit;
                
                display: none;
                max-height: 150px;
                overflow-y: auto;
                width: 100%;
                position: absolute;
                top: 100%;
                left: -1px;          
                z-index: 10;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .option {
                padding: var(--select-input-option-padding);
                cursor: pointer;
                color: var(--select-input-option-color);
            }
            .option:hover, 
            .option.highlighted {
                background: var(--select-input-option-hover-bg, #f0f0f0);
            }
        </style>`;
    }

    static getTemplate() {
        return `
        <div class="input-wrapper">
            <input type="text" placeholder="Seçiniz..." />
            <button class="toggle-btn" tabindex="-1" aria-label="Aç/Kapat">▼</button>
        </div>
        <div class="dropdown" tabindex="-1"></div>`;
    }

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.options = [];
        this.filteredOptions = [];
        this.highlightedIndex = -1;
        this.shadowRoot.innerHTML = `${SelectInput.getStyles()}${SelectInput.getTemplate()}`;
    }

    connectedCallback() {
        this.input = this.shadowRoot.querySelector('input');
        this.toggleBtn = this.shadowRoot.querySelector('.toggle-btn');
        this.dropdown = this.shadowRoot.querySelector('.dropdown');

        window.addEventListener('select-input-opened', this.handleOtherOpened.bind(this));
        document.addEventListener('click', this.handleDocumentClick);
        this.addEventListener('focusout', this.handleFocusOut);

        this.input.addEventListener('focus', () => this.showDropdown());
        this.input.addEventListener('input', (e) => this.filterOptions(e.target.value));
        this.input.addEventListener('keydown', this.handleKeyDown);

        this.toggleBtn.addEventListener('click', this.handleToggleClick.bind(this));

        this.loadOptions();
        this.renderOptions();
    }

    disconnectedCallback() {
        window.removeEventListener('select-input-opened', this.handleOtherOpened);
        document.removeEventListener('click', this.handleDocumentClick);
        this.removeEventListener('focusout', this.handleFocusOut);

        this.input.removeEventListener('keydown', this.handleKeyDown);
        this.toggleBtn.removeEventListener('click', this.handleToggleClick);
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
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.showDropdown();
            this.highlightedIndex--;
            if (this.highlightedIndex === -1) {
                this.highlightedIndex = this.filteredOptions.length - 1;
            }
            this.renderOptions();
            this.scrollHighlightedIntoView();
        } else if (e.key === 'Enter') {
            if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredOptions.length) {
                this.input.value = this.filteredOptions[this.highlightedIndex].label;
                this.hideDropdown();
            }
        } else if (e.key === 'Escape') {
            this.hideDropdown();
        }
    };

    scrollHighlightedIntoView() {
        const optionEls = this.dropdown.querySelectorAll('.option');
        if (this.highlightedIndex >= 0 && optionEls[this.highlightedIndex]) {
            optionEls[this.highlightedIndex].scrollIntoView({block: 'nearest'});
        }
    }

    showDropdown() {
        window.dispatchEvent(new CustomEvent('select-input-opened', {detail: {sender: this}}));
        this.dropdown.style.display = 'block';
    }

    hideDropdown() {
        this.dropdown.style.display = 'none';
    }

    loadOptions() {
        const optionElements = Array.from(this.querySelectorAll('select-input-option'));
        if (optionElements.length > 0) {
            this.options = optionElements.map(opt => ({
                value: opt.value,
                label: opt.label
            }));
        }
        this.filteredOptions = [...this.options];
    }

    filterOptions(value) {
        this.filteredOptions = this.options.filter(opt =>
            opt.label.toLowerCase().includes(value.toLowerCase())
        );
        this.renderOptions();
        this.showDropdown();
    }

    renderOptions() {
        if (this.filteredOptions.length === 0) {
            this.dropdown.innerHTML = '<div>Sonuç yok</div>';
            return;
        }
        this.dropdown.innerHTML = this.filteredOptions.map((opt, idx) =>
            `<div class="option${idx === this.highlightedIndex ? ' highlighted' : ''}" data-value="${opt.value}">${opt.label}</div>`
        ).join('');
        this.dropdown.querySelectorAll('.option').forEach((el, idx) => {
            el.addEventListener('click', () => {
                this.input.value = this.filteredOptions[idx].label;
                this.hideDropdown();
            });
        });
    }

    handleToggleClick(e) {
        e.stopPropagation();
        if (this.dropdown.style.display === 'none' || !this.dropdown.style.display) {
            this.showDropdown();
            this.input.focus();
        } else {
            this.hideDropdown();
        }
    }

    handleFocusOut() {
        setTimeout(() => {
            if (!this.shadowRoot.activeElement) {
                this.hideDropdown();
            }
        }, 0);
    }

    handleOtherOpened(e) {
        if (e.detail && e.detail.sender !== this) {
            this.hideDropdown();
        }
    }
}

customElements.define('select-input', SelectInput); 