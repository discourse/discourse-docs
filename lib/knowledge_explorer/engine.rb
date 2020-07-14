# frozen_string_literal: true

module ::KnowledgeExplorer
  class Engine < ::Rails::Engine
    isolate_namespace KnowledgeExplorer

    config.after_initialize do
      Discourse::Application.routes.append do
        mount ::KnowledgeExplorer::Engine, at: '/docs'
        get '/knowledge-explorer', to: redirect("/docs")
      end
    end
  end
end
