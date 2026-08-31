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

// 定时触发时同日已有 AI 文章则跳过；手动触发（workflow_dispatch）即便有文章也照常写
const isScheduled = process.env.AI_TRIGGER === "schedule";
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
if (isScheduled && aiToday) {
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

// —— 热榜素材抓取 ——

async function fetchJson(url, options = {}, timeoutMs = 12_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchBiliTrending() {
  const data = await fetchJson(
    "https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all",
    {
      headers: { "User-Agent": "Mozilla/5.0", Referer: "https://www.bilibili.com" },
    },
  );
  const list = data?.data?.list;
  if (data?.code !== 0 || !Array.isArray(list))
    throw new Error("bilibili: 响应结构异常");
  return list.slice(0, 15).map((v) => ({
    title: v.title,
    url: `https://www.bilibili.com/video/${v.bvid}`,
  }));
}

async function fetchGithubTrending() {
  const since = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const data = await fetchJson(
    `https://api.github.com/search/repositories?q=created:%3E${since}&sort=stars&order=desc&per_page=10`,
    {
      headers: {
        "User-Agent": "xfcnl-blog",
        Accept: "application/vnd.github+json",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
    },
  );
  if (!Array.isArray(data?.items)) throw new Error("github: 响应结构异常");
  return data.items.slice(0, 10).map((r) => ({
    name: r.full_name,
    url: r.html_url,
    desc: r.description ?? "",
    stars: r.stargazers_count ?? 0,
    lang: r.language ?? "",
  }));
}

async function fetchZhihuTrending() {
  const secret = process.env.ZHIHU_ACCESS_SECRET?.trim();
  if (!secret) {
    console.log("[素材] zhihu: 未配置 ZHIHU_ACCESS_SECRET，跳过");
    return null;
  }
  const data = await fetchJson(
    "https://developer.zhihu.com/api/v1/content/hot_list?Limit=15",
    {
      headers: {
        Authorization: `Bearer ${secret}`,
        "X-Request-Timestamp": String(Math.floor(Date.now() / 1000)),
        "Content-Type": "application/json",
      },
    },
  );
  const items = data?.Data?.Items;
  if (data?.Code !== 0 || !Array.isArray(items))
    throw new Error("zhihu: 响应结构异常");
  return items.slice(0, 15).map((it) => ({ title: it.Title, url: it.Url }));
}

async function collectMaterials() {
  const dev = [];
  const life = [];
  const logs = [];
  const jobs = [
    ["github", async () => dev.push(...(await fetchGithubTrending()))],
    ["bilibili", async () => life.push(...(await fetchBiliTrending()))],
    [
      "zhihu",
      async () => {
        const z = await fetchZhihuTrending();
        if (z) life.push(...z);
      },
    ],
  ];
  await Promise.all(
    jobs.map(async ([name, fn]) => {
      try {
        await fn();
        logs.push(`${name}: ok`);
      } catch (err) {
        logs.push(`${name}: 失败(${err.message})`);
      }
    }),
  );
  logs.forEach((l) => console.log(`[素材] ${l}`));
  return { dev, life };
}

function pickTrendingTopic({ dev, life }) {
  // 50% 开发类（GitHub）/ 50% 生活类（B站+知乎）
  const coin = Math.random() < 0.5 ? "dev" : "life";
  let kind = coin;
  let pool = kind === "dev" ? dev : life;
  if (pool.length === 0) {
    kind = kind === "dev" ? "life" : "dev";
    pool = kind === "dev" ? dev : life;
    if (pool.length === 0) return null;
  }
  const item = pool[Math.floor(Math.random() * pool.length)];
  return { kind, pool, item };
}

function formatDevList(list) {
  return list
    .slice(0, 10)
    .map(
      (m, i) =>
        `${i + 1}. ${m.name}（⭐${m.stars}${m.lang ? ` / ${m.lang}` : ""}）\n   ${m.desc || m.url}\n   ${m.url}`,
    )
    .join("\n");
}

function formatLifeList(list) {
  return list
    .slice(0, 10)
    .map((m, i) => `${i + 1}. ${m.title}\n   ${m.url}`)
    .join("\n");
}

async function generate() {
  const topic = process.env.AI_TOPIC?.trim();
  const materials = await collectMaterials();

  let userContent;
  if (topic) {
    const ref = [formatDevList(materials.dev), formatLifeList(materials.life)]
      .filter(Boolean)
      .join("\n");
    userContent = `今天是 ${dateStr}，请围绕这个话题写一篇博客：「${topic}」${
      ref ? `\n\n（附今日热榜素材，可自由选用或忽略）：\n${ref}` : ""
    }`;
  } else {
    const pick = pickTrendingTopic(materials);
    if (pick) {
      const label = pick.kind === "dev" ? "开发/技术" : "生活/热点";
      const list =
        pick.kind === "dev" ? formatDevList(pick.pool) : formatLifeList(pick.pool);
      console.log(`[选题] 方向=${label}`);
      userContent = `今天是 ${dateStr}。以下是从今日热门抓到的【${label}】素材，挑一个你最有感触的话题写一篇博客（不要照搬素材标题，用自己的雌小鬼口吻展开）：\n\n${list}`;
    } else {
      console.log("[选题] 无可用素材，自由发挥");
      userContent = `今天是 ${dateStr}，写一篇新博客吧。`;
    }
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userContent },
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
