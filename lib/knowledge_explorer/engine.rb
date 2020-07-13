# frozen_string_literal: true

module ::KnowledgeExplorer
  class Engine < ::Rails::Engine
    isolate_namespace KnowledgeExplorer

    config.after_initialize do
      Discourse::Application.routes.append do
        mount ::KnowledgeExplorer::Engine, at: '/e'
        get '/knowledge-explorer', to: redirect("/e")
      end
    end
  end
end
