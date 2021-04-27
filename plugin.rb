# frozen_string_literal: true

# name: discourse-docs
# about: A plugin to make it easy to explore and find knowledge base documents in Discourse
# version: 0.1
# author: Justin DiRose
# url: https://github.com/discourse/discourse-docs

enabled_site_setting :docs_enabled

register_asset 'stylesheets/common/docs.scss'
register_asset 'stylesheets/mobile/docs.scss'

load File.expand_path('lib/docs/engine.rb', __dir__)
load File.expand_path('lib/docs/query.rb', __dir__)

after_initialize do
  require_dependency 'search'

  if SiteSetting.docs_enabled
    if Search.respond_to? :advanced_filter
      Search.advanced_filter(/in:kb/) do |posts|
        selected_categories = SiteSetting.docs_categories.split('|')
        if selected_categories
          categories = Category.where('id IN (?)', selected_categories).pluck(:id)
        end

        selected_tags = SiteSetting.docs_tags.split('|')
        if selected_tags
          tags = Tag.where('name IN (?)', selected_tags).pluck(:id)
        end

        posts.where('category_id IN (?) OR topics.id IN (SELECT DISTINCT(tt.topic_id) FROM topic_tags tt WHERE tt.tag_id IN (?))', categories, tags)
      end
    end
  end

  add_to_class(:topic_query, :list_docs_topics) do
    default_results(@options)
  end
end
