import $ from 'jquery';
import Signal from '../common/Signal';
import ArticleControls from './ArticleControls';

class Article {
    constructor(data, articleChanged) {
        this._data = data;

        this.clicked = Signal.create();
        this.liked = Signal.create();
        this.disliked = Signal.create();
        this.loaded = Signal.create();
        this.loadFailed = Signal.create();

        this._articleControls = new ArticleControls(data);
        this._articleControls.liked.connect(this.liked);
        this._articleControls.disliked.connect(this.disliked);

        articleChanged.connect(data.sku, () => this.articleChanged());
    }

    render() {
        this._element = $('<summary class="article" />');

        var articleImage = $('<img />').on('load', () => this.loaded())
                                       .on('error', () => this.loadFailed())
                                       .on('click', () => this.clicked())
                                       .attr('src', this._data.imageUrls[0]);

        var articlePrice = $('<span class="price" />').text(this._data.price);

        var articleBrand = $('<h3 />').text(this._data.brand);
        var articleName = $('<h4 />').text(this._data.name);

        var header = $('<header />').append(articleBrand)
                                    .append(articleName);

        this._element.append($('<div class="image" />').append(articleImage))
                     .append(articlePrice)
                     .append(header)
                     .append(this._articleControls.render());

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
