---
title: 跨域方案之CORS || Nginx反向代理
published: 2022-11-24
description: '跨域方案之CORS || Nginx反向代理'
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png'
tags: [JS]
category: 前端
draft: false 
---

## 一、 `CORS`跨域资源共享

:::tip

CORS(Cross-Origin Resource Sharing)即跨域资源共享。需要浏览器(都支持)和服务器都支持，所以只需要服务器支持，就可以跨域通信。CORS请求分两类: **简单请求** 和 **非简单请求**

此外，CORS请求 **默认不包含Cookie以及HTTP认证信息**，如果需要包含Cookie，需要满足几个条件: 

- 服务器指定了`Access-Control-Allow-Credentials: true`
- 开发者需在请求中打开`withCredentials`属性: `xhr.withCredentials = true`
- `Acess-Control-Allow-Origin`不要设为`*`,指定明确的与请求网页一致的域名，这样就不会把其他域名的Cookie上传

:::

### 1.1 简单请求

:::tip

如果同时满足以下两个条件，就属于简单请求:

- 请求方法是: `HEAD、GET、POST`三者其一
- 请求头信息不超过以下几个字段：
  - `Accept`
  - `Accept-Language`
  - `Content-Language`
  - `Last-Event-Id`
  - `Content-Type`: 值为三者之一 ->  `application/x-www/form/urlencoded`、`multipart/form-data、text/plain`

需要这些条件是为了兼容表单，因为历史上表单一直可以跨域

浏览器直接发出CORS请求，具体来说就是在头信息中增加`Origin`字段,表示请求来源来自那个域(协议+域名+端口)，服务器根据这个值决定是否同意请求。如果同意，返回的响应会多出以下响应头信息

```javascript
Access-Control-Allow-Origin: http://xxx.xxx		// 和Origin一致 这个字段是必须的
Access-Control-Allow-Credentials: true	// 表示是否允许发送Cookie 这个字段是可选的
Aceess-Control-Expose-Headers: FooBar	// 指定返回其他字段的值	这个字段是可选的
Content-Type: text/html;charset = uft-8	// 表示文档类型
```

在简单请求中服务器至少需要设置: `Access-Control-Allow-Origin`字段

:::

### 1.2 非简单请求

:::tip

比如`PUT`或`DELETE`请求，或`Content-Type`为`application/json`,就是非简单请求

非简单CORS请求,**正式请求前会发一次OPTIONS类型的查询请求**,成为`预检请求`,询问服务器是否支持网页所在域名的请求，以及可以使用哪些头信息字段。只有收到肯定的答复，才会发起正式XMLHttpRequest请求，否则报错

预检请求的方法是OPTIONS,它的头信息中有几个字段

- `Origin`: 表示请求来自哪个域，这个字段是必须的
- `Access-Control-Request-Method`: 列出CORS请求会用到哪些HTTP方法，这个字段是必须的
- `Access-Control-Request-Headers`: 指定CORS请求会额外发送的头信息字段，用逗号隔开

但OPTIONS请求次数过多也会损耗性能，所以要尽量减少OPTIONS请求，可以让服务器在请求返回头部添加: 

```javascript
Access-Control-Max-Age: Number // 数字 单位是秒
```

表示预检请求的返回结果可以被缓存多久，在这个事件范围内再请求就不需要预检了。不过这个缓存只对完全一样的URL才会生效

:::

## 二、Nginx反向代理

配置一个代理服务器向服务器请求，再将数据返回给客户端，实质和CORS跨域原理一样，需要配置请求响应头`Access-Control-Allow-Origin`等字段

```javascript
server {
    listen 81;server_name www.domain1.com;
    location / {
        proxy_pass http://xxxx1:8080; // 反向代理
        proxy_cookie_domain www.xxx1.com www.xxxx2.com; // 修改cookie域名
        index index.html index.htm
        // 当用webpack-dev-server等中间件代理接口访问nignx时，此时无浏览器参与，故没有同源限制，下面的跨域配置可不启用 
        add_header Access-Control-Allow-Origin http://www.xxxx2.com; // 当前端只跨域不带cookie时，可为* 
        add_header Access-Control-Allow-Credentials true; 
    }
}
```

