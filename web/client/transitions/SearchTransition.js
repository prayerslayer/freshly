class SearchTransition {
    appliesTo(from, to) {
        return to.startsWith('/search/');
    }

    run() {
        var searchTerm = window.location.pathname.substring('/search/'.length);
        console.log('term:', searchTerm);

        var searchElement = Freshly.view.getSearchElement();
        searchElement.find('input').val(searchTerm);

        var root = searchElement.closest('.index');

        var elements = searchElement.parent().children().not(searchElement);
        elements.addClass('removing');

        var background = root.children('.background');
        background.css({opacity: 0});

        var currentPos = searchElement.position().top;
        searchElement.css({top: currentPos, position: 'absolute'});
        window.setTimeout(() => {
            searchElement.css({top: 0, marginTop: 0});

            root.one('transitionend webkitTransitionEnd oTransitionEnd', () => {
                elements.remove();
                background.remove();

                root.removeClass('index').addClass('catalog');
                searchElement.attr('style', null);
            });
        });
    }
}

export default SearchTransition;
