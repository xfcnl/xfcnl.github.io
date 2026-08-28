"use strict";

const fs = require("fs");
const path = require("path");

const HOSTS = ["xfcnl.github.io", "husd.cc.cd", "blog.sfvg.de5.net"];
const ENDPOINT = "https://api.indexnow.org/indexnow";

function readUrls() {
  const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  const urls = [];
  const regex = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = regex.exec(sitemap)) !== null) {
    urls.push(match[1].trim());
  }
  return urls;
}

function rewriteHost(url, host) {
  const u = new URL(url);
  return u.protocol + "//" + host + u.pathname + u.search + u.hash;
}

async function submit(host, key, urlList) {
  let failed = 0;
  let ok = 0;
  for (const url of urlList) {
    const target =
      ENDPOINT +
      "?url=" +
      encodeURIComponent(url) +
      "&key=" +
      encodeURIComponent(key);
    const res = await fetch(target);
    if (res.ok) {
      ok++;
    } else {
      failed++;
      console.log("  [" + host + "] " + res.status + " " + url);
    }
  }
  console.log(
    "[" + host + "] ok=" + ok + " failed=" + failed + " (of " + urlList.length + ")"
  );
  return failed === 0;
}

async function main() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    throw new Error("INDEXNOW_KEY env is not set");
  }
  const urls = readUrls();
  if (!urls.length) {
    throw new Error("No URLs found in public/sitemap.xml");
  }
  console.log("Submitting " + urls.length + " URLs for " + HOSTS.length + " hosts");

  let allOk = true;
  for (const host of HOSTS) {
    const urlList = urls.map((u) => rewriteHost(u, host));
    allOk = (await submit(host, key, urlList)) && allOk;
  }
  if (!allOk) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
