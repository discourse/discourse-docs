# frozen_string_literal: true

class DocsConstraint
  def matches?(_request)
    SiteSetting.docs_enabled
  end
end
