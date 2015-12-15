require.config({
    paths: {
        'jquery': 'lib/jquery/dist/jquery',
        'freshly': 'freshly'
    }
});

// load all necessary dependencies
require(['freshly', 'jquery'], function(Freshly, $) {
    console.log('bootstrapped', freshly);
    var view = new Freshly.default($('#main'));
    view.bootstrap();
});
