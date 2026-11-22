'use strict';

const { encodeURL } = require('hexo-util');

function normalizePath(path) {
  return path.replace(/\/+/g, '/').replace(/^\/+/, '/');
}

function parseManualRedirects(content) {
  const lines = content.split('\n');
  const redirects = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      redirects.push({
        from: normalizePath(parts[0]),
        to: normalizePath(parts[1]),
        code: parts[2] || '301'
      });
    }
  }
  return redirects;
}

function slugify(str) {
  return String(str)
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[、，。！？；：""''《》【】（）()[\]{}]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateLegacyRedirects(locals) {
  const config = this.config;
  const root = config.root || '/';
  const defaultCategory = config.default_category || 'tech';
  const categoryMap = config.category_map || {};

  // Collect all current canonical paths
  const canonicalPaths = new Set();
  const posts = locals.posts.filter(p => p.draft !== true).toArray();
  const pages = locals.pages.toArray();

  for (const post of posts) {
    canonicalPaths.add(normalizePath(post.path));
  }
  for (const page of pages) {
    if (page.path) canonicalPaths.add(normalizePath(page.path));
  }
  // Add category/tag/archive/index paths
  ['', 'archives/', 'tags/', 'categories/', 'search/', 'about/', 'link/', 'classify/', 'announcements/'].forEach(p => {
    canonicalPaths.add(normalizePath(root + p));
  });

  // Build redirect rules
  const redirectRules = [];

  // 1. Manual redirects from source/_redirects (if exists)
  const fs = require('fs');
  const manualPath = this.source_dir + '/_redirects';
  if (fs.existsSync(manualPath)) {
    const manual = parseManualRedirects(fs.readFileSync(manualPath, 'utf8'));
    for (const r of manual) {
      redirectRules.push(`${r.from} ${r.to} ${r.code}`);
    }
  }

  // 2. Category migration map (old -> new)
  const categoryMigration = { note: 'life' };

  // 3. Known historical permalink formats (from git history):
  // - 485ca3f (2026-07-11): permalink: :category/:title/
  // - d18779b (2026-11-07): permalink: :category/:year-:month-:day-:name/
  // - d75067f/2d79847 (2026-08-13/2026-11-14): double-date bug when :name included date prefix
  // Current: :category/:name/

  const seen = new Set();

  function addRule(from, to, code = '301') {
    const nFrom = normalizePath(from);
    const nTo = normalizePath(to);
    if (nFrom === nTo) return;
    if (canonicalPaths.has(nFrom)) return; // don't override existing content
    const key = `${nFrom} ${nTo}`;
    if (seen.has(key)) return;
    seen.add(key);
    redirectRules.push(`${nFrom} ${nTo} ${code}`);
  }

  for (const post of posts) {
    const cat = (post.categories && post.categories.length > 0)
      ? post.categories.first().name
      : defaultCategory;
    const mappedCat = categoryMap[cat] || cat;
    const canonical = normalizePath(post.path);
    const date = post.date;
    const yyyy = date.format('YYYY');
    const mm = date.format('MM');
    const dd = date.format('DD');
    const datePrefix = `${yyyy}-${mm}-${dd}`;
    const slug = post.slug; // filename without date prefix
    const title = post.title;
    const titleSlug = slugify(title);

    // Historical pattern 1: :category/:title/ (from 485ca3f)
    // This uses the post title, slugified
    addRule(`${mappedCat}/${titleSlug}/`, canonical);

    // Historical pattern 2: :category/:year-:month-:day-:name/ (from d18779b)
    // :name is the filename without extension. For our posts, filename = YYYY-MM-DD-slug
    // So :name = YYYY-MM-DD-slug, making the path: cat/YYYY-MM-DD-YYYY-MM-DD-slug/
    // But this is the double-date bug pattern. The single-date version would be
    // if filename didn't have date prefix (not our case). We'll include both:
    addRule(`${mappedCat}/${datePrefix}-${slug}/`, canonical); // single date + slug
    addRule(`${mappedCat}/${datePrefix}-${titleSlug}/`, canonical); // single date + title

    // Historical pattern 3: double-date bug (when :name already contained date)
    // This was the actual generated URL for many posts before 2d79847
    addRule(`${mappedCat}/${datePrefix}-${datePrefix}-${slug}/`, canonical);

    // Category migration: old category paths -> new category
    for (const [oldCat, newCat] of Object.entries(categoryMigration)) {
      if (newCat === mappedCat) {
        addRule(`${oldCat}/${slug}/`, canonical);
        addRule(`${oldCat}/${datePrefix}-${slug}/`, canonical);
        addRule(`${oldCat}/${datePrefix}-${titleSlug}/`, canonical);
        addRule(`${oldCat}/${datePrefix}-${datePrefix}-${slug}/`, canonical);
        // Also handle old :title/ format under old category
        addRule(`${oldCat}/${titleSlug}/`, canonical);
      }
    }
  }

  // Write _redirects
  const content = `# Auto-generated legacy redirects\n# DO NOT EDIT MANUALLY - edit source/_redirects for manual overrides\n\n${redirectRules.join('\n')}\n`;

  return {
    path: '_redirects',
    data: content,
    layout: false
  };
}

hexo.extend.generator.register('legacy-redirects', generateLegacyRedirects);