import Repository from './resource/Repository';
import ArticlesRepository from './ArticlesRepository';
import './Array_distinct';

var express = require('express');
var path = require('path');

var app = express();

app.use('/articles', new ArticlesRepository().router());

// serve static content from public and from target/client
app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../target/client')));

app.get('/relatedSearch', (req, res) => {
    res
    .status(200)
    .json([{
        search: 'goretex',
        articles: [{
            attributes: [],
            brand: "Brandnew",
            brandLogo: "https://i1.ztat.net/brand/sam-edelman.jpg",
            imageUrls: ["https://i2.ztat.net/detail_hd/S4/91/1F/00/1Q/11/S4911F001-Q11@12.jpg"],
            name: "Pantolette - black",
            price: "100 €",
            sku: "S4911F001-Q11"
        },
        {
            attributes: [],
            brand: "Brandnew",
            brandLogo: "https://i1.ztat.net/brand/sam-edelman.jpg",
            imageUrls: ["https://i2.ztat.net/detail_hd/S4/91/1F/00/1Q/11/S4911F001-Q11@12.jpg"],
            name: "Pantolette - black",
            price: "100 €",
            sku: "S4911F001-Q12"
        },
        {
            attributes: [],
            brand: "Brandnew",
            brandLogo: "https://i1.ztat.net/brand/sam-edelman.jpg",
            imageUrls: ["https://i2.ztat.net/detail_hd/S4/91/1F/00/1Q/11/S4911F001-Q11@12.jpg"],
            name: "Pantolette - black",
            price: "100 €",
            sku: "S4911F001-Q14"
        },
        {
            attributes: [],
            brand: "Brandnew",
            brandLogo: "https://i1.ztat.net/brand/sam-edelman.jpg",
            imageUrls: ["https://i2.ztat.net/detail_hd/S4/91/1F/00/1Q/11/S4911F001-Q11@12.jpg"],
            name: "Pantolette - black",
            price: "100 €",
            sku: "S4911F001-Q17"
        }]
    }]);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send('Error: ' + err.status);
});

export default app;
