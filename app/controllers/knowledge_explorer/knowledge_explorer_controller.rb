# frozen_string_literal: true

module KnowledgeExplorer
  class KnowledgeExplorerController < ApplicationController
    requires_plugin 'knowledge-explorer'

    def index

      filters = {
        tags: params[:tags],
        category: params[:category],
        search_term: params[:search]
      }

      query = KnowledgeExplorer::KnowledgeExplorerQuery.new(filters).get

      render json: query
    end
  end
end
