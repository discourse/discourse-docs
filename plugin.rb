# frozen_string_literal: true

# name: discourse-docs
# about: Provides the ability to find and filter knowledge base topics.
# meta_topic_id: 130172
# version: 0.1
# author: Justin DiRose
# url: https://github.com/discourse/discourse-docs

enabled_site_setting :docs_enabled

register_asset "stylesheets/common/docs.scss"
register_asset "stylesheets/mobile/docs.scss"

register_svg_icon "arrow-down-a-z"
register_svg_icon "arrow-up-a-z"
register_svg_icon "arrow-up-1-9"
register_svg_icon "arrow-down-1-9"
register_svg_icon "far-circle"

require_relative "lib/docs/engine"
require_relative "lib/docs/query"

GlobalSetting.add_default :docs_path, "docs"

module ::Docs
  PLUGIN_NAME = "discourse-docs"
end

after_initialize do
  require_dependency "search"

  if SiteSetting.docs_enabled
    if Search.respond_to? :advanced_filter
      Search.advanced_filter(/in:(kb|docs)/) do |posts|
        selected_categories = SiteSetting.docs_categories.split("|")
        if selected_categories
          categories = Category.where("id IN (?)", selected_categories).pluck(:id)
        end

        selected_tags = SiteSetting.docs_tags.split("|")
        tags = Tag.where("name IN (?)", selected_tags).pluck(:id) if selected_tags

        posts.where(
          "category_id IN (?) OR topics.id IN (SELECT DISTINCT(tt.topic_id) FROM topic_tags tt WHERE tt.tag_id IN (?))",
          categories,
          tags,
        )
      end
    end
  end

  if Oneboxer.respond_to?(:register_local_handler)
    Oneboxer.register_local_handler("docs/docs") do |url, route|
      uri = URI(url)
      query = URI.decode_www_form(uri.query).to_h if uri.query

      if query && query["topic"]
        topic = Topic.includes(:tags).find_by(id: query["topic"])
        if Docs.topic_in_docs(topic.category_id, topic.tags) && Guardian.new.can_see_topic?(topic)
          first_post = topic.ordered_posts.first
          args = {
            topic_id: topic.id,
            post_number: first_post.post_number,
            avatar: PrettyText.avatar_img(first_post.user.avatar_template_url, "tiny"),
            original_url: url,
            title: PrettyText.unescape_emoji(CGI.escapeHTML(topic.title)),
            category_html: CategoryBadge.html_for(topic.category),
            quote:
              PrettyText.unescape_emoji(
                first_post.excerpt(SiteSetting.post_onebox_maxlength, keep_svg: true),
              ),
          }

          template = Oneboxer.template("discourse_topic_onebox")
          Mustache.render(template, args)
        end
      else
        args = { url: url, name: I18n.t("js.docs.title") }
        Mustache.render(Docs.onebox_template, args)
      end
    end
  end

  if InlineOneboxer.respond_to?(:register_local_handler)
    InlineOneboxer.register_local_handler("docs/docs") do |url, route|
      uri = URI(url)
      query = URI.decode_www_form(uri.query).to_h if uri.query

      if query && query["topic"]
        topic = Topic.includes(:tags).find_by(id: query["topic"])
        if Docs.topic_in_docs(topic.category_id, topic.tags) && Guardian.new.can_see_topic?(topic)
          { url: url, title: topic.title }
        end
      else
        { url: url, title: I18n.t("js.docs.title") }
      end
    end
  end

  add_to_class(:topic_query, :list_docs_topics) { default_results(@options) }

  on(:robots_info) do |robots_info|
    robots_info[:agents] ||= []

    any_user_agent = robots_info[:agents].find { |info| info[:name] == "*" }
    if !any_user_agent
      any_user_agent = { name: "*" }
      robots_info[:agents] << any_user_agent
    end

    any_user_agent[:disallow] ||= []
    any_user_agent[:disallow] << "/#{GlobalSetting.docs_path}/"
  end

  add_to_serializer(:site, :docs_path) { GlobalSetting.docs_path }
end
