# frozen_string_literal: true
# Jekyll plugin to generate a search-index.json file for FlexSearch
# Place this file in your _plugins directory

require 'json'

module Jekyll
  class SearchIndexGenerator < Generator
    safe true
    priority :lowest

    def generate(site)
      index = []
      # Collect posts, pages, and projects
      docs = site.posts.docs + site.pages
      if site.collections['projects']
        puts "[SearchIndexGenerator] Found \\#{site.collections['projects'].docs.size} project docs"
        docs += site.collections['projects'].docs
      else
        puts "[SearchIndexGenerator] No 'projects' collection found"
      end
      puts "[SearchIndexGenerator] Total docs to index: \\#{docs.size}"
      docs.each do |doc|
        next if doc.data['exclude_from_search']
        next if doc.data['draft']
        # Only index published, non-draft, non-excluded docs
        index << {
          'title' => doc.data['title'] || doc.basename_without_ext,
          'url' => doc.url,
          'snippet' => extract_snippet(doc),
          'type' => doc.is_a?(Jekyll::Document) ? 'post' : 'page',
          'categories' => doc.data['categories'] || [],
          'date' => doc.data['date']&.to_s
        }
      end
      # Write to search-index.json in the site root
      File.open(File.join(site.dest, 'search-index.json'), 'w') do |f|
        f.write(JSON.pretty_generate(index))
      end
    end

    private

    def extract_snippet(doc)
      # Prefer description/summary, fallback to excerpt/content
      doc.data['description'] || doc.data['summary'] || doc.data['excerpt'] || truncate(strip_html(doc.content), 180)
    end

    def strip_html(content)
      content.gsub(/<[^>]*>/, '')
    end

    def truncate(text, max)
      text.length > max ? text[0...max] + '...' : text
    end
  end
end
