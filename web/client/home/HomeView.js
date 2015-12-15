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

    search(value) {
        console.log('search:', value);

        this.runSearchTransition();
        history.pushState({}, `search:${value}`, `/search/${value}`);
        window.onpopstate({});
    }

    runSearchTransition() {
        var elements = this._searchElement.parent().children().not(this._searchElement);
        elements.addClass('removing');

        var currentPos = this._searchElement.position().top;
        this._searchElement.css({top: currentPos, position: 'absolute'});
        window.setTimeout(() => {
            this._searchElement.css({top: 0, marginTop: 0});
        });
    }
}

export default HomeView;
