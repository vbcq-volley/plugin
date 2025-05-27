var React = require('react/addons')
var cx = React.addons.classSet
var Link = require('react-router').Link;
var Router = require('react-router');
var _ = require('lodash')
var moment = require('moment')
var SinceWhen = require('./since-when')

var Rendered = require('./rendered')
var DataFetcher = require('./data-fetcher');
var Newteam = require('./new-team')
var api = require('./api');

var Teams = React.createClass({
  mixins: [DataFetcher((params) => {
    return {
      teams: api.getEntries("team").then((teams) =>
        _.sortBy(teams, ['date']).reverse()
      )
    }
  })],

  getInitialState: function () {
    return {
      selected: 0
    }
  },

  _onNew: function (team) {
    var teams = this.state.teams.slice()
    teams.unshift(team)
    this.setState({teams: teams})
    Router.transitionTo('team', {matchId: team._id})
  },

  goTo: function (id, e) {
    if (e) {
      e.preventDefault()
    }
    Router.transitionTo('team', {matchId: id})
  },

  render: function () {
    if (!this.state.teams) {
      return <div className='teams'>Loading...</div>
    }
    var current = this.state.teams[this.state.selected] || {}
    var url = window.location.href.replace(/^.*\/\/[^\/]+/, '').split('/')
    var rootPath = url.slice(0, url.indexOf('admin')).join('/')
    return <div className="posts">
      <ul className='posts_list'>
        <Newteam onNew={this._onNew}/>
        {
          this.state.teams.map((team, i) =>
            <li key={team._id} className={cx({
                "posts_post": true,
                "posts_post--draft": team.isDraft,
                "posts_post--selected": i === this.state.selected
              })}
              onDoubleClick={this.goTo.bind(null, team._id)}
              onClick={this.setState.bind(this, {selected: i}, null)}
            >
              <span className="posts_post-title">
                {team.teamName}
              </span>
              <span className="posts_post-date">
                {moment(team.date).format('MMM Do YYYY')}
              </span>
              <a className='posts_perma-link' target="_blank" href={rootPath + '/' + team.path}>
                <i className='fa fa-link'/>
              </a>
              <Link className='posts_edit-link' to="team" matchId={team._id}>
                <i className='fa fa-pencil'/>
              </Link>
            </li>
          )
        }
      </ul>
      <div className={cx({
        'posts_display': true,
        'posts_display--draft': current.isDraft
      })}>
        {current.isDraft && <div className="posts_draft-message">Draft</div>}
        <Rendered
          ref="rendered"
          className="posts_content"
          text={JSON.stringify(current,null,2)}
          type="team"/>
      </div>
    </div>
  }
});

module.exports = Teams;
