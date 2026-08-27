# frozen_string_literal: true

# Agent-facing documentation.
#
# Content wrapped in {% agent %} ... {% endagent %} is written into the page as
# a script element with a media type no browser executes or renders. A reader
# sees nothing; anything fetching the HTML gets the full text in source order,
# next to the prose it describes.
#
# The same content is collected into /llms.txt and /llms-full.txt, following
# the convention at llmstxt.org, so an agent can take either route.
#
# Runs because the site is built by our own workflow rather than by the legacy
# GitHub Pages Jekyll build, which ignores _plugins.
module TitaniumDocs
  MIME_TYPE = "application/llm+markdown"

  class AgentBlock < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      @label = markup.strip
    end

    def render(context)
      body = super.to_s.strip
      return "" if body.empty?

      page = context.registers[:page]
      site = context.registers[:site]

      site.data["agent_notes"] ||= []
      site.data["agent_notes"] << {
        "url" => page["url"],
        "title" => page["title"],
        "label" => @label.empty? ? nil : @label,
        "body" => body
      }

      label = @label.empty? ? "" : %( data-agent-label="#{escape_attribute(@label)}")
      # A literal </ inside a script element would close it early.
      safe = body.gsub("</", '<\/')

      %(<script type="#{MIME_TYPE}" data-agent-doc#{label}>\n#{safe}\n</script>)
    end

    private

    def escape_attribute(value)
      value.gsub("&", "&amp;").gsub('"', "&quot;").gsub("<", "&lt;")
    end
  end
end

Liquid::Template.register_tag("agent", TitaniumDocs::AgentBlock)

# Incremental rebuilds during `jekyll serve` would otherwise append to the
# previous run and duplicate every note.
Jekyll::Hooks.register :site, :pre_render do |site|
  site.data["agent_notes"] = []
end

Jekyll::Hooks.register :site, :post_write do |site|
  notes = site.data["agent_notes"] || []
  base = site.config["url"].to_s + site.config["baseurl"].to_s

  pages = site.pages
              .select { |page| page.output_ext == ".html" && page.data["title"] }
              .sort_by { |page| page.data["nav_order"] || 99 }

  index = +"# #{site.config['title']}\n\n"
  index << "> #{site.config['description']}\n\n"
  index << "Every documentation page also carries its agent notes inline, in " \
           "script elements of type #{TitaniumDocs::MIME_TYPE}.\n\n"
  index << "## Documentation\n\n"
  pages.each do |page|
    summary = page.data["summary"] || page.data["description"]
    index << "- [#{page.data['title']}](#{base}#{page.url})"
    index << ": #{summary}" if summary
    index << "\n"
  end
  index << "\n## Machine-readable\n\n"
  index << "- [Design tokens](#{base}/assets/tokens/tokens.json): every token, both themes, as JSON\n"
  index << "- [Full agent notes](#{base}/llms-full.txt): the notes below, concatenated\n"

  full = +"# #{site.config['title']} - agent notes\n\n"
  notes.each do |note|
    heading = [note["title"], note["label"]].compact.join(" - ")
    full << "## #{heading}\n"
    full << "Source: #{base}#{note['url']}\n\n"
    full << note["body"]
    full << "\n\n"
  end

  File.write(File.join(site.dest, "llms.txt"), index)
  File.write(File.join(site.dest, "llms-full.txt"), full)
  Jekyll.logger.info "Agent docs:", "#{notes.length} note(s) across #{pages.length} page(s)"
end
