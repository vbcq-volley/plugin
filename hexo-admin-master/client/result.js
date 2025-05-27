var React = require('react/addons')
var Router = require('react-router')
var Editor_data = require('./editor-data')

var Result = React.createClass({
  render: function() {
    return <Editor_data
      id={this.props.params.id}
      type="result"
    />
  }
})

module.exports = Result 