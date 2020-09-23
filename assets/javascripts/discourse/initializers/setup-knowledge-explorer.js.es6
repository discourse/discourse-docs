import { withPluginApi } from "discourse/lib/plugin-api";

function initialize(api) {
  api.decorateWidget("hamburger-menu:generalLinks", () => {
    return {
      route: "knowledgeExplorer",
      label: "knowledge_explorer.title",
      className: "knowledge-explorer-link",
    };
  });

  api.addKeyboardShortcut("g e", "", { path: "/docs" });
}

export default {
  name: "setup-knowledge-explorer",

  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");
    if (!siteSettings.knowledge_explorer_enabled) {
      return;
    }
    withPluginApi("0.8", (api) => initialize(api));
  },
};
