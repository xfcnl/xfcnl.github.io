---
layout: post
title: "在Windows下，怎么修改账户的user文件夹名称"
date: 2026-06-13
tags: [windows, 用户组, 改名, 分享]
---

在电脑的使用中，你难免回需要使用一些高难度操作，例如

**修改 Windows 用户文件夹名称**

## 开始前，你需要有

- 一台 Windows 系统的电脑（这里以 Windows 10 为例）
- 一个可以用的键盘
- 一个正常工作的鼠标

## 新建一个账户

点击开始菜单 设置 账户 家庭和其他用户 其他用户 将其他人添加进此计算机

在弹出的框框里点击 我没有这个人的登录信息 添加一个没有Microsoft账户的用户

接着输入已经用户名 密码可以留空 （如果这个账户你要长期使用建议设置一个密码）

创建账户之后点击改账户 更改账户类型 弹出的框框里的账户类型里将标准账户改为管理员

## 切换账户

按下键盘上的 CTRL+alt+del 组合键 点击屏幕上的切换账户切换至刚刚创建好的账户

## 重命名文件夹

打开资源管理器 的 c:\user 找到要重命名的文件夹右键进行重命名（建议为纯英文，防止出现软件不兼容）

## 修改注册表

如果就这样的话，系统是无法识别的，需要修改注册表

在开始菜单或者搜索注册表编辑器 在注册表编辑器找到找到`HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList`

逐个点开左侧ssid,在右侧窗口中找到 ProfileImagePath c:\user\{旧文件夹名} 为并修改为 c:\user\{刚刚修改的好的} 并保存

## 常见问题

如果遇到 文件夹正在被使用 ，可以在 [GitHub](https://github.com/microsoft/PowerToys) 或者 [微软商店](https://apps.microsoft.com/detail/xp89dcgq3k6vld?hl=zh-CN&gl=CN)找到一个叫做PowerToys的软件

注：PowerToys仅在GitHub和微软商店发行，从其他渠道获取的PowerToys安全性未知，建议从官方渠道获取

在PowerToys找到名为File Locksmith并开启，右键需要重命名的文件夹，点击解锁，如果找不到就点击以管理员身份重启
