import $ from 'jquery';
import PreviewArticle from  './PreviewArticle';
import uuid from 'uuid';

class PreviewGrid {
    constructor(heroElement, articles, colWidth, colSpacing) {
        this._element = $('<main class="previewGrid" />');
        this._heroEl = heroElement || $('<h1>Könnte Dir gefallen:</h1>');
        this._articleDatas = articles;
        this._colWidth = colWidth;
        this._colSpacing = colSpacing;
        this.init();
    }

    getElementId() {
        return 'preview:' + uuid.v4();
    }

    init() {
        // add hero
        var heroContainer = $('<div class="hero"/>');
        heroContainer.css({
            width: this._colWidth + 'px',
            marginRight: this._colSpacing + 'px',
            paddingLeft: (this._colSpacing / 2) + 'px',
            paddingRight: (this._colSpacing / 2) + 'px'
        });
        heroContainer.append(this._heroEl);

        var articleContainer = $('<div class="articles"/>');
        this._element.append(heroContainer);
        this._element.append(articleContainer);

        var articleWidth = (this._colWidth - 10) / 2;

        this._articleDatas.forEach(articleData => {
            var article = new PreviewArticle(articleData),
                element = article.render();
            element.css({
                width: articleWidth
            });
            article.loaded.connect(() => {
                articleContainer.append(element);
            })
        });
    }

    render() {
        return this._element;
    }
}

export default PreviewGrid;
