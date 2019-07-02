import {
  default as computed,
  observes,
  on
} from "ember-addons/ember-computed-decorators";

export default Ember.Controller.extend({
  application: Ember.inject.controller()
});
