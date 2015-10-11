var Posts = require('./posts.js');
var Dispatcher = require('./dispatcher.js');
var ActionTypes = require('./actionTypes.js');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

var CHANGE_EVENT = 'change';
var PostListStore = assign({}, EventEmitter.prototype, {
  getDrafts: function() {
    return Posts.filter(function(post) {
      return post.published_at === null;
    });
  },
  getPublishedPosts: function() {
    var posts = Posts.filter(function(post) {
      return post.published_at;
    });
    posts.sort(function(a_post, another_post) {
      return new Date(another_post.published_at) - new Date(a_post.published_at);
    });
    return posts;
  },
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  }
});

Dispatcher.register(function(payload) {
  switch(payload.actionType) {
    case ActionTypes.NEW_DRAFT:
      var draft = payload.draft;
      draft.published_at = null;
      Posts.push(draft);
      PostListStore.emitChange();
      break;
  }
});

module.exports = PostListStore;
