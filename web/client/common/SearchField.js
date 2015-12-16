class SearchField {
    constructor(element) {
        this._element = element;

        this._cleanup = [];

        var onSubmit = () => {
            this.search(this._element.find('input').val());
            return false;
        };
        this._cleanup.push(() => this._element.off('submit', onSubmit));
        this._element.submit(onSubmit);

        this.updateFromUrl();
    }

    detach() {
        this._cleanup.forEach(cleanup => cleanup());
    }

    updateFromUrl() {
        if (window.location.pathname.startsWith('/search/')) {
            this._element.find('input').val(window.location.pathname.substring('/search/'.length));
        }
    }

    search(value) {
        console.log('search:', value);

        history.pushState({}, `search:${value}`, `/search/${value}`);
        window.onpopstate({state: null});
    }

    getElement() {
        return this._element;
    }
}

export default SearchField;
