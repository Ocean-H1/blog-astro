---
title: Ajax简单使用
category: 前端
description: Ajax简单使用
published: 2023-03-03T00:00:00.000Z
tags:
  - JS
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png'
---

## Ajax

## 描述

:::tip

`Ajax`在浏览器是通过`XMLHttpRequest`对象来实现数据传输的。

:::

```js
// `XMLHttpRequest`对象进行`HTTP`请求前必须通过open初始化，`open`接受五个参数，分别为请求方法、请求链接、异步标识、账号和密码用以服务端验证。
open(Method, URL, Asynchronous, UserName, Password)
//	在成功初始化请求之后，XMLHttpRequest对象的setRequestHeader方法可以用来设置请求头。
setRequestHeader(key,value)
//	调用open()方法后，就可以通过调用send()方法按照open方法设定的参数将请求进行发送。
send(Data)
//	当open方法设定发送的方式为异步请求时，onreadystatechange事件监听器将自动在XMLHttpRequest对象的readyState属性改变时被触发
switch(readyState){
    case 1: break; //当open方法被成功调用,readyState为1
    case 2: break; //当send方法被调用，readyState属性被置为2
    case 3: break; //HTTP响应内容开始加载，readyState属性被置为3
    case 4: break; //HTTP响应内容结束加载，readyState属性被置为4
}
//	如果XMLHttpRequest对象的readyState属性还没有变成4，abort可以终止请求。这个方法可以确保异步请求中的回调不被执行
abort()
```

### ajax简单使用

```javascript
function Ajax(url,method = 'GET',data = null,async = true) {
    let XHR = XMLHttpRequest;
    XHR = new XMLHttpRequest();
    XHR.onreadystatechange = function () {
        if(XHR.readyState === 4)
            console.log(`响应状态:${XHR.status}`,'FINISH');
    }
    XHR.open(method,url,async);
    XHR.send(data);
}
```

