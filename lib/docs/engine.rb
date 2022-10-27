# frozen_string_literal: true

module ::Docs
  class Engine < ::Rails::Engine
    isolate_namespace Docs

    config.after_initialize do
      Discourse::Application.routes.append do
        mount ::Docs::Engine, at: "/#{GlobalSetting.docs_url}"
        get '/knowledge-explorer', to: redirect("/#{GlobalSetting.docs_url}")
      end
    end
  end
end
