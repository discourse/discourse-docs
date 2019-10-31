# frozen_string_literal: true

class KnowledgeExplorerConstraint
  def matches?(_request)
    SiteSetting.knowledge_explorer_enabled
  end
end
