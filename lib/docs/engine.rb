# frozen_string_literal: true

module ::Docs
  class Engine < ::Rails::Engine
    isolate_namespace Docs

    config.after_initialize do
      Discourse::Application.routes.append do
        mount ::Docs::Engine, at: '/docs'
        get '/knowledge-explorer', to: redirect("/docs")
        # get '/' + SiteSetting.docs_url_path + ".json?topic=:topic&track_visit=:track_visit", to: redirect { |params, request|
        #   "/docs?topic=#{params[:topic]}&track_visit=#{params[:track_visit]}"
        # }
      end
    end
  end
end
