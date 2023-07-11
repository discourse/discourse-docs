# frozen_string_literal: true

module ::Docs
  class Engine < ::Rails::Engine
    isolate_namespace Docs

    config.after_initialize do
      Discourse::Application.routes.append do
        mount ::Docs::Engine, at: "/#{GlobalSetting.docs_path}"
        get "/knowledge-explorer", to: redirect("/#{GlobalSetting.docs_path}")
      end
    end
  end

  def self.onebox_template
    @onebox_template ||=
      begin
        path =
          "#{Rails.root}/plugins/discourse-docs/lib/onebox/templates/discourse_docs_list.mustache"
        File.read(path)
      end
  end

  def self.topic_in_docs(category, tags)
    category_match = Docs::Query.categories.include?(category.to_s)
    tags = tags.pluck(:name)
    tag_match = Docs::Query.tags.any? { |tag| tags.include?(tag) }

    category_match || tag_match
  end
end
