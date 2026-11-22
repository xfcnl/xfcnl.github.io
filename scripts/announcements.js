'use strict';

const { encodeURL, full_url_for, stripHTML } = require('hexo-util');

function asDate(value, field, id) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.valueOf())) {
    throw new Error(`公告 ${id || '(未命名)'} 的 ${field} 不是有效日期`);
  }
  return date;
}

function prepareAnnouncements() {
  const data = this.locals.get('data').announcements || [];
  const ids = new Set();
  const announcements = data.map((item, index) => {
    const id = String(item.id || `notice-${index + 1}`);
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      throw new Error(`公告 ID「${id}」只能包含字母、数字、下划线和连字符`);
    }
    if (ids.has(id)) throw new Error(`公告 ID「${id}」重复`);
    ids.add(id);
    if (!item.title || !item.content) {
      throw new Error(`公告「${id}」必须填写 title 和 content`);
    }

    const date = asDate(item.date, 'date', id);
    return {
      id,
      title: String(item.title),
      date,
      updated: asDate(item.updated || item.date, 'updated', id),
      path: `announcements/#${id}`,
      permalink: full_url_for.call(this, `announcements/#${id}`),
      content: this.render.renderSync({ text: String(item.content), engine: 'markdown' })
    };
  }).sort((a, b) => b.date - a.date);

  this.locals.set('announcements', announcements);
}

function xml(value) {
  return String(value == null ? '' : value).replace(/[&<>"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  })[character]);
}

function isoDate(value) {
  return value && typeof value.toDate === 'function' ? value.toDate() : new Date(value);
}

function itemContent(item) {
  return String(item.content || '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

function itemSummary(item) {
  return stripHTML(item.excerpt || item.content || '').trim().slice(0, 140);
}

function atomEntry(item, isAnnouncement) {
  const categories = isAnnouncement
    ? [{ name: '公告', permalink: full_url_for.call(this, 'announcements/') }]
    : [
        ...(item.categories ? item.categories.toArray() : []),
        ...(item.tags ? item.tags.toArray() : [])
      ];
  const title = isAnnouncement ? `【公告】${item.title}` : item.title;

  return `  <entry>\n`
    + `    <title>${xml(title)}</title>\n`
    + `    <id>${xml(encodeURL(item.permalink))}</id>\n`
    + `    <link href="${xml(encodeURL(item.permalink))}"/>\n`
    + `    <published>${isoDate(item.date).toISOString()}</published>\n`
    + `    <updated>${isoDate(item.updated || item.date).toISOString()}</updated>\n`
    + `    <summary>${xml(itemSummary(item))}</summary>\n`
    + `    <content type="html">${xml(itemContent(item))}</content>\n`
    + categories.map(category => `    <category term="${xml(category.name)}" scheme="${xml(encodeURL(category.permalink))}"/>\n`).join('')
    + `  </entry>`;
}

function generateAtom(locals) {
  const config = this.config;
  const feedConfig = config.feed || {};
  const path = feedConfig.path || 'feed.xml';
  const limit = Number.isInteger(feedConfig.limit) ? feedConfig.limit : 20;
  const context = { config };
  const posts = locals.posts.filter(post => post.draft !== true).toArray();
  const announcements = (locals.announcements || []).map(item => ({ ...item, isAnnouncement: true }));
  let items = [...posts, ...announcements].sort((a, b) => isoDate(b.date) - isoDate(a.date));
  if (limit > 0) items = items.slice(0, limit);

  const siteUrl = full_url_for.call(context, '/');
  const feedUrl = full_url_for.call(context, path);
  const latest = items[0];
  const updated = latest ? isoDate(latest.updated || latest.date) : new Date(0);
  const entries = items.map(item => atomEntry.call(context, item, item.isAnnouncement)).join('\n');

  const data = `<?xml version="1.0" encoding="utf-8"?>\n`
    + `<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${xml(config.language || 'zh-CN')}">\n`
    + `  <title>${xml(config.title)}</title>\n`
    + `  <id>${xml(encodeURL(siteUrl))}</id>\n`
    + `  <subtitle>${xml(config.subtitle || config.description)}</subtitle>\n`
    + `  <updated>${updated.toISOString()}</updated>\n`
    + `  <link href="${xml(encodeURL(siteUrl))}" rel="alternate"/>\n`
    + `  <link href="${xml(encodeURL(feedUrl))}" rel="self" type="application/atom+xml"/>\n`
    + `  <author><name>${xml(config.author)}</name></author>\n`
    + `  <generator uri="https://hexo.io/">Hexo</generator>\n`
    + `${entries}\n</feed>\n`;

  return { path, data };
}

hexo.extend.filter.register('before_generate', prepareAnnouncements);
// 空分类也要保留入口；有文章后由 hexo-generator-category 生成真正的分类页。
hexo.extend.generator.register('empty-categories', () => ['tech', 'life', 'note']
  .filter(name => !hexo.locals.get('categories').findOne({ name }))
  .map(name => ({
    path: `${name}/index.html`,
    layout: 'category',
    data: { title: '分类', category: name, posts: [] }
  })));
// 替换 hexo-generator-feed 的 atom 生成器，保留它的 RSS 自动发现标签。
hexo.extend.generator.register('atom', generateAtom);
