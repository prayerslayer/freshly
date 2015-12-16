var React = require('react-native');

var {
    AppRegistry,
    Image,
    View,
    } = React;

var MockItem = React.createClass({

    render: function() {
        return (
            <View>
                <Image source={{uri: 'img/hemd1.jpg'}} />
            </View> );
    },

});

module.exports = MockItem;

AppRegistry.registerComponent('MockItem', () => MockItem);