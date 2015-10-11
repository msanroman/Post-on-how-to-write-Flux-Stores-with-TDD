var expect = require('chai').expect;
var mockery = require('mockery');
var Posts = require('./mockedPosts.js');
var PostListStore;
var Dispatcher = require('../src/dispatcher.js');
var ActionTypes = require('../src/actionTypes.js');
var sinon = require('sinon');

describe('Post List Store', function() {
  beforeEach(function() {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
    });
    mockery.registerMock('./posts.js', Posts);
    PostListStore = require('../src/postListStore.js');
  });

  it ('exists', function() {
    expect(PostListStore).to.exist;
  });

  describe ('get the published posts', function() {
    it ('returns only posts with a published date', function() {
      var posts = PostListStore.getPublishedPosts();
      posts.forEach(function(post) {
        expect(post.published_at).to.not.be.null;
      });
    });

    it ('returned posts are sorted by date', function() {
      var posts = PostListStore.getPublishedPosts();
      var previous_date = new Date();
      posts.forEach(function(post) {
        var published_at = new Date(post.published_at);
        expect(published_at.getTime()).to.be.below(previous_date.getTime());
        previous_date = published_at;
      });
    });
  });

  describe ('drafts (posts without published_at)', function() {
    it ('returns all drafts', function() {
      var drafts = PostListStore.getDrafts();
      drafts.forEach(function(draft) {
        expect(draft.published_at).to.be.null;
      });
    });

    describe ('adding new drafts', function() {
      it ('catches a dispatched event and creates the draft', function() {
        Dispatcher.dispatch({
          actionType: ActionTypes.NEW_DRAFT,
          draft: {
            title: 'Productivity tips with Git',
            author: 'msanroman',
            excerpt: ''
          }
        });

        var drafts = PostListStore.getDrafts();
        var new_draft_is_in_array = false;
        drafts.forEach(function(draft) {
          new_draft_is_in_array = draft.title == 'Productivity tips with Git';
        });
        expect(new_draft_is_in_array).to.be.true;
      });

      it ('emits a change event when a draft has been created', function() {
        var callback = sinon.spy();
        PostListStore.addChangeListener(callback);
        Dispatcher.dispatch({
          actionType: ActionTypes.NEW_DRAFT,
          draft: {}
        });
        expect(callback.calledOnce).to.be.true;
      });
    });
  });

  describe ('subscribe/unsubscribe', function() {
    it ('a callback can be subscribed to the Store changes', function() {
      var callback = sinon.spy();
      PostListStore.addChangeListener(callback);
      PostListStore.emitChange();

      expect(callback.calledOnce).to.be.true;
    });

    it ('a callback can be unsubscribed to the Store changes', function() {
      var callback = sinon.spy();
      PostListStore.addChangeListener(callback);
      PostListStore.emitChange();
      PostListStore.removeChangeListener(callback);
      PostListStore.emitChange();

      expect(callback.calledOnce).to.be.true;
    });
  });

  afterEach(function() {
    mockery.disable();
  });
});
