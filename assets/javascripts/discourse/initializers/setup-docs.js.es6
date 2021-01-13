import { withPluginApi } from "discourse/lib/plugin-api";

function initialize(api) {
  api.decorateWidget("hamburger-menu:generalLinks", () => {
    return {
      route: "docs",
      label: "docs.title",
      className: "docs-link",
    };
  });

  api.addKeyboardShortcut("g e", "", { path: "/docs" });
}

export default {
  name: "setup-docs",

  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");
    if (!siteSettings.docs_enabled) {
      return;
    }
    withPluginApi("0.8", (api) => initialize(api));
  },
};
