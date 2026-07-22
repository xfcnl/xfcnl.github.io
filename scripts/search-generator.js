hexo.extend.generator.register("search-json", function (locals) {
  var data = [];
  locals.posts.each(function (post) {
    data.push({
      title: post.title,
      content: post.content,
      url: hexo.config.root + post.path,
      date: post.date.format("YYYY-MM-DD"),
      type:
        post.categories && post.categories.length > 0
          ? post.categories.first().name
          : "tech",
    });
  });

  return {
    path: "search.json",
    data: JSON.stringify({ posts: data }),
    layout: false,
  };
});
