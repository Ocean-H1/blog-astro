---
title: 手写instanceof方法
published: 2022-11-22
description: 'JS中手写instanceof方法'
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png'
tags: [JS]
category: 前端
draft: false 
---

```javascript
function myInstanceof(left, right) {
    // 1.获取对象原型
    let proto = Object.getPrototypeOf(left)
    // 2.获取构造函数的prototype对象
    let prototype = right.prototype
    // 3.判断构造函数的prototype是否在该对象的原型链上
    while(true) {
        if(!proto)	return false
        if(proto === prototype) return true
        proto = Object.getPrototypeOf(proto)
    }
}
```

