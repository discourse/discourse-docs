# name: discourse-knowledge-explorer
# about: A plugin to make it easy to explore and find knowledge base-type articles in Discourse
# version: 0.1
# author: Justin DiRose

enabled_site_setting :knowledge_explorer_enabled

register_asset 'stylesheets/common/knowledge-explorer.scss'

load File.expand_path('../lib/knowledge_explorer/engine.rb', __FILE__)

after_initialize do
  require_dependency 'search'

  if SiteSetting.knowledge_explorer_enabled
    if Search.respond_to? :advanced_filter
      Search.advanced_filter(/in:kb/) do |posts|
        selected_categories = SiteSetting.knowledge_explorer_categories.split("|")
        categories = Category.where('slug IN (?)', selected_categories).pluck(:id)

        selected_tags = SiteSetting.knowledge_explorer_tags.split("|")
        tags = Tag.where('name IN (?)', selected_tags).pluck(:id)

        posts.where('category_id IN (?) OR topics.id IN (SELECT DISTINCT(tt.topic_id) FROM topic_tags tt WHERE tt.tag_id IN (?))', categories, tags)
      end
    end
  end
end
