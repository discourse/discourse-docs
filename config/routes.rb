# frozen_string_literal: true

require_dependency 'docs_constraint'
require_dependency 'docs_url_constraint'

Discourse::Application.routes.draw do
  scope path: nil, constraints: { format: /(json|html|\*\/\*)/ } do
    get "*path", to: 'docs/docs#index', constraints: DocsUrlConstraint.new
  end
end
