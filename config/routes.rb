# frozen_string_literal: true

require_dependency "docs_constraint"

Docs::Engine.routes.draw do
  get "/" => "docs#index", :constraints => DocsConstraint.new
  get ".json" => "docs#index", :constraints => DocsConstraint.new
end
