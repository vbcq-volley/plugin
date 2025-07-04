'use strict';
var nunjucks = require('nunjucks');
var env = new nunjucks.Environment();
var pathFn = require('path');
var fs = require('fs');

env.addFilter('uriencode', function(str) {
	return encodeURI(str);
});

env.addFilter('noControlChars', function(str) {
	return str && str.replace(/[\x00-\x1F\x7F]/g, '');
});

module.exports = function(locals){
  var config = this.config;
  var searchConfig = config.search;

  var searchTmplSrc = searchConfig.template || pathFn.join(__dirname, './templates/search.xml');
  var searchTmpl = nunjucks.compile(fs.readFileSync(searchTmplSrc, 'utf8'), env);

  var template = searchTmpl;
  var searchfield = searchConfig.field;
  var content = searchConfig.content;
  if (content == undefined) content=true;

  var posts, pages;

  if(searchfield.trim() != ''){
    searchfield = searchfield.trim();
    if(searchfield == 'post'){
      posts = locals.posts.sort('-date');
    }else if(searchfield == 'page'){
      pages = locals.pages;
    }else{
      posts = locals.posts.sort('-date');
      pages = locals.pages;
    }
  }else{
    posts = locals.posts.sort('-date');
  }

  var rootURL;
  if (config.root == null){
    rootURL = "/";
  }else{
    rootURL = config.root;
  }

  var xml = template.render({
    config: config,
    posts: posts,
    pages: pages,
    content: content,
    url: rootURL
  });

  return {
    path: searchConfig.path,
    data: xml
  };
};
