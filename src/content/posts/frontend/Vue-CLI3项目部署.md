---
title: Vue-CLI3项目部署后刷新页面404
description: 'Vue项目部署到服务器后，history路由模式刷新页面会报错404问题的原因及解决办法'
tags: [Vue]
published: 2022-03-21
category: 前端
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/vue.png'
draft: true 
---

## 为什么history模式下有问题

Vue是属于**单页面应用**，也就是SPA

> SPA是一种网络应用程序，所有与用户交互都是动态重写当前页面来实现页面变化的，这也就是为什么不管我们应用有多少页面，打包之后都只会产出一个`index.html`

现在，先来看一下nginx的配置

```
server {
  listen  80;
  server_name  www.xxx.com;

  location / {
    index  /data/dist/index.html;
  }
}
```

可以根据 nginx 配置得出，当我们在地址栏输入 www.xxx.com 时，
这时会打开我们 dist 目录下的 index.html 文件，然后我们在跳转路由进入到 www.xxx.com/login，

关键在这里，当我们在 www.xxx.com/login 页执行刷新操作，nginx location 是没有相关/login配置的，所以就会出现 404 的情况

## 为什么hash模式下没有问题

router hash 模式我们都知道是用符号#表示的

> 特点：
>
> * **hash 虽然出现在URL中，但不会被包括在HTTP 请求中**，对服务端完全没有影响
> * 所以改变hash不会重新向服务端发送请求，而改变hash，在hash模式中会被hashChange方法捕获，在Vue中会触发页面的修改
> * hash模式下，只有hash符号之前的内容会被包含在请求中，所以即使没有配置location，也不会返回404错误

## 解决方案

### 1. 路由使用hash模式

> 很显然，这样问题会直接解决，但是看着地址栏中的#号，还是不太舒服

### 2. 修改nginx配置文件

```nginx
    listen       80 default_server;
    listen       [::]:80 default_server;
    server_name 175.24.527.47;// 服务器ip地址
    index index.php index.html index.htm default.php default.htm default.html;
    root /www/wwwroot/dist.com; // vue文件得目录
    
    location / {
      #访问前端页面
    	root /www/wwwroot/dist.com;#vue项目存放路径
    	index  index.html; #hash模式只配置访问html就可以了
    	try_files $uri $uri/ /index.html;#history模式配置否则会出现vue的路由在nginx中刷新出现404
    }
```

```
# 变量解释
try_files  固定语法
$uri       指代home文件(ip地址后面的路径，假如是127.0.0.1/index/a.png，那就指代index/a.png)
$uri/      指代home文件夹

try_files $uri $uri/ /index.html;
尝试解析下列2个文件/文件夹(自动分辨出，IP后面的路径是文件还是文件夹)， $uri/$uri/，
如果解析到，返回第一个，
如果都没有解析到，向127.0.0.1/index.html发起请求跳
```

### 3.以宝塔面板举例

#### 3.1 打开软件商店找到nginx

![](https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/202303051701048.png)

#### 3.2 打开设置，查看nginx配置文件存放目录

![](https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/202303051704616.png)

#### 3.3 进入配置文件目录，打开要修改Vue项目的配置文件

![](https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/202303051704617.png)

#### 3.4 修改配置文件，添加配置

![](https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/202303051704618.png)

#### 3.5 完成之后，记得重载配置

![](https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/202303051704619.png)
