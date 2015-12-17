import $ from 'jquery';
import Article from './Article';
import ArticlePlaceholder from './ArticlePlaceholder';
import ArticleDetails from './ArticleDetails';
import ArticleGrid from './ArticleGrid';
import BucketStore from './BucketStore';
import CatalogControls from './CatalogControls';
import DetailOverlay from './DetailOverlay';
import Look from './Look';
import Text from './Text';
import Signal from '../common/Signal';
import SearchField from '../common/SearchField';
import PreviewGrid from './PreviewGrid';

const GRID_ROWS = 4,
      GRID_COL_WIDTH = 277,
      GRID_ROW_HEIGHT = 400,
      GRID_SPACING = 20;

class CatalogView {
    constructor() {
        this._element = $('#results');
        this.search = new SearchField($('#search'));

        this._init();

        this._controls = new CatalogControls();
        this._detailOverlay = new DetailOverlay();
        this._grid = new ArticleGrid(GRID_ROWS, GRID_COL_WIDTH, GRID_ROW_HEIGHT, GRID_SPACING);
        this._subgrids = [];

        this.articleChanged = Signal.create();

        this._cleanup = [];

        this.bootstrap();
    }

    _init() {
        this._openedArticles = {};
        this._likedArticles = {};
        this._dislikedArticles = {};
        this._likedLooks = {};

        this._numFetches = 0;

        this._currentRequestId = 0;
        this._activeRequests = {};

        this._buckets = new BucketStore();
        this._looks = [];
        this._skuPosition = {};
    }

    bootstrap() {
        var searchTerm = this.search.getTerm();
        this._cleanup.push(
            this.search.changed.connect(term => this.purgeAndLoadArticles(term))
        );

        this._gender = this._element.attr('data-gender');

        var catalogElement = $('<div class="catalog" />').append(this._grid.render());

        this._element.append(catalogElement)
                     .append(this._detailOverlay.render())
                     .append(this._controls.render());


        this._cleanup.push(
            this._controls.clicked.connect(() => {
                this.openOverlay();
            })
        );

        // fetch some base articles
        this.loadArticles(this.search.getTerm());

        // connect scroll and resize handlers
        var checkVisible = () => this.checkVisibleArticles();
        this._cleanup.push(() => {
            $(window).off('scroll', checkVisible);
            $(window).off('resize', checkVisible);
        });

        $(window).scroll(() => this.checkVisibleArticles());
        $(window).resize(() => this.checkVisibleArticles());
    }

    detach() {
        this.search.detach();

        this._cleanup.forEach(cleanup => cleanup());
    }

    purgeAndLoadArticles(term) {
        this._init();
        this._grid.purge();
        this.loadArticles(term);
    }

    loadArticles(term) {
        var articlesRequest = $.getJSON('/articles?search=' + term + '&maxResults=200');
        articlesRequest.done(articlesResult => this.createBucket('search', articlesResult));

        // fetch related search queries
        $.get('/relatedSearch?search=' + term)
        .done(relatedResults => relatedResults.forEach(result => this.addRelatedSearch(result)));
    }

    addRelatedSearch(searchData) {
        var preview = new PreviewGrid(null, searchData.articles, GRID_COL_WIDTH, GRID_SPACING);
        this._grid.add(preview.getElementId(), preview.render(), null, null, GRID_ROWS, 1);
    }

    createBucket(bucketId, articlesData, insertInlineBelow) {
        var insertInline = !!insertInlineBelow;
        var gender = this._element.attr('data-gender');

        this._buckets.createBucket(bucketId, articlesData);
        if (insertInline) {
            // between 2 and 4 articles are inserted inline
            var numInsert = Math.floor(Math.random() * 3) + 2;

            this.addArticlesInline(this._buckets.fetchFromBucket(bucketId, numInsert), insertInlineBelow);
        }

        this._looks = this._looks.concat(articlesData.filter((article) => {
            return article.lookSku !== null && article.lookGender === gender;
        }));

        this.checkVisibleArticles();
    }

