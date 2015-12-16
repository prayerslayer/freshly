/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var Items = require('./mockItems.js');
var React = require('react-native');
var Logo = require('./img/zalando-logo.png');
var {
    AppRegistry,
    Image,
    StyleSheet,
    TextInput,
    Text,
    TouchableNativeFeedback,
    View,
} = React;

var REQUEST_URL = 'http://localhost:8081/api/keywords',
    keywords = [];

var mobile = React.createClass({
  getInitialState: function() {
    return {
        useMock: false,
        text: null,
        resultingItems: []
    }
  },
  submitButtonClicked: function() {
    if (this.state.text) {
        keywords = this.state.text.split(' ');
        this.fetchData();
    }
  },

  fetchData: function() {
        this.setState({
            resultingItems: Items,
            useMock: true
        });
        let body = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                'keywords': keywords
              })
        };

        fetch(REQUEST_URL, keywords).then(function(res) {
            if (res.ok) {
                res.json().then(function(resJson) {
                        this.setState({resultingItems: resJson});
                    });
            } else {
                console.log('Network response was not ok.')
            }
        })
        .catch(function(error) {
            console.log('There has been a problem with your fetch operation: ' + error.message);
        });
  },

  render: function() {
        let itemsView = this.state.resultingItems.map(item => {
             if(keywords.find((keyword) => {
                     return keyword === item.category
                 })) {
                 return (
                     <View key={item.name}><Image style={styles.image} source={item.source} /></View>
                 )}
        });

        return (
             <View style={styles.container}>
                 <View style={styles.logoView}>
                    <Image style={styles.logo} source={Logo}/>
                 </View>
                <Text style={styles.welcome}>
                  Enhanced Article Search
                </Text>
                <View style={styles.searchRow}>
                    <TextInput style={styles.searchField} onChangeText={(text) => this.setState({text})}
                      placeholder='Enter keywords' value={this.state.text}/>
                    <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple()}
                     style={styles.button} onPress={this.submitButtonClicked}>
                        <View style={{backgroundColor: '#f08532'}}>
                            <Text style={styles.search}>
                              Search
                            </Text>
                        </View>
                    </TouchableNativeFeedback>
                </View>
                 <View style={styles.imageList}>
                     {itemsView}
                 </View>
             </View>
        );
  },
});

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    image: {
        margin: 5,
        width: 53,
        height: 81,
    },
    imageList: {
        flex: 1,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        flexDirection: 'row',
        backgroundColor: '#F5FCFF'
    },
    logoView: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    logo: {
        height: 50,
        width: 200,
        resizeMode: 'contain'
    },
    searchField: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
    },
    search: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    button: {
        textAlign: 'center',
        color: '#f08532',
        marginBottom: 7,
  }
});

AppRegistry.registerComponent('mobile', () => mobile);
