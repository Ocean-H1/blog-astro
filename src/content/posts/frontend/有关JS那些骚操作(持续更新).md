---
title: 有关JS的一些常见技巧(持续更新)
category: 前端
description: 有关JS的一些常见技巧(持续更新)
published: 2023-04-19T00:00:00.000Z
tags:
  - JS
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png'
---

## 1. 如何使 `a==1&&a==2&&a==3`成立?

:::tip

​		按照常规的情况下，这显然不可能，但是JS是单线程的，即使写在一行，也是从左到右执行的，也就是说他们从时空上说就不是同时发生的。

​		因为是双等号，所以也涉及隐式类型转换的问题

​		此外，在JS中，几乎所有对象都有`valueOf`方法，这是一个内置方法，用于返回对象的原始值，当需要将对象转化成原始值时，会自动调用这个方法，所以我们来重写这个方法来实现这个需求

:::

```javascript
const a = {
  value: 1,
  valueOf: function () {
    return this.value++
  }
}
console.log(a == 1 && a == 2 && a == 3);
```

## 2. 使用`Object.prototype.toString.call(obj)`检测对象类型

:::

​		首先，直接使用`typeof`判断一个对象的类型是不准确的，比如`null`的结果也是Object,数组的结果也是Object。

​		我们可以通过Object原型上的toString方法可以很好的区分各种类型

:::

```javascript
console.log(Object.prototype.toString.call("jerry"));//[object String]
console.log(Object.prototype.toString.call(12));//[object Number]
console.log(Object.prototype.toString.call(true));//[object Boolean]
console.log(Object.prototype.toString.call(undefined));//[object Undefined]
console.log(Object.prototype.toString.call(null));//[object Null]
console.log(Object.prototype.toString.call({name: "jerry"}));//[object Object]
console.log(Object.prototype.toString.call(function(){}));//[object Function]
console.log(Object.prototype.toString.call([]));//[object Array]
console.log(Object.prototype.toString.call(new Date));//[object Date]
console.log(Object.prototype.toString.call(/\d/));//[object RegExp]
```

