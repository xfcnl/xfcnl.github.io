---
layout: post
title: "让cf worker代理你的GitHub静态资源"
date: "2026--:day"
categories: [tech]
tags: [worker, web]
---

我在某天做了个适用于 cf worker 的用于代理 GitHub 静态资源的应用

[项目地址](https://github.com/xfcnl/static-origin)

## 使用方法

[在 GitHub 查看](https://github.com/xfcnl/static-origin#usage)

## 为什么要做这个东西

- 闲，暑假也没没什么可以做的
- 我看很多的的类似项目是直接代理整个 GitHub ，而我这个是针对静态资源

## 怎么部署

### wrangler 部署

```sh
npm run deploy
```

如果没有 `wrangler` 需要先进行安装

### wrangler 的安装与配置

```sh
npm i -g wrangler # 全局安装 wrangler
```

```sh
wrangler login
```

输入之后终端会打印一个链接，将链接复制到你已经登录 cloudflare 账号的浏览器

如果是 VScode 的终端可以通过 `CTRL + 鼠标单击链接` 自动打开系统默认浏览器，但要保证系统默认浏览器已经登录 cloudflare账号

如果已经做好了可以返回 [wrangler 部署](#wrangler-部署)

### 网页版操作

打开项目的 [GitHub 页面](https://github.com/xfcnl/static-origin)

点击 fork 分叉仓储一份到你的 GitHub仓库下

打开你的 [cloudflare](https://dash.cloudflare.com)

导航到 workers and pages

点击新建应用程序

确保 cloudflare 账号已经绑定 GitHub 账号，点击continue with GitHub

如果没有绑定 cloudflare 会引导你去绑定

选择你 fork 的仓库

部署命令为

```sh
npm run deploy
```
