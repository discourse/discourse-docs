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

      if filters[:topic].present?
        begin
          @topic = Topic.find(filters[:topic])
        rescue
          raise Discourse::NotFound
        end

        query["topic"] = get_topic(@topic, current_user)
      end

      respond_to do |format|
        format.html do
          render :get_topic
        end

        format.json do
          render json: query
        end
      end
    end

    def get_topic(topic, current_user)
      return nil unless topic_in_explorer(topic.category_id, topic.tags)

      topic_view = TopicView.new(topic.id, current_user)
      guardian = Guardian.new(current_user)

      TopicViewSerializer.new(topic_view, scope: guardian, root: false)
    end

    def topic_in_explorer(category, tags)
      category_match = KnowledgeExplorer::Query.categories.include?(category.to_s)
      tag_match = KnowledgeExplorer::Query.tags.any? { |tag| tags.include?(tag) }

      category_match || tag_match
    end

  end
end
