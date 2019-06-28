class KnowledgeExplorerConstraint
  def matches?(request)
    SiteSetting.knowledge_explorer_enabled
  end
end
