---
title: JS中使用Array.apply()初始化数组
published: 2022-07-24
description: 'JS中使用Array.apply()初始化数组'
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png'
tags: [JS]
category: 前端
draft: false 
---

## 遇到问题:lock:

:::warning

​	今天在使用`Array`构造函数初始化数组的时候遇到问题,代码如下:

:::

```javascript
  Array(10).forEach(function(){
    // do something ... ...
  })
```

:::danger

​	这样写的结果是，并**不会**进入`forEach`的遍历

:::

:::tip 

​	经过查询`mdn`之后发现:

* `forEach`方法按升序,为数组中含有**有效值**的每一项执行一次`callback`函数,哪些已经删除(使用`delete`方法等)或者**未初始化**的项,将会被跳过(**但不包括值为undefined的项**)(例如在稀疏数组上)

通过`Array(10)`或者 `new Array(10) `方式创建的数组是一个有`length`属性的空数组,其中每个元素还没有被赋值(未初始化),所以会被`forEach`等方法跳过

:::

## 解决问题:key:

:::tip

​	今天在学习的过程中，遇到需要快速生成一个数组的需求，看到了别人利用`apply`方法，发现能解决这个问题。代码如下: 

:::


```typescript
let list = ref(Array.apply(null, { length: 81 } as number[]).map((_, index) => {
    // do something ... ...
}))
```

```javascript
// 这三个方法返回的是一个长度为10的数组，且每一个元素都被赋值成undefined

Array.apply(null, {length: 10}) 
Array.apply(null, Array(10)) 
Array.apply(null, new Array(10)) 

// [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]
```

:::tip 

​	下面是`mdn`关于`Array`的引用:

* Array 构造器会根据给定的元素创建一个 JavaScript 数组， 但是当仅有一个参数且为数字时除外: 一个范围在 0 到 232-1 之间的整数， 此时将返回一个` length` 的值等于 `arrayLength 的数组对象（言外之意就是该数组此时并没有包含任何实际的元素， 不能理所当然地认为它包含` `arrayLength`个值为 `undefined` 的元素）。 注意，后面这种情况仅适用于用 Array 构造器创建数组，而不适用于用方括号创建的数组字面量。

:::

:::tip	

然后是`apply`方法:

* 第一个参数: 调用时指定的上下文(context)
* 第二个参数: 一个数组或一个**类数组对象**

由于 我们在第二个参数传入了一个具有`length`属性的对象，所以它将会被看作 类数组对象

​											:arrow_down:

所以，相当于给 `Array()`传入了一个length为10 的空数组 

​											:arrow_down:

 于是，把空数组中每项的值逐个传入`Array`,而这些值都是`undefined`



:::



```javascript
  // 伪代码
  var arrayLike = {length: 2}
          ↓↓
  Array.apply(null, arrayLike)
          ↓↓
  Array(arrayLike[0], arrayLike[1]) // 把一个空数组中的每一个元素的值逐个传入Array()方法
          ↓↓
  Array(undefined, undefined) // 而空数组中的每一个元素的值都为undefined
```

另外`es6`提供了`Array.from()`可以做到相同的结果

```javascript
  Array.from({length: 5})
  // [undefined, undefined, undefined, undefined, undefined]
```

利用扩展运算符的另外一种写法:

```javascript
  Array(...Array(5))
  // 或
  [...Array(10)]
  // [undefined, undefined, undefined, undefined, undefined]
```



