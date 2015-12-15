var webpack = require('webpack'),
    path = require('path');

module.exports = {
    devtool: 'eval',
    entry: [
        './client/index.js' // entrypoint to resolve dependencies
    ],
    output: {
        filename: 'freshly.js',
        library: 'Freshly',
        libraryTarget: 'umd',
        path: __dirname + '/dist/'
    },
    plugins: [
    ],
    resolve: {
    },
    externals: {
        jquery: 'jQuery'
    },
    module: {
        preLoaders: [
            {test: /\.js$/, exclude: /node_modules/, loaders: ['eslint']}
        ],
        loaders: [
            {test: /\.js$/, exclude: /node_modules/, loaders: ['babel']}
        ]
    }
};
