export default class MoneyInput extends HTMLElement {
    _name = null;
    _currency = null;
    _exchangeCurrency = null;
    _amount = null;
    _exchangeAmount = null;
    _form = null;
    _hundredSeparator = ',';
    _decimalSeparator = '.';
    _valueDecimalSeparator = '.';

    constructor() {
        super();
        this.attachShadow({mode: 'open', delegatesFocus: true});
    }

    set value(value) {
        this._amount = this.formatNumber(this.convertValue(value));
        this.render();
    }

    get value() {
        return this.prepareFormData(this._amount);
    }

    set exchangeValue(value) {
        this._exchangeAmount = this.formatNumber(this.convertValue(value));
        this.render();
    }

    connectedCallback() {
        this._name = this.getAttribute('name');
        this._currency = this.getAttribute('currency') ?? null;
        this._exchangeCurrency = this.getAttribute('exchange-currency') ?? null;

        if (this.hasAttribute('value'))
            this._amount = this.convertValue(this.getAttribute('value'));

        if (this.hasAttribute('exchange-value'))
            this._exchangeAmount = this.convertValue(this.getAttribute('exchange-value'));

        this.addEventListener('keydown', this.onKeydown);
        if (this._form == null) {
            this._form = this.closest('form');
            this._form.addEventListener('formdata', this.onFormData.bind(this));
        }
        this.render();
    }

    static get observedAttributes() {
        return ['currency', 'exchange-currency'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'currency') {
            if (newValue == null || newValue === 'undefined' || newValue.trim() === '')
                this._currency = null;
            else
                this._currency = newValue;
            this._exchangeCurrency = null;
            this.render();
        } else if (name === 'exchange-currency') {
            if (newValue == null || newValue === 'undefined' || newValue.trim() === '')
                this._exchangeCurrency = null;
            else
                this._exchangeCurrency = newValue;
            this.render();
        }
    }

    getStyle() {
        return `
            <style>
                * {
                    box-sizing: border-box;
                }
                :host {
                    --s-money-input-border-color: #ccc;

                    display: inline-block !important;
                    padding: 0 !important;
                    box-sizing: border-box;
                    border: 1px solid #ccc;
                    border-radius: .2rem;
                    background: #fff;
                    color: #333;
                }
                :host(:focus-within) {
                    outline: 1px solid var(--s-money-input-focus-color, #007bff);
                }
                .money-input {
                    display: flex;
                    flex-direction: row;
                    gap: 0.5rem;
                    width: 100%;
                }
                .money-input > div {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    flex-grow: 1;
                }
                .money-input > div > input {
                    width: 100%;
                    border: none;
                    outline: none;
                    -moz-appearance: textfield;
                    font-family: inherit;
                    font-size: inherit;
                    background-color: inherit;
                    color: inherit;
                    line-height: inherit;
                }
                .money-input > div > input::-webkit-outer-spin-button,
                .money-input > div > input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .money-input > div > span {
                    font-size: small;
                    margin-left: 0.2rem;
                    margin-right: .5rem;
                    font-weight: 500;
                    
                    outline: 1px solid #878787;
                    border-radius: .25rem;
                    padding: 0 .25rem;
                }
                
                .money-input > div:last-child {
                    border-left: 1px solid var(--s-money-input-border-color);
                }
                .money-input > div:last-child > span {
                    margin-left: 0.5rem;
                }
                </style>
            `;
    }

    getTemplate() {
        return `
            <div class="money-input">
                <div>
                    <span>${this._currency}</span>
                    <input id="amount" type="text" />
                </div>
                <div id="target">
                    <span>${this._exchangeCurrency}</span>
                    <input id="exchangeAmount" type="text" />
                </div>
            </div>
        `;
    }

