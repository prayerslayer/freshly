/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  ListView,
  StyleSheet,
  TextInput,
  Text,
  TouchableNativeFeedback,
  View,
} = React;

var REQUEST_URL = 'http://localhost:8081/api/keywords';

var enhancedSearch = React.createClass({
  getInitialState: function() {
    return {
        text: null,
        resultingItems: new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2
        })
    }
  },
  submitButtonClicked: function() {
    if (this.state.text) {
        let keywords = this.state.text.split(' ');
        this.fetchData(keywords);
    }
  },

  fetchData: function(payLoad) {
    let body = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'keywords': payLoad
          })
    };

    fetch(REQUEST_URL, payLoad).then(function(res) {
        if (res.ok) {
            res.json().then(function(resJson) {
                    return resJson;
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
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Enhanced Article Search
        </Text>
        <View style={styles.searchRow}>
            <TextInput style={styles.searchField} onChangeText={(text) => this.setState({text})}
              placeholder='Enter keywords' value={this.state.text}/>
            <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple()}
             style={styles.button} onPress={this.submitButtonClicked}>
                <View style={{backgroundColor: 'gray'}}>
                    <Text style={styles.search}>
                      Search
                    </Text>
                </View>
            </TouchableNativeFeedback>
        </View>
        <ListView dataSource={this.state.resultingItems}
            renderRow={(rowData) => <Text>{rowData}</Text>}
        />
      </View>
    );
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  searchRow: {

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
    color: '#ffffff',
    marginBottom: 7,
  }
});

AppRegistry.registerComponent('enhancedSearch', () => enhancedSearch);
