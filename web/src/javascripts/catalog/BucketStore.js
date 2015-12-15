class BucketStore {
    constructor() {
        this._buckets = {};
        this._dislikeBuckets = {};
        this._knownIds = {};
        this._dislikedIds = {};
    }

    createBucket(id, articles) {
        var self = this;
        function filterArticlesForDislike(){
           for(var dislikeBucket in self._dislikeBuckets) {
               if (self._dislikeBuckets.hasOwnProperty(dislikeBucket)){
                   var articleIndex = [];
                   var bucketIndex = [];
                   for (var i = 0; i < articles.length; i++){
                       for(var j = 0; j < self._dislikeBuckets[dislikeBucket].length; j++) {
                           if(articles[i].sku === self._dislikeBuckets[dislikeBucket][j]) {
                               articleIndex.push(i);
                               bucketIndex.push(j);
                           }
                       }
                       bucketIndex.sort(function (a,b) {return b-a});
                       while (bucketIndex.length > 0) {
                           self._dislikeBuckets[dislikeBucket].splice(bucketIndex.shift(), 1);
                       }
                   }
                   articleIndex.sort(function (a,b) {return b-a});
                   while (articleIndex.length > 0) {
                       articles.splice(articleIndex.shift(), 1);
                   }
               }
           }
        }
        
        if (id in this._buckets) {
            throw 'bucket already exists: ' + id;
        }
        filterArticlesForDislike();
        this._buckets[id] = articles;
    }
    
    createDislikeBucket(id, skus) {
        if (id in this._dislikeBuckets)  {
            throw 'dislike bucket already exists:'  + id;
        }
        
        this._dislikeBuckets[id] = skus;
    }
                                  
    fetch(maxResults) {
        var results = [];

        // array of all non-empty buckets
        var buckets = Object.keys(this._buckets).map(key => this._buckets[key])
                                                .filter(b => b.length > 0);

        while (results.length < maxResults) {
            if (buckets.length === 0) {
                break;
            }

            var index = Math.floor(Math.random() * buckets.length);
            var bucket = buckets[index];

            var item = bucket.shift();

            // we dont need empty buckets in this method
            if (bucket.length === 0) {
                buckets.splice(index, 1);
            }

            // only return items, that have never been returned before
            if (!this._knownIds[item.sku]) {
                results.push(item);
                this._knownIds[item.sku] = true;
            }
        }

        return results;
    }

    fetchFromBucket(bucketId, maxResults) {
        var results = [];
        var bucket = this._buckets[bucketId];

        while (results.length < maxResults) {
            if (bucket.length === 0) {
                break;
            }

            var item = bucket.shift();

            // only return items, that have never been returned before
            if (!this._knownIds[item.sku]) {
                results.push(item);
                this._knownIds[item.sku] = true;
            }
        }

        return results;
    }

    removeFromAllBuckets(sku) {
        this._dislikedIds[sku] = true;
        for (var bucket in this._buckets) {
            var index;
            if (this._buckets.hasOwnProperty(bucket)) {
                for (var i = 0; i < this._buckets[bucket].length; i++) {
                    if(this._buckets[bucket][i].sku === sku) {
                        index = i;
                        break;
                    }
                }
                if(index)  {
                    console.log(this._buckets[bucket].length);
                    this._buckets[bucket].splice(index, 1);
                    console.log(this._buckets[bucket].length);
                }
            }
        }
    }
    
    removeFromBucket(baseSku, skus) {
        for(var sku in skus) {
            var index;
            for(var bucket in this._buckets) {
                if (this._buckets.hasOwnProperty(bucket)){
                    for (var i = 0; i < this._buckets[bucket].length; i++) {
                        if(this._buckets[bucket][i].sku === sku) {
                            index = i;
                            break;
                        }
                    }
                    if(index)  {
                        this._buckets[bucket].splice(index, 1);
                        break;
                    }
                }
            }
            
        }
        
        this.createDislikeBucket(baseSku, skus);
    }
}

export default BucketStore;
