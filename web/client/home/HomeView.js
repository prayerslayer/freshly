class HomeView {
    constructor(searchElement) {
        this._searchElement = searchElement;
    }

    bootstrap() {
        console.log('HomeView::bootstrap()');

        this._searchElement.submit(() => {
            this.search(this._searchElement.find('input').val());
            return false;
        });
    }

    getSearchElement() {
        return this._searchElement;
    }

    search(value) {
        console.log('search:', value);

        history.pushState({}, `search:${value}`, `/search/${value}`);
        window.onpopstate({state: null});
    }
}

export default HomeView;
