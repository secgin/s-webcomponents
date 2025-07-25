import SelectInputOption from './SelectInputOption.js';

export default class SelectInput extends HTMLElement {

    static getStyles() {
        return `
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
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
            .dropdown.open {
                opacity: 1;
                pointer-events: auto;
                transform: translateY(0);
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
            .loading-box {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px;
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
                gap: 8px;
                padding: 8px;
                color: #888;
            }
            .empty-icon {
                width: 16px;
                height: 16px;
                display: inline-block;
                background: url('data:image/svg+xml;utf8,<svg fill="%23888" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"/><rect x="4" y="7" width="8" height="2" fill="white"/></svg>') no-repeat center/contain;
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
            <button class="toggle-btn" tabindex="-1" aria-label="Aç/Kapat">▼</button>
        </div>
        <div class="dropdown" id="dropdown-list" role="listbox" tabindex="-1"></div>`;
    }

    static get observedAttributes() {
        return ['api-url', 'api-config'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.options = [];
        this.filteredOptions = [];
        this.highlightedIndex = -1;
        this.loading = false;
        this.abortController = null;
        this.debounceTimeout = null;
        this.shadowRoot.innerHTML = `${SelectInput.getStyles()}${SelectInput.getTemplate()}`;
    }

    async fetchOptionsFromApi(url, searchValue = '') {
        if (this.abortController)
            this.abortController.abort();

        this.abortController = new AbortController();
        this.loading = true;
        this.error = false;
        this.filteredOptions = [];
        this.renderOptions();
        this.showDropdown();
        try {
            let apiUrl;
            let paramName = 'search';
            let mapperFn = null;
            let filterFn = null;
            if (this.hasAttribute('api-config')) {
                const configName = this.getAttribute('api-config');
                const config = window[configName];
                console.log('API Config:', config);
                if (config) {
                    paramName = config.paramName || paramName;
                    mapperFn = config.mapper;
                    filterFn = config.filter;
                }
            }
            apiUrl = new URL(url, window.location.origin);
            apiUrl.searchParams.set(paramName, searchValue);
            const response = await fetch(apiUrl.toString(), { signal: this.abortController.signal });
            let data = await response.json();
            if (typeof mapperFn === 'function')
                data = mapperFn(data, searchValue);
            
            if (typeof filterFn === 'function')
                data = filterFn(data, searchValue);
        
            if (Array.isArray(data)) {
                this.options = data;
                this.filteredOptions = [...this.options];
            }
        } catch (err) {
            if (err.name !== 'AbortError')
                this.error = true;

            console.error('Error fetching options:', err);
        }
        finally {
            this.loading = false;
            this.renderOptions();
        }
    }

    connectedCallback() {
        this.input = this.shadowRoot.querySelector('input');
        this.toggleBtn = this.shadowRoot.querySelector('.toggle-btn');
        this.dropdown = this.shadowRoot.querySelector('.dropdown');

        window.addEventListener('select-input-opened', this.handleOtherOpened.bind(this));
        document.addEventListener('click', this.handleDocumentClick);
        this.addEventListener('focusout', this.handleFocusOut);

        this.input.addEventListener('focus', () => {
            if (!this.hasAttribute('api-url'))
                this.showDropdown();
        });
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
                this.input.value = selected.label;
                this.hideDropdown();
                this.dispatchEvent(new CustomEvent('change', {
                    detail: {
                        value: selected.value,
                        label: selected.label
                    }
                }));
            }
        } else if (e.key === 'Escape') {
            this.hideDropdown();
        }
    };

    scrollHighlightedIntoView() {
        const optionEls = this.dropdown.querySelectorAll('.option');
        if (this.highlightedIndex >= 0 && optionEls[this.highlightedIndex]) {
            optionEls[this.highlightedIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    showDropdown() {
        window.dispatchEvent(new CustomEvent('select-input-opened', { detail: { sender: this } }));
        this.dropdown.classList.add('open');
        this.input.setAttribute('aria-expanded', 'true');
        if (this.highlightedIndex >= 0) {
            this.input.setAttribute('aria-activedescendant', `option-${this.highlightedIndex}`);
        } else {
            this.input.removeAttribute('aria-activedescendant');
        }
    }

    hideDropdown() {
        this.dropdown.classList.remove('open');
        this.input.setAttribute('aria-expanded', 'false');
        this.input.removeAttribute('aria-activedescendant');
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
        if (this.hasAttribute('api-url')) {
            clearTimeout(this.debounceTimeout);
            if (value.length >= 3) {
                //this.error = false;
                //this.renderOptions();
                this.debounceTimeout = setTimeout(() => {
                    this.fetchOptionsFromApi(this.getAttribute('api-url'), value);
                }, 400);
            } else {
                //this.filteredOptions = [];
                //this.error = false;
                //this.renderOptions();
            }
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
            this.dropdown.innerHTML = '<div class="empty-box"><span class="empty-icon"></span>Sonuç yok</div>';
            return;
        }
       
        this.dropdown.innerHTML = this.filteredOptions.map((opt, idx) =>
            `<div class="option${idx === this.highlightedIndex ? ' highlighted' : ''}" role="option" id="option-${idx}" aria-selected="${idx === this.highlightedIndex}" data-value="${opt.value}">${opt.label}</div>`
        ).join('');
        this.dropdown.querySelectorAll('.option').forEach((el, idx) => {
            el.addEventListener('click', () => {
                const selected = this.filteredOptions[idx];
                this.input.value = selected.label;
                this.hideDropdown();
                this.dispatchEvent(new CustomEvent('change', {
                    detail: {
                        value: selected.value,
                        label: selected.label
                    }
                }));
            });
        });
    }

    handleToggleClick(e) {
        e.stopPropagation();
        if (!this.dropdown.classList.contains('open')) {
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