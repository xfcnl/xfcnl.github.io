# xf_blog

[github 线路](https://xfcnl.github.io)　[cloudflare 线路](https://husd.cc.cd)　[edgeone 线路](https://blog.sfvg.de5.net)

## 一点点介绍

这是我拿 github 官方主题 primer 改的，这个主题本身是给项目仓做库介绍网页做的，但我改成了博客

所以我称它为……

<h1 align="center">primer for blog</h1>

###### 好中二啊

## 怎么使用

在 **\_posts** 和 **\_note** 下新建格式为 **YYYY-MM-DD-title.md** 的文件

在 **\_posts** 和 **\_note** 下的文件内容开头必须有下面这段内容

```yaml
---
layout: post
title: "title"
date: YYYY-MM-DD
tags: [tag, tags]
---
```

- layout: post ： 布局，必须，不可改
- title: "title" ： 标题，""内的内容可改
- date: YYYY-MM-DD ： 时间，将YYYY-MM-DD改为实际时间，例如2012-02-28
- tags: [tag, tags] ：标签，可以给你的文章家点标签，记住标签之间用英文逗号分开，且逗号后面要有空格

## 怎么部署

这是我的自用博客，并没有开放一个模板

但我可以给你一个思路

### 文章

进入 **\_posts** 和 **\_note** ， 将文件里面的文件全部删除

### 布局

我自己定制了 **\_layouts** 文件夹下的 **default.html** **page.html** **post.html**，你需要自己修改

### 数据统计代码

**\_includes** 文件夹下存放着网站的统计代码（谷歌统计，微软统计，umami统计）不需要可以删除，也可以改成你自己的

### 网站样式

**assets/css** 文件夹下为我对原主题作的深色模式但没做切换（也就是说只有深色模式），可以删除或修改

## 本地预览

确保已安装 Ruby 和 Bundler，然后在项目根目录运行：

```bash
bundle install
bundle exec jekyll serve
```

浏览器打开 `http://localhost:4000` 即可预览。

```bash
bundle exec jekyll serve --livereload
```

使用这条命令可以在本地启动一个具有实时预览功能的本地服务器