    render() {
        this.shadowRoot.innerHTML = this.getStyle() + this.getTemplate();

        this.amountEl = this.shadowRoot.getElementById('amount');
        this.exchangeAmountEl = this.shadowRoot.getElementById('exchangeAmount');

        this.amountEl.value = this.formatNumber(this._amount);
        this.exchangeAmountEl.value = this.formatNumber(this._exchangeAmount);

        this.amountEl.addEventListener('keyup', this.onAmountKeyup.bind(this));
        this.amountEl.addEventListener('input', this.onAmountInput.bind(this));
        this.amountEl.addEventListener('change', this.onAmountChange.bind(this));

        this.exchangeAmountEl.addEventListener('keyup', this.onExchangeAmountKeyup.bind(this));
        this.exchangeAmountEl.addEventListener('input', this.onExchangeAmountInput.bind(this));

        if (this._currency === null)
            this.shadowRoot.getElementById('currencyText').style.display = 'none';

        if (this._currency === null || this._exchangeCurrency === null || this._currency === this._exchangeCurrency)
            this.shadowRoot.getElementById('target').style.display = 'none';
    }


    onKeydown(event) {
        switch (event.code) {
            case 'Enter':
                const event = new CustomEvent('submit', {'bubbles': true, 'cancelable': true});
                this._form.dispatchEvent(event);
                break;
        }
    }

    onFormData(event) {
        event.formData.append(this._name, this.prepareFormData(this._amount));

        if (this._exchangeCurrency != null && this._currency !== this._exchangeCurrency) {
            const formName = `exchange${this._name[0].toUpperCase()}${this._name.slice(1)}`;
            event.formData.append(formName, this.prepareFormData(this._exchangeAmount));
        }
    }

    onAmountKeyup() {
        this.formatCurrency(this.amountEl);
        this._amount = this.amountEl.value;
    }

    onAmountInput(event) {
        this._amount = event.target.value;
        this.dispatchEvent(new CustomEvent('input', {bubbles: true, cancelable: false}));
    }

    onAmountChange(event) {
        this.dispatchEvent(new CustomEvent('change', {bubbles: true, cancelable: false}));
    }

    onExchangeAmountKeyup() {
        this.formatCurrency(this.exchangeAmountEl);
        this._exchangeAmount = this.exchangeAmountEl.value;
    }

    onExchangeAmountInput(event) {
        this._exchangeAmount = event.target.value;
    }


    prepareFormData(val) {
        const value = this.splitValue(val);
        if (value.integerValue == null)
            return '';

        value.integerValue = value.integerValue.replace(/[^0-9]/g, '');
        if (value.decimalValue != null)
            value.decimalValue = value.decimalValue.replace(/[^0-9]/g, '');

        return value.join(this._valueDecimalSeparator);
    }

    formatNumber(val) {
        const value = this.splitValue(val);
        if (value.integerValue == null)
            return '';

        value.integerValue = value.integerValue
            .replace(/\D/g, '')
            .replace(/\B(?=(\d{3})+(?!\d))/g, this._hundredSeparator);

        if (value.decimalValue !== null)
            value.decimalValue = value.decimalValue.replace(/\D/g, "");

        return value.join(this._decimalSeparator);
    }

    formatCurrency(input) {
        let inputVal = input.value;
        if (inputVal === "") {
            return;
        }
        const originalLen = inputVal.length;
        let caretPos = input.selectionStart;

        inputVal = this.formatNumber(inputVal);

        input.value = inputVal;
        const updatedLen = inputVal.length;
        caretPos = updatedLen - originalLen + caretPos;
        input.setSelectionRange(caretPos, caretPos);
    }

    splitValue(value) {
        const result = {
            integerValue: null,
            decimalValue: null,
            join(separator) {
                if (this.decimalValue != null)
                    return this.integerValue + separator + this.decimalValue;

                return this.integerValue;
            }
        };

        if (value == null || value === 'undefined' || value.trim() === '')
            return result;

        if (value.indexOf(this._decimalSeparator) >= 0) {
            const decimalPos = value.indexOf(this._decimalSeparator);
            result.integerValue = value.substring(0, decimalPos);
            result.decimalValue = value.substring(decimalPos);
        } else {
            result.integerValue = value;
        }

        return result;
    }

    convertValue(value) {
        return value.replace(this._valueDecimalSeparator, this._decimalSeparator);
    }
}

customElements.define('s-money-input', MoneyInput);