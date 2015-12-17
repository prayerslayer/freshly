import SearchField from '../common/SearchField';
import PreviewGrid from '../catalog/PreviewGrid';
import Signal from '../common/signal';

class HomeView {
    constructor() {
        this.search = new SearchField($('#search'));

        this.bootstrapWinterschuhe();
    }

    detach() {
        this.search.detach();
    }

    bootstrapWinterschuhe() {
        var teaser = $($('template#trending-winter').html().trim());
        var element = $('.search.winterschuhe');
        element.click(() => this.search.search('winterschuhe'));
        var clicked = Signal.create();
        var articlesRequest = $.getJSON('/articles?search=winterschuhe&maxResults=15');
        articlesRequest.done(articlesResult => {
            var preview = new PreviewGrid(teaser, articlesResult, clicked);
            element.append(preview.render());
        });
    }
}

export default HomeView;
