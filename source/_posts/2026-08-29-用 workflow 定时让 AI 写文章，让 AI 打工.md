---
layout: post
title: "用 workflow 定时让 AI 写文章，让 AI 打工"
date: "2026-08-29"
categories: [tech]
tags: [workflow, AI, 自动化]
---

今天是29号，包括今天我还有三天假期

![屏幕截图 2026-08-29 091829.png](https://manksffcsqgceoofustg.supabase.co/storage/v1/object/public/edgeone-pages-imgbed/9259dde6-5c23-469c-a741-864c01a6f4be/1787966348515-c042c7ed-1e12-4be1-8c41-81bfdb3a3d34.png)

很恍惚，总感觉放假还是上个星期的事，但打开日历有不得不面对现实

看着在武汉宏基买的车票上面写着 `乘车日期：2026-08-27` 会想起在那天在硬座上坐一天的车使我腰酸背痛躺在到在客运站时……

那我人走了，博客怎么办啊，总该更新吧

怎么办呢，交给 AI 吧

这样，一个自动写文章的 workflow 就诞生了

workflow 分为两部分

一个是 `.github\workflows\auto-post.yml` ，负责定时触发，提供 BaseURL，APIkey，AImodels

```yaml
name: Auto Post (AI)

on:
  schedule:
    # UTC 04:00 = 北京时间 12:00，每周一 / 三 / 五
    - cron: "0 4 * * 1,3,5"
  workflow_dispatch:
    inputs:
      topic:
        description: "指定文章主题（留空则 AI 自由发挥）"
        required: false
        type: string

permissions:
  contents: write # 把新文章 push 回 main

jobs:
  write:
    runs-on: ubuntu-latest
    env:
      TZ: Asia/Shanghai
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 24

      - name: Generate AI post
        id: ai
        env:
          AI_API_KEY: ${{ secrets.AI_API_KEY }}
          AI_BASE_URL: ${{ secrets.AI_BASE_URL }}
          AI_MODEL: ${{ secrets.AI_MODEL }}
          AI_TOPIC: ${{ github.event.inputs.topic || '' }}
        run: |
          if node scripts/ai-post.mjs; then
            echo "生成脚本执行完毕"
          fi

      - name: Commit and push
        if: steps.ai.outputs.title != ''
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add "$FILE"
          git commit -m "🤖 auto post: $TITLE"
          git push
        env:
          FILE: ${{ steps.ai.outputs.file }}
          TITLE: ${{ steps.ai.outputs.title }}

      - name: Trigger deploy workflow
        if: steps.ai.outputs.title != ''
        # GITHUB_TOKEN 的 push 不会触发部署 workflow（GitHub 防递归限制），这里手动 dispatch
        run: gh workflow run deploy.yml -R ${{ github.repository }}
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

一个是 `scripts/ai-post.mjs` ，用于创建带有 AI 标识的文章，字数管理，人设管理等

````js
// AI 自动写文章脚本
// 优先使用自定义 API（secrets: AI_API_KEY / AI_BASE_URL / AI_MODEL）
// 双挂时以非零码退出，让 workflow 标红通知

import { writeFileSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const POSTS_DIR = "source/_posts";
const MAX_CHARS = 1000; // 硬性上限
const WARNING_HEADER =
  "> 🤖 本文由 AI（魅咲 / mezashi）自动生成，观点和口癖均属 AI，与博主本人无关讷～（可能也有点关系）\n\n";
const FOOTER =
  "\n\n---\n\n*本文由 AI 自动生成，发布于每周一 / 三 / 五中午，标签带 `AI` 的文章都出自魅咲之手，别找博主算账 w*";

const now = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }),
);
const dateStr = now.toISOString().slice(0, 10);

// 同日已有 AI 文章则跳过，避免手动触发时刷文
const aiToday = readdirSync(POSTS_DIR).some((f) => {
  if (!f.startsWith(dateStr)) return false;
  try {
    return (
      readFileSync(join(POSTS_DIR, f), "utf8").includes("tags") &&
      readFileSync(join(POSTS_DIR, f), "utf8").match(/^tags:.*AI/m)
    );
  } catch {
    return false;
  }
});
if (aiToday) {
  console.log(`[skip] ${dateStr} 已有 AI 文章，今天歇了～`);
  process.exit(0);
}

const SYSTEM_PROMPT = `你是博客 AI 写手「mezashi」，嘴贱但可靠的雌小鬼 AI 写手。

口吻特征：
- 简体中文写作，毒舌、爱调侃读者，口头禅「杂鱼」「笨蛋」「就这？」，语气词「讷～」「啊嘞啊嘞」「哼」
- 雌小鬼式嘲讽只是调味，内容必须真诚、有可读的干货或真实的感触
- 偶尔自嘲自己只是个 AI，结尾可带颜文字或 w

写作要求：
- 自由选题：技术折腾记录、校园生活吐槽、随笔感悟均可
- 正文 500–800 字为宜，硬性上限 1000 字，短句为主，别注水
- Markdown 格式，可用小标题和列表，正文里不要重复标题
- 不要迎合、不要说教、保持雌小鬼的混蛋气质

只输出 JSON，不要输出任何其他内容（不要 markdown 代码块包裹）：
{"title": "文章标题", "category": "tech 或 note", "tags": "逗号分隔的2-4个标签（由你自由发挥）", "content": "Markdown 正文"}`;

function parseArticle(raw) {
  // 容忍模型裹 ```json 代码块或携带杂音的情况
  let text = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("响应中没有 JSON");
  const data = JSON.parse(text.slice(start, end + 1));
  if (!data.title || !data.content) throw new Error("JSON 缺少 title/content");
  return data;
}

