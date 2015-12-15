import $ from 'jquery';

class RelatedSearch {
    constructor(data) {
        this._data = data;
    }

    render() {
        this._element = $('<summary class="relatedSearch" />');

        this._element.append('<div class="headline"><h1>' + this._data.search + '</h1></div>');

        return this._element;
    }

    getElementId() {
        return 'relatedSearch:' + this._data.search;
    }
}

export default RelatedSearch;
