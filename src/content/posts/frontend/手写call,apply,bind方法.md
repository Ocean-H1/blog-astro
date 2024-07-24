---
title: 手写call,apply,bind方法 
published: 2022-04-23
description: 'JS中手写call,apply,bind方法 '
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png'
tags: [JS]
category: 前端
draft: false 
---

:::tip

简单总结一下，手动实现JavaScript原生call,apply,bind方法

:::

## 一、如何改变js中this指向问题？:ocean:

### 1. 通过ES6的箭头函数(指向函数定义时的this)

### 2. 通过call,bind,apply改变this指向

## 二、call,bind,apply三者的主要区别:ocean:

> * call,bind,apply这三个方法的第一个参数都是 **this的指向对象**

> * 第二个参数： call和bind都是接收**参数列表**，apply接收的是一个**包含多个参数的数组**（也可以是类数组）

> * bind方法不会立即执行，而是返回一个新的函数，调用新函数的时候才会执行目标函数

## 三、手动实现call，bind，apply方法:ocean:

### 1.手动实现apply方法

```javascript
// 注意，并未进行错误判断
Function.prototype.myApply = function (context,args) {
    // 这里默认不传就指向window,也可以用es6语法给参数设置默认参数
    context = context || window
    args = args ? args : []
    // 给context新增一个独一无二的属性一面覆盖原有属性
    const key = Symbol()
    context[key] = this
    // 通过隐式绑定的方式调用函数
    const result = context[key](...args)
    // 删除添加的属性
    delete context[key]
    // 返回函数调用的返回值
    return result
}
```

### 2. 手动实现call方法

```javascript
// 与apply类似，只不过传递参数从一个数组编程逐个传参了,不用...扩展运算符的话也可以用arguments对象代替
Function.prototype.myCall = function (context,...args) {
    // 这里默认不传就是给window
    context = context || window
    const key = Symbol()
    context[key] = this
    // 通过隐式绑定的方式调用函数
    const result = context[key](...args)
    // 删除添加的属性
    delete context[key]

    return result
}
```

### 3. 初步实现bind方法

> `bind()`方法创建一个新的函数，在`bind()`被调用时，这个新函数的`this`被`bind`的第一个参数指定，其余的参数将作为新函数的参数供调用时使用。

```javascript
//要注意的是，bind方法不会立即执行，而是返回一个新函数
Function.prototype.myBind = function (context,...args) {
    //目标函数
    const fn = this
    
    return function newFn(...newFnArgs) {
        return fn.apply(context,[...args,...newFnArgs])
    }
}
```

:::danger

但是，请注意，如果直接这样写，当你使用构造函数new的时候，会有一些问题（导致new出来的实例与原型链断开）请看下面的例子

:::

```javascript
Function.prototype.myBind = function (context,...args) {
    const fn = this
    return function newFn(...newFnArgs) {
        return fn.apply(context,[...args,...newFnArgs])
    }
}
function func(...arg) {
    console.log(this)
    console.log(arg)
}

//在fnc的原型上定义一个方法
func.prototype.test = function() {
    console.log(this)
}

//下面我们使用构造函数测试一下

let newFunc1 = func.bind({a:1},1,2,3,4) // 原生的bind
let newFunc2 = func.myBind({a:1},1,2,3,4) // 我们的bind
let f1 = new newFunc1(5,6,7,8)
let f2 = new newFunc2(5,6,7,8)
console.log('-----原生bind-----')
console.log(f1.test) // 正确的test方法
console.log('-----myBind-----')
console.log(f2.test) // undefined
```

### 4. 最终实现bind方法

> 接下来我们来解决使用构造函数时的bug

```javascript
Function.prototype.myBind = function (context,...args) {
    const fn = this
    return function newFn(...newFnArgs) {
        if(this instanceof newFn) {
            // 在此加一个判断，如果这个被返回的函数作了构造函数的话，把args也作为参数传进去
            return new fn(...args,...newFnArgs)
        }
        return fn.apply(context,[...args,...newFnArgs])
    }
}
```

