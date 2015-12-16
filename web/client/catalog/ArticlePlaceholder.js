import $ from 'jquery';
import uuid from 'uuid';

class ArticlePlaceholder {
    constructor() {
        this._id = uuid.v4();
    }

    render() {
        this._element = $('<summary class="article" />');

        return this._element;
    }

    getElementId() {
        return 'placeholder:' + this._id;
    }
}

export default ArticlePlaceholder;
