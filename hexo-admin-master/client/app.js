/**
 * admin menu bar
 * @param  {[type]} 'react-router' [description]
 * @return {[type]}                [description]
 */
var Link = require('react-router').Link
var React = require('react')

var App = React.createClass({
  render: function () {
    return <div className="app">
      <div className="app_header">
        <img src="logo.png" className="app_logo"/>
        <span className="app_title">Post Admin</span>
        <ul className="app_nav">
          <li><Link to="posts">Post</Link></li>
          <li><Link to="pages">Page</Link></li>
          <li><Link to="about">About</Link></li>
      
          <li><Link to="settings">Settings</Link></li>
          <li><Link to="datas">gestion des match</Link></li>
          <li><Link to="teams">gestion des équipe</Link></li>
        </ul>
      </div>
      <div className="app_main">
        <this.props.activeRouteHandler/>
      </div>
    </div>;
  }
})

module.exports = App
