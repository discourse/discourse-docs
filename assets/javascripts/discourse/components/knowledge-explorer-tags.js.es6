import computed from "ember-addons/ember-computed-decorators";
import { on, observes } from "ember-addons/ember-computed-decorators";
import { ajax } from "discourse/lib/ajax";

function sortAlpha(a, b) {
  let aName = a.id.toLowerCase();
  let bName = b.id.toLowerCase();
  return aName < bName ? -1 : aName > bName ? 1 : 0;
}

function sortCount(a, b) {
  let aCount = a.count;
  let bCount = b.count;

  return bCount - aCount || a.id.localeCompare(b.id);
}

let cachedResults = null;
let lastFetchDate = null;

export default Ember.Component.extend({
  classNames: "knowledge-explorer-tags"
});
