Jekyll::Hooks.register :site, :post_write do |site|
  require 'json'

  search_index = []

  site.posts.each do |post|
    search_index << {
      'title' => post.data['title'],
      'url' => post.url,
      'content' => post.content,
      'date' => post.date.to_s
    }
  end

  if site.collections['note']
    site.collections['note'].docs.each do |note|
      search_index << {
        'title' => note.data['title'],
        'url' => note.url,
        'content' => note.content,
        'date' => note.date.to_s
      }
    end
  end

  File.open(File.join(site.dest, 'search.json'), 'w') do |f|
    f.write(search_index.to_json)
  end
end