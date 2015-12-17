import $ from 'jquery';
import PreviewArticle from  './PreviewArticle';
import uuid from 'uuid';

class PreviewGrid {
    constructor(teaserElement, articles, articleClicked) {
        this._element = $('<main class="previewGrid" />');
        this._teaserEl = teaserElement || $('<div><h2>Könnte Dir gefallen:</h2><h3>Das da</h3></div>');
        this._articleDatas = articles;
        this._articleClicked = articleClicked;
        this._id = uuid.v4();
        this.init();
    }

    getElementId() {
        return 'preview:' + this._id;
    }

    init() {
        // add hero
        this._element.append(this._teaserEl);

        var articleContainer = $('<ul class="results"/>');
        this._element.append(articleContainer);

        this._articleDatas.forEach(articleData => {
            var article = new PreviewArticle(articleData),
                element = article.render();
            article.clicked.connect(this._articleClicked);
            article.loaded.connect(() => {
                articleContainer.append($('<li/>').append(element));
            })
        });
    }

    render() {
        return this._element;
    }
}

export default PreviewGrid;
