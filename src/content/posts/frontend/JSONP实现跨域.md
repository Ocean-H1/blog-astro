---
title: JSONP实现跨域
category: 前端
description: JSONP实现跨域
published: 2022-11-15T00:00:00.000Z
tags:
  - JS
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png'
---

## 什么是JSONP

:::tip

`JSONP`是`JSON`的一种'使用模式'，利用`JSONP`实现跨域的原理是，通过script标签向服务器端发送一个`get`请求，服务端返回一个`text/plain`格式的文件，文件内容是对一个方法的调用，并回传数据

所以我们可以通过在客户端定义一个回调函数来接收数据。在回调函数中客户端就可以拿到服务端返回的数据

:::

## 简单的实现:runner:

### 客户端:

```javascript
function jsonP({ url, params }) {
    return new Promise((resolve, reject) => {
        window.callback = function (data) {
            resolve(data)
            document.body.removeChild(script)
        }
        const arrs = []
        // 将参数对象转成键值对(key-value)形式
        for (let key in params) {
            arrs.push(`${key}=${params[key]}`)
        }

        let script = document.createElement('script')
        script.src = `${url}?${arrs.join('&')}&cb=callback`
        document.body.appendChild(script)
    })
}
```

### 服务端(`nodejs`为例):

```javascript
let express = require('express')
let app = express()
app.listen(8089)
app.get('/sayHello',(req,res) => {
    let {wd,cb} = req.query
    res.end(`${cb}('hello world')`)
})
```

### 客户端调用:

```javascript
jsonP({
    url: 'http://localhost:8089/sayHello',
    params: {
        wd:'hello you'
    }
}).then((res) => {
    console.log(res)
})
```

## `JSONP`实现跨域的缺点:bug:

:::danger

- 只能发送`get`请求,不支持其它请求
- 不安全，有遭受`XSS`攻击的风险，服务端返回的内容可以对网站内容进行篡改

:::
