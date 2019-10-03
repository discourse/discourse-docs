import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "setup-knowledge-explorer",
  initialize() {
    withPluginApi("0.8", api => {
      api.decorateWidget("hamburger-menu:generalLinks", () => {
        return {
          route: "knowledgeExplorer",
          label: "knowledge_explorer.title"
        };
      });
    });
  }
};