    removeSkusFromBucket(singleSku, skuList, elementId) {
        var replacementData = this._buckets.fetch(1);

        if (replacementData.length > 0) {
            this.addArticle(replacementData[0], null, null,
                (newElementId, newElement) => {
                    this._grid.removeAndReplace(elementId, newElementId, newElement);
                    this._skuPosition[singleSku] = false;
                    this._skuPosition[replacementData[0].sku] = newElementId;
                });
        }
        this._buckets.removeFromAllBuckets(singleSku);
        var self = this;
        var skusToRemove = [];
        for (var sku in skuList) {
            if(skuList.hasOwnProperty(sku)){
                if (this._skuPosition[skuList[sku]]) {
                    var replacement = this._buckets.fetch(1);
                    if(replacement.length > 0) {
                        this.addArticle(replacement[0], null, null,
                            (newElementId, newElement, oldSku, newSku) => {
                                self._grid.removeAndReplace(self._skuPosition[oldSku], newElementId, newElement);
                                self._skuPosition[oldSku] = false;
                                self._skuPosition[newSku] = newElementId;
                            }, skuList[sku]);
                        skusToRemove.push(sku);
                    }
                }
            }
        }
        this._buckets.removeFromBucket(singleSku, skuList);
    }

    createRequest() {
        var requestId = this._currentRequestId++;

        this._activeRequests[requestId] = {
            id: requestId,
            at: Date.now()
        };

        return requestId;
    }

    hasActiveRequests() {
        var after = Date.now() - 2000;

        var result = {};
        Object.keys(this._activeRequests).map(key => this._activeRequests[key])
                                         .filter(request => request.at > after)
                                         .forEach(request => result[request.id] = request);

        this._activeRequests = result;

        return Object.keys(this._activeRequests).length > 0;
    }

    checkVisibleArticles() {
        if (this.hasActiveRequests()) {
            return;
        }

        var filledHeight = this._grid.getFilledHeight();
        var viewportBottom = $(window).scrollTop() + $(window).height();

        if (filledHeight < viewportBottom + 200) {
            // insert 4-8 articles
            var articles = this._buckets.fetch(Math.floor(Math.random() * 5) + 4);
            if (articles.length === 0) {
                return;
            }

            this._numFetches++;
            this.addArticles(articles);

            if (this._looks.length > 0 && (this._numFetches % 2) === 1) {
                var look = this._looks.shift();
                this.addLook(look);
            }
        }
    }

    addArticlesInline(articlesData, belowElementId) {
        articlesData.reduce(
            (prevIds, article) => prevIds.concat([this.addArticle(article, belowElementId, prevIds).getElementId()]),
            []);
    }

    addArticles(articlesData) {
        articlesData.forEach((article) => this.addArticle(article));
    }

    addArticle(articleData, belowElementId, notAtElementIds, addToGrid, oldSku) {
        var requestId;
        var article = new Article(articleData, this.articleChanged);

        var elementId = article.getElementId();
        var articleElement;

        article.clicked.connect(() => this.showArticleDetails(this._grid, elementId, articleData));
        article.liked.connect(() => this.likeArticle(elementId, articleData));
        article.disliked.connect(() => this.dislikeArticle(elementId, articleData));
        article.loaded.connect(
            () => {
                var pos = this.articleLoaded(requestId, elementId, articleElement, belowElementId, notAtElementIds,
                                             false, addToGrid, oldSku, articleData.sku);
                this._skuPosition[articleData.sku] = pos;
            });
        article.loadFailed.connect(() => this.articleLoadFailed(requestId));

        requestId = this.createRequest();
        articleElement = article.render();

        return article;
    }

    addLook(lookData) {
        var requestId;
        var look = new Look(lookData, this.articleChanged);

        var elementId = look.getElementId();
        var lookElement;

        look.liked.connect(() => this.likeLook(elementId, lookData));
        look.loaded.connect(
            () => this.articleLoaded(requestId, elementId, lookElement, null, null, true));
        look.loadFailed.connect(() => this.articleLoadFailed(requestId));

        requestId = this.createRequest();
        lookElement = look.render();

        return look;
    }

