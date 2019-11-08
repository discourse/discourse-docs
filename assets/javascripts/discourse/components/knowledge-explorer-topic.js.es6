export default Ember.Component.extend({
  classNames: "knowledge-explorer-topic",

  originalPostContent: Ember.computed.readOnly(
    "topic.post_stream.posts.firstObject"
  )
});
