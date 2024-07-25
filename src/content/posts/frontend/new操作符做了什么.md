---
title: new操作符都干了什么
category: 前端
description: new操作符都干了什么
published: 2022-08-05T00:00:00.000Z
tags:
  - JS
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png'
---

## `new`是什么

因为比较简单，直接看一个例子复习一下:

```javascript
function Person(name,age) {
    this.name = name
    this.age = gae
}
Person.prototype.sayName = function () {
    console.log(this.name)
}
const p1 = new Person('Ocean',20)
console.log(p1)	// Person {name:'Ocean',age:20}
p1.sayName() // 'Ocean'
```

> * `new` 通过构造函数 `Person` 创建出来的实例可以访问到构造函数中的属性
> * `new` 通过构造函数 `Person` 创建出来的实例可以访问到构造函数原型链中的属性（即实例与构造函数通过原型链连接了起来）

### 1. 在构造函数中显式加上返回值，并且返回值是一个原始类型

```javascript
function Test(name) {
    this.name = name
    return 1
}
const t = new Test('Ocean')
console.log(t.name) // 'Ocean'
```

:::tip

​	可以发现，构造函数中返回一个原始值，然而这个返回值并没有作用

:::

### 2. 在构造函数中返回一个对象

```javascript
function Test(name) {
    this.name = name
    console.log(this) // Test {name:'Ocean'}
    return {age:20}
}
const t = new Test('Ocean')
console.log(t) // {age:20}
console.log(t.name) // undefined
```

:::warning

​	从上面可以发现，构造函数如果返回值为一个对象，那么这个返回值会被正常使用

:::

## `new`的流程:label:

:::tip

* 创建一个新的对象`obj`
* 将对象与构造函数通过原型链连接起来
* 将构造函数中的this绑定到新建的对象上
* 根据构造函数返回类型作判断，如果是原始值则忽略，如果返回的是对象，就正常处理

:::

## 手写`new`操作符:label:

### 实现

```javascript
function my_new(Func,...args) {
    // 创建一个新对象
    const obj = {}
    // 新对象的原型指向构造函数原型对象
    obj._proto_ = Func.prototype
    // 将构造函数的this指向新对象
    let result = Func.apply(obj,args)
    // 根据返回值判断
    return result instanceof Object? result : obj
}
```

### 测试

```javascript
function my_new(Func,...args) {
    // 创建一个新对象
    const obj = {}
    // 新对象的原型指向构造函数原型对象
    obj._proto_ = Func.prototype
    // 将构造函数的this指向新对象
    let result = Func.apply(obj,args)
    // 根据返回值判断
    return result instanceof Object? result : obj
}
function Person(name,age) {
    this.name = name
    this.age = age
}
Person.prototype.say = function () {
    console.log(this.name)
}
let p = my_new(Person,'Ocean',20)
console.log(p) // Person {name:'Ocean',age:20}
p.say() // 'Ocean'
```

## `new.target的应用`

:::tip

`new.target`属性允许你检测函数或构造方法是否是通过new运算符被调用的

在通过new运算符被初始化的函数或构造方法中，`new.target`返回一个指向构造方法或函数的引用。在普通的函数调用中，`new.target` 的值是undefined。

:::

```javascript
function Foo() {
  if (!new.target) throw "Foo() must be called with new";
  console.log("Foo instantiated with new");
}

Foo(); // throws "Foo() must be called with new"
new Foo(); // logs "Foo instantiated with new"
```

