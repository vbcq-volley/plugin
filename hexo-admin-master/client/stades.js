var React = require('react/addons')
var cx = React.addons.classSet
var Link = require('react-router').Link;
var Router = require('react-router');
var _ = require('lodash')
var moment = require('moment')
var SinceWhen = require('./since-when')

var Rendered = require('./rendered')
var DataFetcher = require('./data-fetcher');
var NewStade = require('./new-stade')
var api = require('./api');

var Stades = React.createClass({
  mixins: [DataFetcher((params) => {
    return {
      stades: api.getEntries("stade").then((stades) =>
        _.sortBy(stades, ['date']).reverse()
      )
    }
  })],

  getInitialState: function () {
    return {
      selected: 0
    }
  },

  _onNew: function (stade) {
    var stades = this.state.stades.slice()
    stades.unshift(stade)
    this.setState({stades: stades})
    Router.transitionTo('stade', {matchId: stade._id})
  },

  goTo: function (id, e) {
    if (e) {
      e.preventDefault()
    }
    Router.transitionTo('stade', {matchId: id})
  },

  render: function () {
    if (!this.state.stades) {
      return <div className='stades'>Loading...</div>
    }
    var current = this.state.stades[this.state.selected] || {}
    var url = window.location.href.replace(/^.*\/\/[^\/]+/, '').split('/')
    var rootPath = url.slice(0, url.indexOf('admin')).join('/')
    return <div className="posts">
      <ul className='posts_list'>
        <NewStade onNew={this._onNew}/>
        {
          this.state.stades.map((stade, i) =>
            <li key={stade._id} className={cx({
                "posts_post": true,
                "posts_post--draft": stade.isDraft,
                "posts_post--selected": i === this.state.selected
              })}
              onDoubleClick={this.goTo.bind(null, stade._id)}
              onClick={this.setState.bind(this, {selected: i}, null)}
            >
              <span className="posts_post-title">
                {stade.stadeName}
              </span>
              <span className="posts_post-date">
                {moment(stade.date).format('MMM Do YYYY')}
              </span>
              <a className='posts_perma-link' target="_blank" href={rootPath + '/' + stade.path}>
                <i className='fa fa-link'/>
              </a>
              <Link className='posts_edit-link' to="stade" matchId={stade._id}>
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
          type="stade"/>
      </div>
    </div>
  }
});

module.exports = Stades;