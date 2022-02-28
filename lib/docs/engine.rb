# frozen_string_literal: true

module ::Docs
  class Engine < ::Rails::Engine
    isolate_namespace Docs

    config.after_initialize do
      Discourse::Application.routes.append do
        mount ::Docs::Engine, at: '/explorer'
        get '/knowledge-explorer', to: redirect("/explorer")
      end
    end
  end
end
