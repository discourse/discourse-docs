require_dependency "knowledge_explorer_constraint"

KnowledgeExplorer::Engine.routes.draw do
  get "/" => "knowledge_explorer#index", constraints: KnowledgeExplorerConstraint.new
end