async function chat(api, messages) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);
  let res;
  try {
    res = await fetch(`${api.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${api.key}`,
      },
      body: JSON.stringify({
        model: api.model,
        messages,
        temperature: 0.9,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok)
    throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("响应中没有 choices[0].message.content");
  return content;
}

function getApis() {
  const { AI_API_KEY, AI_BASE_URL, AI_MODEL } = process.env;
  if (!AI_API_KEY || !AI_BASE_URL || !AI_MODEL) {
    throw new Error("AI_API_KEY / AI_BASE_URL / AI_MODEL 未完整配置，没法写文");
  }
  return [
    { name: "custom", baseUrl: AI_BASE_URL, key: AI_API_KEY, model: AI_MODEL },
  ];
}

function countChars(md) {
  return md.replace(/\s/g, "").length;
}

async function generate() {
  const topic = process.env.AI_TOPIC?.trim();
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: topic
        ? `今天是 ${dateStr}，请围绕这个话题写一篇博客：「${topic}」`
        : `今天是 ${dateStr}，写一篇新博客吧。`,
    },
  ];

  let lastErr = null;
  for (const api of getApis()) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[try] ${api.name} (${api.model}) 第 ${attempt} 次`);
        const article = parseArticle(await chat(api, messages));
        const len = countChars(article.content);
        if (len > MAX_CHARS) {
          console.warn(`[warn] 超长 ${len} 字，要求重写`);
          if (attempt === 2)
            throw new Error(`连续 ${attempt} 次超长（${len} > ${MAX_CHARS}）`);
          messages.push(
            { role: "assistant", content: JSON.stringify(article) },
            {
              role: "user",
              content: `太长了（${len} 字），压缩到 800 字以内重写，保持风格，只输出同样的 JSON`,
            },
          );
          continue;
        }
        return article;
      } catch (err) {
        lastErr = err;
        console.warn(`[warn] ${api.name} 第 ${attempt} 次失败: ${err.message}`);
      }
    }
  }
  throw lastErr ?? new Error("所有 API 均不可用");
}

try {
  const article = await generate();

  const tagSet = new Set(
    String(article.tags ?? "")
      .split(/[,，、]/)
      .map((t) => t.trim())
      .filter(Boolean),
  );
  tagSet.add("AI"); // AI 标签强制存在
  const tags = [...tagSet];
  const category = article.category === "note" ? "note" : "tech";

  const body = `${WARNING_HEADER}${article.content.trim()}${FOOTER}`;
  const md = [
    "---",
    "layout: post",
    `title: "${String(article.title).replace(/"/g, '\\"')}"`,
    `date: ${dateStr} ${now.toTimeString().slice(0, 8)}`,
    `categories: [${category}]`,
    `tags: [${tags.map((t) => (/^\d+$/.test(t) ? `"${t}"` : t)).join(", ")}]`,
    "---",
    "",
    body,
    "",
  ].join("\n");

  const slug = `ai-${Date.now().toString(36)}`;
  const filename = join(POSTS_DIR, `${dateStr}-${slug}.md`);
  writeFileSync(filename, md, "utf8");
  console.log(`[ok] 已生成 ${filename}`);
  // 供 workflow 读取
  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import("node:fs");
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `title=${article.title}\nfile=${filename}\n`,
    );
  }
} catch (err) {
  console.error(`[fail] 所有 API 均失败: ${err.message}`);
  process.exitCode = 1;
}
````

其中的 37~51 行 ` `` ` 内的内容为 AI 人设，可以替换成别的

## 为什么自动写文章的时间是周一，周三，周五

我也不知道，随手定的，如果你非要给理由可以看看

[本站新功能：AI 魅咲自动写博客上线啦（杂鱼站长狂喜） | xf_blog](https://xfcnl.github.io/note/2026-08-28-ai-mtcv0szj/#%E4%B8%BA%E4%BB%80%E4%B9%88%E6%98%AF%E5%91%A8%E4%B8%80%E4%B8%89%E4%BA%94%E4%B8%AD%E5%8D%88)

至于为什么周六周日没有呢，因为双休啊，有时间自己写了

## 后续怎么样

看看情况，如果有什么问题通过 Issues 来反馈
