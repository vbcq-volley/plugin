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
        <div className="app_header-left">
          <img src="logo.png" className="app_logo"/>
          <span className="app_title">Admin Panel</span>
        </div>
        <ul className="app_nav">
          <li><Link to="posts">Posts</Link></li>
          <li><Link to="pages">Pages</Link></li>
          <li><Link to="teams">Équipes</Link></li>
          <li><Link to="stades">Stades</Link></li>
          <li><Link to="results">Résultats</Link></li>
          <li><Link to="datas">Matchs</Link></li>
          <li><Link to="settings">Paramètres</Link></li>
          <li><Link to="about">À propos</Link></li>
        </ul>
      </div>
      <div className="app_main">
        <this.props.activeRouteHandler/>
      </div>
    </div>;
  }
})

module.exports = App
