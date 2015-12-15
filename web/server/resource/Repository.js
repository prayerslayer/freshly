var express = require('express');

class Repository {
    parseId(asString) {
        return asString;
    }

    router() {
        var router = express.Router();

        function send(req, res, promise) {
            promise.then(result => res.json(result),
                error => { 
                    console.error('error: ' + error);
                
                    res.status(500)
                        .type('text')
                        .send('error: ' + error);
                });
        }

        if (this.load) {
            router.get('/:id', (req, res) => send(req, res, this.load(this.parseId(req.params.id))));
        }

        if (this.list) {
            router.get('/', (req, res) => send(req, res, this.list(Object.assign({}, req.query, req.params))));
        }

        return router;
    }
}

export default Repository;
