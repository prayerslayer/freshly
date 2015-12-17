import $ from 'jquery';
import Signal from '../common/Signal';

class Article {
    constructor(data, articleChanged) {
        this._data = data;

        this.clicked = Signal.create();
        this.loaded = Signal.create();
        this.loadFailed = Signal.create();

        if (articleChanged) {
            articleChanged.connect(data.sku, () => this.articleChanged());
        }
    }

    render() {
        this._element = $('<summary class="previewArticle" />');

        var articleImage = $('<img />').on('load', () => this.loaded())
                                       .on('error', () => this.loadFailed())
                                       .on('click', () => this.clicked(this._data))
                                       .attr('src', this._data.imageUrls[0]);

        this._element
            .append($('<div class="image" />').append(articleImage));

        return this._element;
    }

    getElementId() {
        return 'article:' + this._data.sku;
    }

    articleChanged() {
        this._articleControls.update();

        if (this._data.opened) {
            this._element.addClass('opened');
        } else {
            this._element.removeClass('opened');
        }
    }
}

export default Article;
