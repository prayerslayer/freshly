import $ from 'jquery';
import Signal from '../common/Signal';
import ArticleControls from './ArticleControls';

class ArticleDetails {
    constructor(articleData, articleChanged) {
        this._data = articleData;
        this._loading = 0;

        this._element = null;
        this._imagesElement = null;
        this._activeImageElement = null;

        this.liked = Signal.create();
        this.disliked = Signal.create();
        this.destroy = Signal.create();

        this._articleControls = new ArticleControls(this._data);
        this._articleControls.liked.connect(this.liked);
        this._articleControls.disliked.connect(this.disliked);

        if (!!articleChanged) {
            var cleanup = articleChanged.connect(articleData.sku, () => this._articleControls.update());
            this.destroy.connect(cleanup);
        }
    }

    render() {
        this._imagesElement = $('<div class="images" />');
        this._data.imageUrls.forEach(url => this.appendImage(url));

        this._activeImageElement = $('<div class="active-image" />');

        var content = $('<div class="content" />');
        var header = $('<header />').appendTo(content);
        $('<h3 />').text(this._data.brand).appendTo(header);
        $('<h4 />').text(this._data.name).appendTo(header);

        content.append(this._articleControls.render(this));

        $('<span class="price" />').text(this._data.price).appendTo(content);
        $('<img class="brand-logo" />').attr('src', this._data.brandLogo).appendTo(content);

        $('<ul class="attributes" />').append(this._data.attributes.map(attribute => $('<li />').text(attribute)))
                                      .appendTo(content);

        this._element = $('<article class="article-details" />').append(this._imagesElement)
                                                                .append(this._activeImageElement)
                                                                .append(content);

        this.selectImage(this._imagesElement.find('img').eq(0));

        this._element.data().onDestroy = () => this.destroy();

        return this._element;
    }

    appendImage(url) {
        this._loading++;

        var container = $('<div />');
        var image = $('<img />').on('load', () => this.imageLoaded(true, container))
                                .on('error', () => this.imageLoaded(false, container))
                                .on('mouseenter', () => this.selectImage(image))
                                .attr('src', url)
                                .appendTo(container);

        this._imagesElement.append(container);
    }

    imageLoaded(success, container) {
        this._loading--;

        if (success) {
            var img = container.find('img').get(0);
            if (img.naturalWidth > img.naturalHeight) {
                // 360 degree image -> we dont want that!
                return;
            }

            container.addClass('loaded');
        }
    }

    selectImage(imageElement) {
        var children = this._activeImageElement.children();
        var newSrc = imageElement.attr('src');

        var currentElement = children.last();
        if (currentElement.attr('src') === newSrc) {
            // nothing to change
            return;
        }

        children.addClass('leave');
        window.setTimeout(() => children.remove(), 1000);

        $('<img />').attr('src', newSrc)
                    .appendTo(this._activeImageElement);
    }
}

export default ArticleDetails;
