import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "I18n";
import { getDocs } from "../../lib/get-docs";

function initialize(api, container) {
  const siteSettings = container.lookup("service:site-settings");
  const docsPath = getDocs();

  api.addKeyboardShortcut("g e", "", {
    path: "/" + docsPath,
  });

  if (siteSettings.docs_add_to_top_menu) {
    api.addNavigationBarItem({
      name: "docs",
      displayName: I18n.t("docs.title"),
      href: "/" + docsPath,
    });
  }

  api.registerValueTransformer("topic-list-columns", ({ value: columns }) => {
    if (container.lookup("service:router").currentRouteName === "docs.index") {
      columns.delete("posters");
      columns.delete("replies");
      columns.delete("views");
    }
    return columns;
  });

  api.registerValueTransformer("topic-list-item-expand-pinned", ({ value }) => {
    if (container.lookup("service:router").currentRouteName === "docs.index") {
      return true;
    }
    return value;
  });
}

export default {
  name: "setup-docs",

  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");

    if (!siteSettings.docs_enabled) {
      return;
    }

    withPluginApi("0.8", (api) => initialize(api, container));

    if (siteSettings.docs_add_search_menu_tip) {
      withPluginApi("0.12.6", (api) => {
        api.addSearchSuggestion("in:docs");

        const tip = {
          label: "in:docs",
          description: I18n.t("docs.search.tip_description"),
          clickable: true,
          searchTopics: true,
        };
        api.addQuickSearchRandomTip(tip);
      });
    }

    withPluginApi("1.2.0", (api) => {
      api.addCommunitySectionLink({
        name: "docs",
        route: "docs.index",
        title: I18n.t("sidebar.docs_link_title"),
        text: I18n.t("sidebar.docs_link_text"),
      });
    });
  },
};
