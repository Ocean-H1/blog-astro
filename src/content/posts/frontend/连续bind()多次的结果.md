---
title: JS中连续bind()多次的结果
published: 2022-08-12
description: '介绍Bind的原理，以及JS中连续bind()多次的结果'
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png'
tags: [JS]
category: 前端
draft: false 
---

## 题目

### 连续bind()多次，输出的值是什么？

```javascript
var bar = function(){
    console.log(this.x);
}
var foo = {
    x:3
}
var sed = {
    x:4
}
var func = bar.bind(foo).bind(sed);
func(); //?
 
var fiv = {
    x:5
}
var func = bar.bind(foo).bind(sed).bind(fiv);
func(); //?
```

### 答案是 两次都输出3

:::tip

在js中，多次`bind()`只有第一次绑定会生效

:::

## 简单分析:key:

![](https://img-blog.csdnimg.cn/bc3da44fa2d048528171944cfde800a4.png#pic_center)

:::tip 结论

* **后面的bind只能改变上一个bind的this指向**，例如`foo.bind(obj).bind(obj2)`改变的是`foo.bind(obj)的指向`;最终foo执行绑定的this是由第一次bind决定
* 因此不管foo执行多少bind，都是第一次bind绑定的对象

:::