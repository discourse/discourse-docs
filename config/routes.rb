# frozen_string_literal: true

require_dependency 'docs_constraint'
require_dependency 'docs_url_constraint'

Docs::Engine.routes.draw do
  get '/' => 'docs#index', constraints: DocsConstraint.new
  get '.json' => 'docs#index', constraints: DocsConstraint.new
end

# This part doesn't work
Discourse::Application.routes.draw do
  scope path: nil, constraints: { format: /(json|html|\*\/\*)/ } do
    get "*path", to: 'docs#index', constraints: DocsUrlConstraint.new
  end
end
