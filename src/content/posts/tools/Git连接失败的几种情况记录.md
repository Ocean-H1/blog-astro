---
title: Git连接失败的几种情况
published: 2025-01-01
description: 'Git连接失败的几种情况及解决方案记录'
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/git.png'
tags: [Git]
category: tools
draft: false 
---

## 场景1: 使用vpn，导致系统端口号与git端口号不一致
### 报错信息如下：
:::CAUTION
`Failed to connect to github.com port 443 after 21090 ms: Couldn‘t connect to server` ‍
:::
### 解决办法：
:::tip
  1.查看系统端口号：
  打开“`设置 -> 网络和Internet -> 代理`”，记录下当前的端口号  
  2.Git全局代理配置：
  `git config --global http.proxy 127.0.0.1:<你的端口号>`  
  `git config --global https.proxy 127.0.0.1:<你的端口号>`  
  3.刷新dns缓存后重试
:::

:::note[未使用代理的情况：]
如果你并未使用vpn,但依然遇到上面的问题,可通过以下操作重新尝试进行排查：  
1.取消Git代理:  
`git config --global --unset http.proxy`  
`git config --global --unset https.proxy`  
2.关闭网络防火墙    
3.刷新DNS缓存     
4.更换其它网络    
5.访问[Github Status](https://www.githubstatus.com/)验证是否是github的问题    
:::