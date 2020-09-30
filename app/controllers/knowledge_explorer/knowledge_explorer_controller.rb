# frozen_string_literal: true

module KnowledgeExplorer
  class KnowledgeExplorerController < ApplicationController
    requires_plugin 'knowledge-explorer'

    skip_before_action :check_xhr, only: [:index]

    def index
      filters = {
        topic: params[:topic],
        tags: params[:tags],
        category: params[:category],
        solved: params[:solved],
        search_term: params[:search],
        ascending: params[:ascending],
        order: params[:order],
        page: params[:page]
      }

      query = KnowledgeExplorer::Query.new(current_user, filters).list
      query["topic"] = get_topic(filters[:topic], current_user) if filters[:topic].present?

      respond_to do |format|
        format.html do
          render :get_topic if filters[:topic].present?
        end

        format.json do
          render json: query
        end
      end
    end

    def get_topic(topic_id, current_user)
      @topic_view = TopicView.new(topic_id, current_user)
      guardian = Guardian.new(current_user)

      return unless topic_in_explorer(@topic_view.topic.category_id, @topic_view.topic.tags)

      TopicViewSerializer.new(@topic_view, scope: guardian, root: false)
    end

    def topic_in_explorer(category, tags)
      category_match = KnowledgeExplorer::Query.categories.include?(category.to_s)
      tag_match = KnowledgeExplorer::Query.tags.any? { |tag| tags.include?(tag) }

      category_match || tag_match
    end

  end
end
