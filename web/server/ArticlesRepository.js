import Repository from './resource/Repository';

var request = require('request');

function get(path) {
    return new Promise(function (resolve, reject) {
        console.log('start request: ' + path);
        try {
            request.get('https://api.zalando.com' + path,
                {
                    json: true,
                    headers: {
                        'Accept-Language': 'de-DE'
                    }
                },
                function (error, response, body) {
                    console.log('received response: ' + response.statusCode);
                    if (error || response.statusCode !== 200) {
                        reject(error);
                    } else {
                        resolve(body);
                    }
                });
        } catch (error) {
            reject(error);
        }
    });
}

function mapArticle(article) {
    return {
        sku: article.id,
        brand: article.brand && article.brand.name,
        brandLogo: article.brand && article.brand.logoUrl,
        name: article.name,
        imageUrls: article.media && article.media.images &&
            article.media.images.map(image => image.mediumHdUrl),
        price: article.units && article.units[0] && article.units[0].price &&
            article.units[0].price.formatted,
        attributes: (article.additionalInfos || [])
            .filter(info => info && info.length > 0)
            .concat((article.attributes || [])
                .map(attribute => attribute.name + ': ' + attribute.values.join(', ')))
    };
}

function listByCategory(category) {
    var articlesRequest = get('/articles?category=' + category);
    return articlesRequest.then(result => result.content.map(mapArticle));
}

function listBySearch(search) {
    var articlesRequest = get('/articles?fullText=' + search);
    return articlesRequest.then(result => result.content.map(mapArticle));
}

function listByLike(article, max) {
    var recoRequest = get('/recommendations/' + article + '?pageSize=' + max);
    return recoRequest.then(result => {
        var ids = result.map(recoArticle => recoArticle.id);
        var paramStr = ids.map(id => 'articleId=' + id).join('&');

        var articlesRequest = get('/articles?' + paramStr);
        return articlesRequest.then(articlesResult => {
            var articles = articlesResult.content.reduce(
                (collect, article) => { collect[article.id] = article; return collect; },
                {});

            return ids.map(id => articles[id]).map(mapArticle);
        });
    });
}

class ArticlesRepository extends Repository {
    list(params) {
        if (params.category) {
            return listByCategory(params.category);
        } else if (params.like) {
            return listByLike(params.like, params.maxResults || 50);
        } else if (params.search) {
            return listBySearch(params.search, params.maxResults || 50);
        }

        throw 'illegal request: ' + params;
    }
}

export default ArticlesRepository;
