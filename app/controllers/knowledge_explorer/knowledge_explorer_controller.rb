# frozen_string_literal: true

module KnowledgeExplorer
  class KnowledgeExplorerController < ApplicationController
    requires_plugin 'knowledge-explorer'

    def index
      filters = {
        tags: params[:tags],
        category: params[:category],
        solved: params[:solved],
        search_term: params[:search],
        ascending: params[:ascending],
        order: params[:order],
        page: params[:page]
      }

      query = KnowledgeExplorer::Query.new(current_user, filters).list

      render json: query
    end
  end
end