    articleLoaded(requestId, elementId, articleElement, belowElementId, notAtElementIds, isLook, addToGrid,
                  oldSku, newSku) {
        delete this._activeRequests[requestId];
        if (! this.hasActiveRequests()) {
            window.setTimeout(() => this.checkVisibleArticles(), 100);
        }

        if (addToGrid) {
            if(oldSku) {
                addToGrid(elementId, articleElement, oldSku, newSku);
            } else {
                addToGrid(elementId, articleElement);
            }
        } else {
            return this._grid.add(elementId, articleElement, belowElementId, notAtElementIds,
                                  isLook ? 2 : 1, isLook ? 2 : 1);
        }
    }

    articleLoadFailed(requestId) {
        delete this._activeRequests[requestId];
        if (! this.hasActiveRequests()) {
            window.setTimeout(() => this.checkVisibleArticles(), 100);
        }
    }

    showArticleDetails(grid, elementId, articleData) {
        if (!this._openedArticles[articleData.sku]) {
            this._openedArticles[articleData.sku] = true;

            var articlesRequest =
                $.getJSON('/articles?like=' + articleData.sku + '&gender=' + this._gender + '&maxResults=10');
            articlesRequest.done(
                articlesResult => this.createBucket('open:' + articleData.sku, articlesResult, null));
        }

        var details = new ArticleDetails(articleData, this.articleChanged);
        details.liked.connect(() => this.likeArticle(elementId, articleData));
        details.disliked.connect(() => this.dislikeArticle(elementId, articleData));
        details.destroy.connect(() => {
            articleData.opened = false;
            this.articleChanged(articleData.sku);
        });

        if (grid !== this._grid) {
            this._grid.hideDetails();
            var gridDesc = this._subgrids.filter(gridDesc => gridDesc.grid === grid)[0],
                gridItem = this._grid.findItem(gridDesc.id);

            if (!gridDesc.resized) {
                gridItem.height += 1;
                gridDesc.resized = true;
                this._grid.insertRowOffset(gridItem.row + gridItem.height - 1);
                this._grid.reposition(gridItem);
            }
        } else {
            this._subgrids.forEach(gridDesc => {
                var gridItem = this._grid.findItem(gridDesc.id);
                gridDesc.grid.hideDetails();
                if (gridDesc.resized) {
                    gridItem.height -= 1;
                    gridDesc.resized = false;
                    this._grid.removeRowOffsets();
                    this._grid.reposition(gridItem);
                }
            });
        }
        grid.showDetails(details.render(), elementId);

        articleData.opened = true;
        this.articleChanged(articleData.sku);
    }

    likeArticle(elementId, articleData) {
        if (!this._likedArticles[articleData.sku]) {
            this._likedArticles[articleData.sku] = articleData;
            this._controls.update({likes: Object.keys(this._likedArticles).length});

            var articlesRequest =
                $.getJSON('/articles?like=' + articleData.sku + '&gender=' + this._gender);
            articlesRequest.done(
                articlesResult => this.createBucket('like:' + articleData.sku, articlesResult, elementId));

            articleData.liked = true;
            this.articleChanged(articleData.sku);
        }
    }

    dislikeArticle(elementId, articleData) {
        if (!this._dislikedArticles[articleData.sku]) {
            this._dislikedArticles[articleData.sku] = true;
            this._controls.update({dislikes: Object.keys(this._dislikedArticles).length});

            var articleRequest =  $.getJSON('/articles?dislike=' + articleData.sku);
            articleRequest.done(
                articlesResult => this.removeSkusFromBucket(articleData.sku, articlesResult, elementId));

            articleData.disliked = true;
            this.articleChanged(articleData.sku);
        }
    }

    likeLook(elementId, lookData) {
        if (!this._likedLooks[lookData.sku]) {
            this._likedLooks[lookData.sku] = true;
            //this._controls.update({likes: Object.keys(this._likedArticles).length});

            var articlesRequest = $.getJSON('/articles/look/' + lookData.lookSku);
            articlesRequest.done(
                articlesResult => this.addArticlesInline(articlesResult, elementId));

            lookData.lookLiked = true;
            this.articleChanged(lookData.sku);
        }
    }

    openOverlay() {
        this._detailOverlay.toggleOverlay(this._likedArticles);
    }
}

export default CatalogView;
