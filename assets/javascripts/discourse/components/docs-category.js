import Component from "@ember/component";
import { tagName } from "@ember-decorators/component";
import discourseComputed from "discourse/lib/decorators";

@tagName("")
export default class DocsCategory extends Component {
  @discourseComputed("category")
  categoryName(category) {
    return this.site.categories.findBy("id", category.id).name;
  }
}
