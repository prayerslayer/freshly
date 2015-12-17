class SearchTransition {
    appliesTo(from, to) {
        return to.startsWith('/search/');
    }

    run(from, to) {
        Freshly.view.search.updateFromUrl();
        if (from.startsWith('/search/')) {
            return;
        }

        var animationDone = this.runAnimation();
        var contentLoaded = this.loadContent(to);

        Promise.all([animationDone, contentLoaded]).then(data => {
            data[1].children().not('#search').appendTo($('#main'));

            Freshly.view.detach();
            Freshly.view = new Freshly.CatalogView();
        });
    }

    runAnimation() {
        return new Promise((resolve, reject) => {
            var root = $('body');
            var searchElement = Freshly.view.search.getElement();

            var elements = searchElement.parent().children().not(searchElement);
            elements.addClass('removing');

            var background = root.children('#background');
            background.css({opacity: 0});

            var currentPos = searchElement.position();
            currentPos.left = (searchElement.parent().width() - searchElement.width()) / 2;
            searchElement.css({top: currentPos.top, left: currentPos.left, position: 'absolute'});
            searchElement.next().css({marginTop: searchElement.outerHeight(true)});

            window.setTimeout(() => {
                searchElement.css({top: 0, marginTop: 0, boxShadow: 'none'});
                $('body').animate({scrollTop: 0}, 500);

                searchElement.one('transitionend webkitTransitionEnd oTransitionEnd', () => {
                    console.log('transition end!');

                    elements.remove();
                    background.remove();

                    root.removeClass('index').addClass('catalog');
                    searchElement.attr('style', null);

                    resolve();
                });
            });
        });
    }

    loadContent(path) {
        return $.get(path).then(result => {
            return $(result).filter('#main');
        });
    }
}

export default SearchTransition;
