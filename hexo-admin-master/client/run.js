// index.js
var admin = require('./')
  , api = require('./api')

var url = window.location.href.replace(/^.*\/\/[^\/]+/, '').split('/');
var rootPath = url.slice(0, url.indexOf('admin')).join('/');
api.init('rest', rootPath + '/admin/api');

document.addEventListener('DOMContentLoaded', () => {
  var node = document.createElement('div');
  document.body.appendChild(node);
  admin(node);
});
