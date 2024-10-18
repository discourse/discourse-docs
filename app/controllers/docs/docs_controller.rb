# frozen_string_literal: true

module Docs
  class DocsController < ApplicationController
    requires_plugin PLUGIN_NAME

    skip_before_action :check_xhr, only: [:index]

    def index
      if params[:tags].is_a?(Array) || params[:tags].is_a?(ActionController::Parameters)
        raise Discourse::InvalidParameters.new("Only strings are accepted for tag lists")
      end

      filters = {
        topic: params[:topic],
        tags: params[:tags],
        category: params[:category],
        solved: params[:solved],
        search_term: params[:search],
        ascending: params[:ascending],
        order: params[:order],
        page: params[:page],
      }

      query = Docs::Query.new(guardian, filters).list

      if filters[:topic].present?
        begin
          @topic = Topic.find(filters[:topic])
        rescue StandardError
          raise Discourse::NotFound
        end

        @excerpt =
          @topic.posts[0].excerpt(500, { strip_links: true, text_entities: true }) if @topic.posts[
          0
        ].present?
        @excerpt = (@excerpt || "").gsub(/\n/, " ").strip

        query["topic"] = get_topic(@topic, current_user)
      end

      respond_to do |format|
        format.html do
          @title = set_title
          render :get_topic
        end

        format.json { render json: query }
      end
    end

    def get_topic(topic, current_user)
      return nil unless Docs.topic_in_docs(topic.category_id, topic.tags)

      topic_view = TopicView.new(topic.id, current_user)
      guardian = Guardian.new(current_user)

      ip = request.remote_ip
      user_id = (current_user.id if current_user)

      TopicsController.defer_track_visit(topic.id, user_id) if should_track_visit_to_topic?
      TopicsController.defer_topic_view(topic.id, ip, user_id)

      TopicViewSerializer.new(topic_view, scope: guardian, root: false)
    end

    def should_track_visit_to_topic?
      !!((!request.format.json? || params[:track_visit]) && current_user)
    end

    def set_title
      title = "#{I18n.t("js.docs.title")} - #{SiteSetting.title}"
      if @topic
        topic_title = @topic["unicode_title"] || @topic["title"]
        title = "#{topic_title} - #{title}"
      end
      title
    end
  end
end
