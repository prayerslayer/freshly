import $ from 'jquery';

class Text {
    constructor(content) {
        this._content = content;
    }

    render() {
        this._element = $('<summary class="text" />');

        this._element.append('<h1>' + this._content + '</h1>');

        return this._element;
    }

    getElementId() {
        return 'text:' + this._content;
    }
}

export default Text;
