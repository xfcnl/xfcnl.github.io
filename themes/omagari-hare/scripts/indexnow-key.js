hexo.extend.generator.register("indexnow-key", function () {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    hexo.log.warn("INDEXNOW_KEY not set, skip generating IndexNow key file");
    return;
  }
  return {
    path: key + ".txt",
    data: key,
    layout: false,
  };
});
