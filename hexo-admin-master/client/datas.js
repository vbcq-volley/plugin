var React = require('react/addons')
var cx = React.addons.classSet
var Link = require('react-router').Link;
var Router = require('react-router');
var _ = require('lodash')
var moment = require('moment')
var SinceWhen = require('./since-when')
var api = require('./api');
var Rendered = require('./rendered')
var DataFetcher = require('./data-fetcher')
var Newpage = require('./new-data')

 
var Datas = React.createClass({
  mixins: [DataFetcher((params) => {
    return {"pages":api.getEntries("match")}
  })],

  getInitialState: function () {
    return {
      selected: 0,
      pages: [],
      previousPage: null,
      params:["match"]
    };
  },
  
 
  componentDidMount: function () {
   
  },

  _onNew: function (page) {
    var pages = this.state.pages.slice();
    pages.unshift(page);
    this.setState({ pages: pages });
    Router.transitionTo('data', { matchId: page._id });
  },

  goTo: function (id, e) {
    if (e) {
      e.preventDefault();
    }
    Router.transitionTo('data', { matchId: id });
  },

  render: function () {
    if (!this.state.pages.length) {
      return <div>Chargement...</div>;
    }

    var current = this.state.pages[this.state.selected] || {};
    var url = window.location.href.replace(/^.*\/\/[^\/]+/, '').split('/');
    var rootPath = url.slice(0, url.indexOf('admin')).join('/');

    return (
      <div className="posts">
        <ul className='posts_list'>
          <Newpage onNew={this._onNew} />
          {this.state.pages.map((page, i) => (
            <li key={page._id} className={cx({
              "posts_post": true,
              "posts_post--draft": page.isDraft,
              "posts_post--selected": i === this.state.selected
            })}
            onDoubleClick={this.goTo.bind(null, page._id)}
            onClick={this.setState.bind(this, { selected: i })}
            >
              <span className="posts_post-title">
                {page.title}
              </span>
              <span className="posts_post-date">
                {moment(page.date).format('MMM Do YYYY')}
              </span>
              <a className='posts_perma-link' target="_blank" href={rootPath + '/' + page.path}>
                <i className='fa fa-link' />
              </a>
              <Link className='posts_edit-link' to="data" params={{ matchId: page._id }}>
                <i className='fa fa-pencil-square-o' />
              </Link>
              <Link className='result add' to="resultat" params={{ matchId: page._id }}>
                <i className='fa fa-pencil-square-o' />
              </Link>
            </li>
          ))}
        </ul>
        <div className={cx({
          'posts_display': true,
          'posts_display--draft': current.isDraft
        })}>
          <Rendered
            ref="rendered"
            className="posts_content"
            text={JSON.stringify(current)}
            type="match" />
        </div>
      </div>
    );
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.pages !== this.state.pages) {
      console.log("Pages updated, previous and current pages are different");
    }
  }
});

module.exports = Datas;
