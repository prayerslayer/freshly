import $ from 'jquery';
import Signal from '../common/Signal';
import ArticleControls from './ArticleControls';

class Look {
    constructor(data, articleChanged) {
        this._data = data;

        this.liked = Signal.create();
        this.loaded = Signal.create();
        this.loadFailed = Signal.create();

        this._articleControls = new ArticleControls(data, true);
        this._articleControls.liked.connect(this.liked);

        articleChanged.connect(data.sku, () => this._articleControls.update());
    }

    render() {
        this._element = $('<summary class="look" />');

        var articleImage = $('<img />').on('load', () => this.loaded())
                                       .on('error', () => this.loadFailed())
                                       .attr('src', this._data.lookImage);

        this._element.append($('<div class="image" />')
                     .append(articleImage))
                     .append(this._articleControls.render());

        return this._element;
    }

    getElementId() {
        return 'look:' + this._data.sku;
    }
}

export default Look;
