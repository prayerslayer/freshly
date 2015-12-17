import Signal from '../common/Signal';

class SearchField {
    constructor(element) {
        this._element = element;

        this._cleanup = [];

        this.changed = Signal.create();

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
        var term = this.getTerm();
        this._element.find('input').val(term || '');

        this.changed(this.getTerm());
    }

    search(value) {
        console.log('search:', value);

        history.pushState({}, `search:${value}`, `/search/${encodeURIComponent(value)}`);
        window.onpopstate({state: null});
    }

    getElement() {
        return this._element;
    }

    getTerm() {
        if (window.location.pathname.startsWith('/search/')) {
            return decodeURIComponent(window.location.pathname.substring('/search/'.length));
        }

        return null;
    }
}

export default SearchField;
