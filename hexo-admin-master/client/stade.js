var React = require('react/addons')
var Router = require('react-router')
var Editor_data = require('./editor-data')

var Stade = React.createClass({
  render: function() {
    return <Editor_data
      id={this.props.params.id}
      type="stade"
    />
  }
})

module.exports = Stade 