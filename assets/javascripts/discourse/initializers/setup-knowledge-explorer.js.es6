import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "setup-knowledge-explorer",

  initialize() {
    withPluginApi("0.8", api => {
      api.decorateWidget("hamburger-menu:generalLinks", () => {
        const siteSettings = api.container.lookup("site-settings:main");
        if (siteSettings.knowledge_explorer_enabled) {
          return {
            route: "knowledgeExplorer",
            label: "knowledge_explorer.title",
            className: "knowledge-explorer-link"
          };
        }
      });
    });
  }
};
