import PostCooked from "discourse/widgets/post-cooked";
import DecoratorHelper from "discourse/widgets/decorator-helper";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("knowledge-explorer-post", {
  html(attrs, state) {
    return new PostCooked(
      attrs.post,
      new DecoratorHelper(this),
      this.currentUser
    );
  }
});
