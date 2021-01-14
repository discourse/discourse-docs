# frozen_string_literal: true
#
class RenameKnowledgeExplorerSettings < ActiveRecord::Migration[6.0]
  def up
    execute "UPDATE site_settings SET name = 'docs_enabled' WHERE name = 'knowledge_explorer_enabled'"
    execute "UPDATE site_settings SET name = 'docs_categories' WHERE name = 'knowledge_explorer_categories'"
    execute "UPDATE site_settings SET name = 'docs_tags' WHERE name = 'knowledge_explorer_tags'"
    execute "UPDATE site_settings SET name = 'docs_add_solved_filter' WHERE name = 'knowledge_explorer_add_solved_filter'"
  end

  def down
    execute "UPDATE site_settings SET name = 'knowledge_explorer_enabled' WHERE name = 'docs_enabled'"
    execute "UPDATE site_settings SET name = 'knowledge_explorer_categories' WHERE name = 'docs_categories'"
    execute "UPDATE site_settings SET name = 'knowledge_explorer_tags' WHERE name = 'docs_tags'"
    execute "UPDATE site_settings SET name = 'knowledge_explorer_add_solved_filter' WHERE name = 'docs_add_solved_filter'"
  end
end
