// 友链申请审核脚本
// 从 Issue body 解析字段 → 校验 → 通过则追加到 link.yaml
// 供 .github/workflows/add-link.yml 调用
//
// 环境变量：
//   GITHUB_REPOSITORY     repo 名（owner/repo）
//   ISSUE_NUMBER          Issue 号
//   GITHUB_TOKEN          有 issues 写权限的 token
//   INPUT_NAME_URL_DESC...
// 实际字段通过 stdin 接收 JSON：
//   {"name":"","url":"","desc":"","avatar":"","linkpage":""}

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const repo = process.env.GITHUB_REPOSITORY;
const issueNumber = process.env.ISSUE_NUMBER;
const token = process.env.GITHUB_TOKEN;

const LINK_YAML = "source/_data/link.yaml";
const SITE = "xfcnl.github.io";

const api = "https://api.github.com";

const TIMEOUT_MS = 15000;

async function gh(method, path, body) {
  const res = await fetch(api + path, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      "accept": "application/vnd.github+json",
      "user-agent": "add-link",
      "content-type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`GitHub API ${method} ${path} → ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

async function parseInput() {
  const issue = await gh("GET", `/repos/${repo}/issues/${issueNumber}`);
  const body = issue.body || "";
  const pick = (label) => {
    const m = body.match(new RegExp(`### ${label}\\s*\\n+([\\s\\S]*?)(?=\\n### |$)`));
    return m ? m[1].trim() : "";
  };
  return {
    name: pick("网站名称"),
    url: pick("可访问链接"),
    desc: pick("网站描述"),
    avatar: pick("网站头像链接"),
    linkpage: pick("友链页面链接"),
  };
}

function validUrl(value) {
  try {
    const u = new URL(value);
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".");
  } catch {
    return false;
  }
}

function hostnameOf(value) {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function comment(markdown) {
  return gh("POST", `/repos/${repo}/issues/${issueNumber}/comments`, { body: markdown });
}

async function main() {
  const input = await parseInput();
  const { name, url, desc, avatar, linkpage } = input;
  console.log(`[add-link] 收到申请: ${name} (${url})`);

  const problems = [];

  // 1. 字段齐全 + 校验缺失
  if (!name) problems.push("**网站名称**不能为空");
  if (!desc) problems.push("**网站描述**不能为空");
  if (!validUrl(url)) problems.push("**可访问链接**格式不对，需要完整的 http(s) 地址");
  if (!validUrl(avatar)) problems.push("**网站头像链接**格式不对，需要完整的 http(s) 地址");
  if (!validUrl(linkpage)) problems.push("**友链页面链接**格式不对，需要完整的 http(s) 地址");

  if (problems.length) {
    await comment("❌ 友链申请失败：\n\n" + problems.map((p) => `- ${p}`).join("\n"));
    process.exit(0);
  }

  // 2. 域名一致性：友链页面 hostname 必须与可访问链接完全一致
  if (hostnameOf(linkpage) !== hostnameOf(url)) {
    await comment(
      "❌ 友链申请失败：**友链页面链接**的域名和**可访问链接**不一致，\n" +
        `可访问：\`${hostnameOf(url)}\`，友链页：\`${hostnameOf(linkpage)}\`。\n` +
        "请确保两者域名完全相同（例如 https://blog.example.com 的友链页必须是 blog.example.com/xxx）。",
    );
    process.exit(0);
  }

  // 3. 可访问性
  const fail = (msg) => comment("❌ 友链申请失败：\n\n" + msg);
  const ok = (msg) => comment("✅ " + msg);

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const r1 = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "user-agent": "Mozilla/5.0 (compatible; link-checker/1.0)" },
    });
    clearTimeout(t);
    if (!(r1.status >= 200 && r1.status < 400)) {
      await fail(`**可访问链接**返回了 HTTP ${r1.status}，无法访问。`);
      process.exit(0);
    }
  } catch {
    await fail(`**可访问链接** ${url} 无法访问（连接超时或 DNS 解析失败）。`);
    process.exit(0);
  }

  // 4. 头像可访问
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const r2 = await fetch(avatar, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "user-agent": "Mozilla/5.0 (compatible; link-checker/1.0)" },
    });
    clearTimeout(t);
    if (!(r2.status >= 200 && r2.status < 400)) {
      await fail(`**网站头像链接**返回了 HTTP ${r2.status}，头像加载不出来。`);
      process.exit(0);
    }
  } catch {
    await fail(`**网站头像链接** ${avatar} 无法访问。`);
    process.exit(0);
  }

  // 5. 反链检查：友链页面必须包含本站链接
  let html = "";
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const r3 = await fetch(linkpage, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "user-agent": "Mozilla/5.0 (compatible; link-checker/1.0)" },
    });
    clearTimeout(t);
    html = await r3.text();
  } catch {
    await fail(`**友链页面链接** ${linkpage} 无法访问（连接超时或 DNS 解析失败）。`);
    process.exit(0);
  }
  if (!html.includes(SITE)) {
    await fail(
      `**友链页面链接** ${linkpage} 没有发现指向本站（${SITE}）的链接，\n` +
        "请在自己的友链页添加本站友链后再来申请。",
    );
    process.exit(0);
  }

  // 6. 去重：可访问链接是否已存在
  if (existsSync(LINK_YAML)) {
    const existing = readFileSync(LINK_YAML, "utf8");
    if (existing.includes(url) || existing.includes(hostnameOf(url))) {
      await ok(`友链 \`${name}\` 已经在列表里了，无需重复添加。`);
      await gh("PATCH", `/repos/${repo}/issues/${issueNumber}`, { state: "closed" });
      process.exit(0);
    }
  }

  // 7. 追加到 link.yaml
  const yamlName = yamlQuote(name);
  const yamlUrl = yamlQuote(url);
  const yamlAvatar = yamlQuote(avatar);
  const yamlDesc = yamlQuote(desc);
  const block =
    `- name: ${yamlName}\n` +
    `  url: ${yamlUrl}\n` +
    `  avatar: ${yamlAvatar}\n` +
    `  desc: ${yamlDesc}\n`;

  // 每个条目之间必须空一行，前面保证恰好一个空行
  let existing = existsSync(LINK_YAML) ? readFileSync(LINK_YAML, "utf8") : "";
  if (existing && !existing.endsWith("\n\n")) {
    if (existing.endsWith("\n")) existing += "\n";
    else existing += "\n\n";
  }
  const content = existing + block;
  writeFileSync(LINK_YAML, content);

  await ok(
    `友链 \`${name}\` 已添加！\n\n本 Issue 会自动关闭，网站构建后即可在 [友链页](https://${SITE}/link/) 看到。`,
  );
  await gh("PATCH", `/repos/${repo}/issues/${issueNumber}`, { state: "closed" });

  process.stdout.write("::notice::link added\n");
}

function yamlQuote(value) {
  const v = String(value ?? "");
  // 简单安全判断：避免 YAML 特殊字符解析出错
  if (/[:#\[\]{}&*!|>'"%@`,?\s]/.test(v) || v === "" || /^\s|\s$/.test(v)) {
    return JSON.stringify(v);
  }
  return v;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});