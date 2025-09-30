import { Input } from "@ember/component";
import { fn } from "@ember/helper";
import { on } from "@ember/modifier";
import RouteTemplate from "ember-route-template";
import { and, eq } from "truth-helpers";
import BasicTopicList from "discourse/components/basic-topic-list";
import ConditionalLoadingSpinner from "discourse/components/conditional-loading-spinner";
import DButton from "discourse/components/d-button";
import EmptyState from "discourse/components/empty-state";
import LoadMore from "discourse/components/load-more";
import PluginOutlet from "discourse/components/plugin-outlet";
import lazyHash from "discourse/helpers/lazy-hash";
import { i18n } from "discourse-i18n";
import DocsCategory from "../../components/docs-category";
import DocsTag from "../../components/docs-tag";
import DocsTopic from "../../components/docs-topic";

export default RouteTemplate(
  <template>
    <ConditionalLoadingSpinner @condition={{@controller.isLoading}}>
      {{#if @controller.noContent}}
        <EmptyState
          @title={{@controller.emptyState.title}}
          @body={{@controller.emptyState.body}}
        />
      {{else}}
        <div class="docs-browse">
          {{#if @controller.site.mobileView}}
            {{#unless @controller.selectedTopic}}
              <DButton
                class="docs-expander"
                @icon={{if @controller.expandedFilters "angle-up" "angle-down"}}
                @action={{@controller.toggleFilters}}
                @label="docs.filter_button"
              />
            {{/unless}}
          {{/if}}

          <div class="docs-filters">
            {{#if @controller.expandedFilters}}
              {{#if @controller.canFilterSolved}}
                <div class="docs-items docs-solved">
                  <label class="checkbox-label docs-item">
                    <Input
                      @type="checkbox"
                      @checked={{readonly @controller.filterSolved}}
                      {{on "input" @controller.onChangeFilterSolved}}
                    />
                    <PluginOutlet @name="custom-checkbox" />
                    {{i18n "docs.filter_solved"}}
                  </label>
                </div>
              {{/if}}

              {{#if @controller.categories}}
                <div class="docs-items docs-categories">
                  <section class="item-controls">
                    <h3>
                      {{i18n "docs.categories"}}
                    </h3>
                    <div class="item-controls-buttons">
                      <DButton
                        class={{if
                          (eq @controller.categorySort.type "alpha")
                          "categories-alphabet active"
                          "categories-alphabet"
                        }}
                        @icon={{@controller.categorySortAlphaIcon}}
                        @action={{@controller.toggleCategorySort}}
                        @actionParam="alpha"
                      />
                      <DButton
                        class={{if
                          (eq @controller.categorySort.type "numeric")
                          "categories-amount active"
                          "categories-amount"
                        }}
                        @icon={{@controller.categorySortNumericIcon}}
                        @action={{@controller.toggleCategorySort}}
                        @actionParam="numeric"
                      />
                      <PluginOutlet
                        @name="categories-controls-buttons-bottom"
                      />
                    </div>
                  </section>
                  {{#if @controller.showCategoryFilter}}
                    <Input
                      @value={{@controller.categoryFilter}}
                      class="filter"
                      placeholder={{i18n "docs.categories_filter_placeholder"}}
                    />
                  {{/if}}
                  <ul>
                    {{#each @controller.sortedCategories as |category|}}
                      <li>
                        <DocsCategory
                          @category={{category}}
                          @selectCategory={{fn
                            @controller.updateSelectedCategories
                            category
                          }}
                        />
                      </li>
                    {{/each}}
                  </ul>
                </div>
              {{/if}}

              {{#if (and @controller.tags @controller.shouldShowTags)}}
                <div class="docs-items docs-tags">
                  <section class="item-controls">
                    <h3>
                      {{i18n "docs.tags"}}
                    </h3>
                    <div class="item-controls-buttons">
                      <DButton
                        class={{if
                          (eq @controller.tagSort.type "alpha")
                          "tags-alphabet active"
                          "tags-alphabet"
                        }}
                        @icon={{@controller.tagSortAlphaIcon}}
                        @action={{@controller.toggleTagSort}}
                        @actionParam="alpha"
                      />
                      <DButton
                        class={{if
                          (eq @controller.tagSort.type "numeric")
                          "tags-amount active"
                          "tags-amount"
                        }}
                        @icon={{@controller.tagSortNumericIcon}}
                        @action={{@controller.toggleTagSort}}
                        @actionParam="numeric"
                      />
                      <PluginOutlet @name="tags-controls-buttons-bottom" />
                    </div>
                  </section>
                  {{#if @controller.showTagFilter}}
                    <Input
                      @value={{@controller.tagFilter}}
                      class="filter"
                      placeholder={{i18n "docs.tags_filter_placeholder"}}
                    />
                  {{/if}}
                  <PluginOutlet
                    @name="before-docs-tag-list"
                    @connectorTagName="div"
                    @outletArgs={{lazyHash
                      tags=@controller.tags
                      updateSelectedTags=@controller.updateSelectedTags
                    }}
                  />
                  <ul>
                    {{#each @controller.sortedTags as |tag|}}
                      <li class="docs-filter-tag-{{tag.id}}">
                        <DocsTag
                          @tag={{tag}}
                          @selectTag={{fn @controller.updateSelectedTags tag}}
                        />
                      </li>
                    {{/each}}
                  </ul>
                </div>
              {{/if}}
              {{#if
                (and @controller.tagGroups @controller.shouldShowTagsByGroup)
              }}
                <div class="docs-items docs-tags">
                  <section class="item-controls">
                    <h3>
                      {{i18n "docs.tags"}}
                    </h3>
                    <div class="item-controls-buttons">
                      <DButton
                        class={{if
                          (eq @controller.tagSort.type "alpha")
                          "tags-alphabet active"
                          "tags-alphabet"
                        }}
                        @icon={{@controller.tagSortAlphaIcon}}
                        @action={{@controller.toggleTagSort}}
                        @actionParam="alpha"
                      />
                      <DButton
                        class={{if
                          (eq @controller.tagSort.type "numeric")
                          "tags-amount active"
                          "tags-amount"
                        }}
                        @icon={{@controller.tagSortNumericIcon}}
                        @action={{@controller.toggleTagSort}}
                        @actionParam="numeric"
                      />
                      <PluginOutlet @name="tags-controls-buttons-bottom" />
                    </div>
                  </section>
                  {{#if @controller.showTagFilter}}
                    <Input
                      @value={{@controller.tagFilter}}
                      class="filter"
                      placeholder={{i18n "docs.tags_filter_placeholder"}}
                    />
                  {{/if}}
                  <PluginOutlet
                    @name="before-docs-tag-list"
                    @connectorTagName="div"
                    @outletArgs={{lazyHash
                      tags=@controller.tags
                      updateSelectedTags=@controller.updateSelectedTags
                    }}
                  />
                  <ul>
                    {{#each @controller.sortedTagGroups as |tagGroup|}}
                      <li class="docs-filter-tag-group-{{tagGroup.id}}">
                        {{tagGroup.name}}
                        <ul>
                          {{#each tagGroup.tags as |tag|}}
                            <li class="docs-filter-tag-{{@controller.id}}">
                              <DocsTag
                                @tag={{tag}}
                                @selectTag={{fn
                                  @controller.updateSelectedTags
                                  tag
                                }}
                              />
                            </li>
                          {{/each}}
                        </ul>
                      </li>
                    {{/each}}
                  </ul>
                </div>
              {{/if}}
            {{/if}}
          </div>

          {{#if @controller.selectedTopic}}
            <ConditionalLoadingSpinner
              @condition={{@controller.isTopicLoading}}
            >
              <DocsTopic
                @topic={{@controller.topic}}
                @return={{@controller.returnToList}}
              />
              <PluginOutlet
                @name="below-docs-topic"
                @connectorTagName="div"
                @outletArgs={{lazyHash topic=@controller.topic}}
              />
            </ConditionalLoadingSpinner>
          {{else}}
            <div class="docs-results">
              {{#if @controller.isSearchingOrFiltered}}
                {{#if @controller.emptyResults}}
                  <div class="result-count no-result">
                    {{i18n "search.no_results"}}
                  </div>
                  <span>
                    <PluginOutlet
                      @name="after-docs-empty-results"
                      @connectorTagName="div"
                    />
                  </span>
                {{else}}
                  <div class="result-count">
                    {{i18n "docs.search.results" count=@controller.topicCount}}
                  </div>
                {{/if}}
              {{/if}}

              {{#unless @controller.emptyResults}}
                <LoadMore
                  @selector=".topic-list tr"
                  @action={{@controller.loadMore}}
                >
                  <BasicTopicList
                    @topics={{@controller.topics}}
                    @ascending={{@controller.ascending}}
                    @order={{@controller.orderColumn}}
                    @changeSort={{@controller.sortBy}}
                  />
                </LoadMore>
                <ConditionalLoadingSpinner
                  @condition={{@controller.isLoadingMore}}
                />
              {{/unless}}
            </div>
          {{/if}}
        </div>
      {{/if}}
    </ConditionalLoadingSpinner>
  </template>
);
