"use strict";

const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(process.cwd(), "image");
const DEST_DIR = path.join(process.cwd(), "public", "image");

// 额外需要复制的文件（下划线开头的文件不被 Hexo 处理）
const EXTRA_FILES = [
  // _redirects 现在由 scripts/legacy-redirects.js 自动生成
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return 0;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyDir(s, d);
    } else if (entry.isFile()) {
      fs.copyFileSync(s, d);
      count++;
    }
  }
  return count;
}

if (require.main === module) {
  const count = copyDir(SRC_DIR, DEST_DIR);
  console.log(
    `[copy-image] ${count} 个文件已复制到 public/image/`
  );

  // 复制额外文件
  for (const f of EXTRA_FILES) {
    const src = path.join(process.cwd(), f.src);
    const dest = path.join(process.cwd(), f.dest);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`[copy-image] 已复制 ${f.src} -> ${f.dest}`);
    }
  }
}