var fs = require('fs');
var path = require('path');

hexo.extend.generator.register('sw-copier', function () {
  var src = path.join(hexo.theme_dir, 'source', 'js', 'sw.js');
  var content = fs.readFileSync(src, 'utf8');
  return {
    path: 'sw.js',
    data: content,
    layout: false
  };
});