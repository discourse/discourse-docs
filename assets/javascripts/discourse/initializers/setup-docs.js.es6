import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "I18n";

function initialize(api, container) {
  const siteSettings = container.lookup("site-settings:main");

  if (!siteSettings.docs_enabled) {
    return;
  }

  api.decorateWidget("hamburger-menu:generalLinks", () => {
    return {
      route: "docs",
      label: "docs.title",
      className: "docs-link",
    };
  });

  api.addKeyboardShortcut("g e", "", { path: "/explorer" });

  if (siteSettings.docs_add_to_top_menu) {
    api.addNavigationBarItem({
      name: "docs",
      displayName: I18n.t("docs.title"),
      href: "/explorer",
    });
  }
}

export default {
  name: "setup-docs",

  initialize(container) {
    withPluginApi("0.8", (api) => initialize(api, container));
    withPluginApi("0.12.6", (api) => {
      const siteSettings = container.lookup("site-settings:main");
      if (!siteSettings.docs_enabled) {
        return;
      }

      api.addSearchSuggestion("in:docs");

      const tip = {
        label: "in:docs",
        description: I18n.t("docs.search.tip_description"),
        clickable: true,
        searchTopics: true,
      };
      api.addQuickSearchRandomTip(tip);
    });
  },
};
