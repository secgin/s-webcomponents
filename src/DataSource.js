export default class DataSource {
    constructor(config = {}) {
        this.abortController = null;
        this.debounceTimeout = null;        
        this.paramName = config.paramName || 'search';
        this.mapper = config.mapper || null;
        this.filter = config.filter || null;
        this.debounce = config.debounce || 500;
    }

    setConfig(config = {}) {
        this.paramName = config.paramName || 'search';
        this.mapper = config.mapper || null;
        this.filter = config.filter || null;
        this.debounce = config.debounce || 500;
    }

    fetchJson(baseUrl, searchValue = '', options = {}, onStartCallback = null) {
        if (this.abortController)
            this.abortController.abort();
    
        this.abortController = new AbortController();
    
        if (this.debounceTimeout)
            clearTimeout(this.debounceTimeout);        

        const url = new URL(baseUrl, window.location.origin);
        url.searchParams.set(this.paramName, searchValue);

        return new Promise((resolve, reject) => {
            this.debounceTimeout = setTimeout(() => {
                if (onStartCallback && typeof onStartCallback === 'function') {
                    onStartCallback();
                }
                fetch(url, { ...options, signal: this.abortController.signal })
                    .then(resp => resp.json())
                    .then(data => {
                        if (!data || (Array.isArray(data) && data.length === 0)) {
                            resolve([]);
                            return;
                        }

                        if (this.mapper && typeof this.mapper === 'function') {
                            data = this.mapper(data);
                        }

                        if (this.filter && typeof this.filter === 'function') {
                            data = this.filter(data, searchValue);
                        }
                        resolve(data);
                    })
                    .catch(err => {
                        if (err && err.name === 'AbortError') {
                            resolve([]);
                        } else {
                            reject(err);
                        }
                    });
            }, this.debounce);
        });
    }
}