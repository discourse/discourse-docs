import RouteTemplate from "ember-route-template";
import PluginOutlet from "discourse/components/plugin-outlet";
import lazyHash from "discourse/helpers/lazy-hash";
import DocsSearch from "../components/docs-search";

export default RouteTemplate(
  <template>
    <div class="docs">
      <span>
        <PluginOutlet
          @name="before-docs-search"
          @connectorTagName="div"
          @outletArgs={{lazyHash
            selectCategory=@controller.updateSelectedCategories
            selectTag=@controller.updateSelectedTags
            tags=@controller.indexController.tags
            categories=@controller.indexController.categories
          }}
        />
      </span>

      <DocsSearch
        @searchTerm={{readonly @controller.indexController.searchTerm}}
        @onSearch={{@controller.performSearch}}
      />

      {{outlet}}
    </div>
  </template>
);
