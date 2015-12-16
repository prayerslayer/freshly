import SearchField from '../common/SearchField';

class HomeView {
    constructor() {
        this.search = new SearchField($('#search'));

        this.bootstrapWinterschuhe();
    }

    detach() {
        this.search.detach();
    }

    bootstrapWinterschuhe() {
        var element = $('.search.winterschuhe');
        element.click(() => this.search.search('winterschuhe'));

        var articlesRequest = $.getJSON('/articles?search=winterschuhe');
        articlesRequest.done(articlesResult => {
            articlesResult.map(article => $(`<li><img src="${article.imageUrls[0]}" /></li>`))
            .forEach(article => article.appendTo(element.find('.results')));
        });
    }
}

export default HomeView;
